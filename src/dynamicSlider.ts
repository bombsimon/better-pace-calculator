interface SliderRange {
  min: number
  max: number
  step: number
}

interface SliderConfig {
  ranges: SliderRange[]
  unit: string
  formatter?: (value: number) => string
}

export class DynamicSlider {
  private slider: HTMLInputElement
  private config: SliderConfig
  private onChangeCallback: (value: number) => void
  private isUpdating = false

  constructor(
    container: HTMLElement,
    config: SliderConfig,
    initialValue: number,
    onChange: (value: number) => void
  ) {
    this.config = config
    this.onChangeCallback = onChange

    // Create slider element
    this.slider = document.createElement('input')
    this.slider.type = 'range'
    this.slider.min = '0'
    this.slider.max = '100'
    this.slider.step = '0.1'
    this.slider.className = 'dynamic-slider'

    container.appendChild(this.slider)

    // Bind events
    this.slider.addEventListener('input', this.handleSliderChange.bind(this))

    // Set initial value
    this.setValue(initialValue)
  }

  private handleSliderChange() {
    if (this.isUpdating) return

    const sliderPercent = parseFloat(this.slider.value)
    const actualValue = this.percentToValue(sliderPercent)
    this.onChangeCallback(actualValue)
  }

  public setValue(value: number) {
    this.isUpdating = true
    const percent = this.valueToPercent(value)
    this.slider.value = percent.toString()
    this.isUpdating = false
  }

  private valueToPercent(value: number): number {
    const totalMin = this.config.ranges[0].min
    const totalMax = this.config.ranges[this.config.ranges.length - 1].max

    // Clamp value to total range
    value = Math.max(totalMin, Math.min(totalMax, value))

    let cumulativePercent = 0

    for (let i = 0; i < this.config.ranges.length; i++) {
      const range = this.config.ranges[i]
      const rangeSize = range.max - range.min
      const rangePercent = this.getRangeWeight(i) * 100

      if (value >= range.min && value <= range.max) {
        // Value is in this range
        const positionInRange = (value - range.min) / rangeSize
        return cumulativePercent + positionInRange * rangePercent
      }

      cumulativePercent += rangePercent
    }

    return 100 // Should not reach here
  }

  private percentToValue(percent: number): number {
    percent = Math.max(0, Math.min(100, percent))

    let cumulativePercent = 0

    for (let i = 0; i < this.config.ranges.length; i++) {
      const range = this.config.ranges[i]
      const rangePercent = this.getRangeWeight(i) * 100

      if (
        percent >= cumulativePercent &&
        percent <= cumulativePercent + rangePercent
      ) {
        // Percent is in this range
        const positionInRange = (percent - cumulativePercent) / rangePercent
        const rawValue = range.min + positionInRange * (range.max - range.min)

        // Round to nearest step
        const steppedValue = Math.round(rawValue / range.step) * range.step
        return Math.max(range.min, Math.min(range.max, steppedValue))
      }

      cumulativePercent += rangePercent
    }

    return this.config.ranges[this.config.ranges.length - 1].max
  }

  private getRangeWeight(rangeIndex: number): number {
    // Give more slider space to commonly used ranges
    if (this.config.ranges.length === 1) {
      return 1.0 // Single range gets full width
    }

    // Weights that add up to 1.0 based on number of ranges
    const weightsByRangeCount: { [key: number]: number[] } = {
      3: [0.3, 0.5, 0.2], // For 3 ranges (like speed)
      4: [0.25, 0.35, 0.25, 0.15], // For 4 ranges
      5: [0.25, 0.35, 0.25, 0.1, 0.05], // For 5 ranges (like pace)
    }

    const weights = weightsByRangeCount[this.config.ranges.length] || [1.0]
    return weights[rangeIndex] || 0.05
  }

  public updateConfig(newConfig: SliderConfig, currentValue: number) {
    this.config = newConfig
    this.setValue(currentValue)
  }
}

// Predefined configurations for each field type
export const SLIDER_CONFIGS = {
  pace: {
    metric: {
      ranges: [
        { min: 2.0, max: 4.0, step: 1 / 60 }, // 2:00-4:00, 1sec steps
        { min: 4.0, max: 6.0, step: 5 / 60 }, // 4:00-6:00, 5sec steps
        { min: 6.0, max: 10.0, step: 10 / 60 }, // 6:00-10:00, 10sec steps
        { min: 10.0, max: 15.0, step: 15 / 60 }, // 10:00-15:00, 15sec steps
        { min: 15.0, max: 20.0, step: 30 / 60 }, // 15:00-20:00, 30sec steps
      ],
      unit: 'min/km',
      formatter: (value: number) => {
        const minutes = Math.floor(value)
        const seconds = Math.round((value - minutes) * 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      },
    },
    imperial: {
      ranges: [
        { min: 3.2, max: 6.4, step: 1 / 60 }, // 2:00-4:00 metric equivalent, 1sec steps
        { min: 6.4, max: 9.7, step: 5 / 60 }, // Converted from metric
        { min: 9.7, max: 16.1, step: 10 / 60 },
        { min: 16.1, max: 24.1, step: 15 / 60 },
        { min: 24.1, max: 32.2, step: 30 / 60 },
      ],
      unit: 'min/mile',
      formatter: (value: number) => {
        const minutes = Math.floor(value)
        const seconds = Math.round((value - minutes) * 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
      },
    },
  },

  speed: {
    metric: {
      ranges: [
        { min: 3, max: 15, step: 0.1 }, // 3-15 km/h, 0.1 steps
        { min: 15, max: 25, step: 0.5 }, // 15-25 km/h, 0.5 steps
        { min: 25, max: 30, step: 0.5 }, // 25-30 km/h, 0.5 steps
      ],
      unit: 'km/h',
    },
    imperial: {
      ranges: [
        { min: 1.9, max: 9.3, step: 0.1 }, // Converted from metric
        { min: 9.3, max: 15.5, step: 0.3 },
        { min: 15.5, max: 18.6, step: 0.3 },
      ],
      unit: 'mph',
    },
  },

  distance: {
    metric: {
      ranges: [
        { min: 0.1, max: 5, step: 0.1 }, // 0.1-5km, 0.1 steps
        { min: 5, max: 20, step: 0.5 }, // 5-20km, 0.5 steps
        { min: 20, max: 50, step: 1.0 }, // 20-50km, 1km steps
        { min: 50, max: 100, step: 2.5 }, // 50-100km, 2.5km steps
      ],
      unit: 'km',
    },
    imperial: {
      ranges: [
        { min: 0.1, max: 3.1, step: 0.1 }, // Converted from metric
        { min: 3.1, max: 12.4, step: 0.3 },
        { min: 12.4, max: 31.1, step: 0.6 },
        { min: 31.1, max: 62.1, step: 1.6 },
      ],
      unit: 'miles',
    },
  },

  time: {
    metric: {
      ranges: [
        { min: 0, max: 60, step: 10 / 60 }, // 0-60min, 10sec steps
        { min: 60, max: 180, step: 1 }, // 1-3h, 1min steps
        { min: 180, max: 360, step: 5 }, // 3-6h, 5min steps
        { min: 360, max: 720, step: 15 }, // 6-12h, 15min steps
      ],
      unit: 'minutes',
      formatter: (value: number) => {
        const hours = Math.floor(value / 60)
        const minutes = Math.round(value % 60)
        if (hours > 0) {
          return `${hours}h ${minutes}m`
        }
        if (minutes === 0) {
          return '0s'
        }
        return `${minutes}m`
      },
    },
    imperial: {
      ranges: [
        { min: 0, max: 60, step: 10 / 60 }, // Same for imperial, 10sec steps
        { min: 60, max: 180, step: 1 },
        { min: 180, max: 360, step: 5 },
        { min: 360, max: 720, step: 15 },
      ],
      unit: 'minutes',
      formatter: (value: number) => {
        const hours = Math.floor(value / 60)
        const minutes = Math.round(value % 60)
        if (hours > 0) {
          return `${hours}h ${minutes}m`
        }
        if (minutes === 0) {
          return '0s'
        }
        return `${minutes}m`
      },
    },
  },

  // Special configuration for track lap mode (time in seconds)
  timeTrackLap: {
    metric: {
      ranges: [
        { min: 0, max: 300 / 60, step: 1 / 60 }, // 0-300 seconds, 1sec steps
      ],
      unit: 'seconds',
      formatter: (value: number) => {
        const totalSeconds = Math.round(value * 60)
        return `${totalSeconds}s`
      },
    },
    imperial: {
      ranges: [
        { min: 0, max: 300 / 60, step: 1 / 60 }, // Same for imperial
      ],
      unit: 'seconds',
      formatter: (value: number) => {
        const totalSeconds = Math.round(value * 60)
        return `${totalSeconds}s`
      },
    },
  },
}
