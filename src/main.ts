import './style.css'
import type { PaceData, CalculatedField, UnitSystem } from './calculator'
import {
  recalculate,
  formatPace,
  parsePace,
  formatTime,
  parseTime,
  convertDistance,
  convertSpeed,
  convertPace,
} from './calculator'
import { SegmentedTimeInput, NumericInput } from './inputHandler'

interface AppState {
  data: PaceData
  calculatedField: CalculatedField
  unitSystem: UnitSystem
  activeInput?: string
  isTrackLap: boolean
}

class PaceCalculatorApp {
  private state: AppState
  private elements!: {
    paceInput: HTMLInputElement
    speedInput: HTMLInputElement
    distanceInput: HTMLInputElement
    timeInput: HTMLInputElement
    imperialToggle: HTMLInputElement
    trackLapToggle: HTMLInputElement
  }
  constructor() {
    this.state = {
      data: { pace: 5, speed: 12, distance: 10, time: 50 },
      calculatedField: 'distance',
      unitSystem: 'metric',
      isTrackLap: false,
    }

    this.initializeDOM()
    this.bindEvents()
    this.updateUI()
  }

  private initializeDOM() {
    const app = document.querySelector<HTMLDivElement>('#app')!

    app.innerHTML = `
      <h1>🏃‍♂️ Running Pace Calculator</h1>
      
      <div class="calculator-container">
        <div class="field-row" data-field="pace">
          <span class="calc-icon">🎯</span>
          <div class="field-label">Pace <span class="unit">(min/km)</span></div>
          <input type="text" class="field-input" id="pace-input" placeholder="05:00" inputmode="numeric">
        </div>

        <div class="field-row" data-field="speed">
          <span class="calc-icon">🎯</span>
          <div class="field-label">Speed <span class="unit">(km/h)</span></div>
          <input type="text" class="field-input" id="speed-input" placeholder="12.0" inputmode="decimal">
        </div>

        <div class="field-row" data-field="distance">
          <span class="calc-icon">🎯</span>
          <div class="field-label">Distance <span class="unit">(km)</span></div>
          <input type="text" class="field-input" id="distance-input" placeholder="10.0" inputmode="decimal">
        </div>

        <div class="field-row" data-field="time">
          <span class="calc-icon">🎯</span>
          <div class="field-label">Time <span class="unit">(hh:mm:ss)</span></div>
          <input type="text" class="field-input" id="time-input" placeholder="00:50:00" inputmode="numeric">
        </div>
      </div>

      <div class="track-lap-mode">
        <label class="track-lap-toggle">
          <input type="checkbox" id="track-lap-toggle">
          <span class="track-lap-icon">🏃‍♂️</span>
          400m Track Lap Mode
        </label>
      </div>

      <div class="unit-toggle">
        <label>
          <input type="checkbox" id="imperial-toggle">
          Use imperial units (mph, min/mile)
        </label>
      </div>

      <div class="instructions">
        <h3>How to use:</h3>
        <ul>
          <li>Click on a row to select which field you want to <strong>calculate</strong></li>
          <li>Purple fields show <strong>calculated outputs</strong> - they become read-only</li>
          <li>Gray fields are <strong>inputs</strong> - enter your known values here</li>
          <li><strong>🏃‍♂️ Track Lap Mode:</strong> Enable for 400m track training - shows time in seconds</li>
          <li>Toggle between metric (km/h, min/km) and imperial (mph, min/mile) units</li>
          <li>Pace and speed are linked - calculating one updates both</li>
          <li>Enter pace as minutes:seconds (e.g., 05:30 for 5min 30sec per km/mile)</li>
          <li>Enter time as hours:minutes:seconds (normal) or seconds only (track lap mode)</li>
        </ul>
      </div>
    `

    this.elements = {
      paceInput: document.getElementById('pace-input') as HTMLInputElement,
      speedInput: document.getElementById('speed-input') as HTMLInputElement,
      distanceInput: document.getElementById(
        'distance-input'
      ) as HTMLInputElement,
      timeInput: document.getElementById('time-input') as HTMLInputElement,
      imperialToggle: document.getElementById(
        'imperial-toggle'
      ) as HTMLInputElement,
      trackLapToggle: document.getElementById(
        'track-lap-toggle'
      ) as HTMLInputElement,
    }

    // Initialize input handlers
    new SegmentedTimeInput(this.elements.paceInput, false)
    this.initializeTimeInputHandler()
    new NumericInput(this.elements.speedInput, 2)
    new NumericInput(this.elements.distanceInput, 2)
  }

  private initializeTimeInputHandler() {
    if (this.state.isTrackLap) {
      new NumericInput(this.elements.timeInput, 0)
    } else {
      new SegmentedTimeInput(this.elements.timeInput, true)
    }
  }

  private reinitializeTimeInputHandler() {
    // Remove existing event listeners by replacing the element
    const oldTimeInput = this.elements.timeInput
    const newTimeInput = oldTimeInput.cloneNode(true) as HTMLInputElement
    oldTimeInput.parentNode?.replaceChild(newTimeInput, oldTimeInput)
    this.elements.timeInput = newTimeInput

    // Initialize new handler
    this.initializeTimeInputHandler()

    // Re-bind the input event
    this.elements.timeInput.addEventListener('input', () => {
      let time: number
      if (this.state.isTrackLap) {
        time = this.parseTimeFromSeconds(this.elements.timeInput.value)
      } else {
        time = parseTime(this.elements.timeInput.value)
      }
      if (time > 0) {
        this.updateField('time', time)
      }
    })
  }

  private bindEvents() {
    // Input change events
    this.elements.paceInput.addEventListener('input', () => {
      const pace = parsePace(this.elements.paceInput.value)
      if (pace > 0) {
        this.updateField('pace', pace)
      }
    })

    this.elements.speedInput.addEventListener('input', () => {
      const speed = parseFloat(this.elements.speedInput.value)
      if (speed > 0 && !isNaN(speed)) {
        this.updateField('speed', speed)
      }
    })

    this.elements.distanceInput.addEventListener('input', () => {
      const distance = parseFloat(this.elements.distanceInput.value)
      if (distance > 0 && !isNaN(distance)) {
        this.updateField('distance', distance)
      }
    })

    this.elements.timeInput.addEventListener('input', () => {
      let time: number
      if (this.state.isTrackLap) {
        time = this.parseTimeFromSeconds(this.elements.timeInput.value)
      } else {
        time = parseTime(this.elements.timeInput.value)
      }
      if (time > 0) {
        this.updateField('time', time)
      }
    })

    // Make entire field rows clickable (except when clicking on input fields)
    const fieldRows = document.querySelectorAll('.field-row')
    fieldRows.forEach(row => {
      row.addEventListener('click', e => {
        const target = e.target as HTMLElement
        // Don't trigger if clicking on input field or if it's the track-lap-hidden distance field
        if (
          target.classList.contains('field-input') ||
          row.classList.contains('track-lap-hidden')
        ) {
          return
        }

        const field = row.getAttribute('data-field')
        if (field) {
          this.toggleCalculatedField(
            field as 'pace' | 'speed' | 'distance' | 'time'
          )
        }
      })
    })

    // Unit system toggle
    this.elements.imperialToggle.addEventListener('change', () => {
      this.toggleUnitSystem()
    })

    // Track lap toggle
    this.elements.trackLapToggle.addEventListener('change', () => {
      this.toggleTrackLap()
    })

    // Track active input to avoid overriding user typing
    const inputs = [this.elements.speedInput, this.elements.distanceInput]
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        this.state.activeInput = input.id
      })
      input.addEventListener('blur', () => {
        this.state.activeInput = undefined
      })
    })
  }

  private updateField(
    field: 'pace' | 'speed' | 'distance' | 'time',
    value: number
  ) {
    this.state.data = { ...this.state.data, [field]: value }
    this.state.data = recalculate(
      this.state.data,
      this.state.calculatedField,
      field
    )
    this.updateUI()
  }

  private toggleCalculatedField(field: 'pace' | 'speed' | 'distance' | 'time') {
    // Map individual fields to calculable groups
    if (field === 'pace' || field === 'speed') {
      this.state.calculatedField = 'pace-speed'
    } else {
      this.state.calculatedField = field as CalculatedField
    }
    this.updateUI()
  }

  private toggleUnitSystem() {
    const newUnitSystem: UnitSystem = this.elements.imperialToggle.checked
      ? 'imperial'
      : 'metric'
    const oldUnitSystem = this.state.unitSystem

    if (newUnitSystem !== oldUnitSystem) {
      // Convert all values to new unit system
      this.state.data = {
        pace: convertPace(this.state.data.pace, oldUnitSystem, newUnitSystem),
        speed: convertSpeed(
          this.state.data.speed,
          oldUnitSystem,
          newUnitSystem
        ),
        distance: convertDistance(
          this.state.data.distance,
          oldUnitSystem,
          newUnitSystem
        ),
        time: this.state.data.time, // Time doesn't change
      }
      this.state.unitSystem = newUnitSystem

      // Update track lap distance if enabled
      if (this.state.isTrackLap) {
        this.setTrackLapDistance()
      }

      this.updateUI()
    }
  }

  private toggleTrackLap() {
    this.state.isTrackLap = this.elements.trackLapToggle.checked

    // Reinitialize time input handler for new mode
    this.reinitializeTimeInputHandler()

    if (this.state.isTrackLap) {
      // Store current pace to preserve it
      const currentPace = this.state.data.pace
      const currentSpeed = this.state.data.speed

      this.setTrackLapDistance()

      // If distance is currently being calculated, switch to calculating pace/speed instead
      if (this.state.calculatedField === 'distance') {
        this.state.calculatedField = 'pace-speed'
      }

      // Preserve pace/speed and recalculate time based on new distance
      this.state.data = {
        ...this.state.data,
        pace: currentPace,
        speed: currentSpeed,
        time: currentPace * this.state.data.distance, // time = pace × distance
      }
    } else {
      // When turning off track lap mode, preserve pace and let user adjust distance
      // No automatic recalculation needed - let user enter their desired distance
    }

    this.updateUI()
  }

  private setTrackLapDistance() {
    // 400m = 0.4km in metric, 0.25 miles in imperial (approximately)
    const trackDistance = this.state.unitSystem === 'metric' ? 0.4 : 0.248548
    this.state.data = { ...this.state.data, distance: trackDistance }
  }

  private formatTimeForTrackLap(minutes: number): string {
    const totalSeconds = Math.round(minutes * 60)
    return totalSeconds.toString()
  }

  private parseTimeFromSeconds(secondsString: string): number {
    const seconds = parseFloat(secondsString)
    if (isNaN(seconds) || seconds <= 0) return 0
    return seconds / 60 // Convert to minutes
  }

  private updateUI() {
    // Update input values (skip the currently active input to avoid overriding user typing)
    this.elements.paceInput.value = formatPace(this.state.data.pace)

    if (this.state.activeInput !== 'speed-input') {
      this.elements.speedInput.value = this.state.data.speed.toFixed(2)
    }

    if (this.state.activeInput !== 'distance-input' || this.state.isTrackLap) {
      this.elements.distanceInput.value = this.state.data.distance.toFixed(2)
    }

    if (this.state.isTrackLap) {
      this.elements.timeInput.value = this.formatTimeForTrackLap(
        this.state.data.time
      )
    } else {
      this.elements.timeInput.value = formatTime(this.state.data.time)
    }

    // Update unit labels based on current unit system and track lap mode
    const isImperial = this.state.unitSystem === 'imperial'
    const paceUnit = isImperial ? '(min/mile)' : '(min/km)'
    const speedUnit = isImperial ? '(mph)' : '(km/h)'
    const distanceUnit = isImperial ? '(miles)' : '(km)'
    const timeUnit = this.state.isTrackLap ? '(seconds)' : '(hh:mm:ss)'

    document.querySelector(
      '[data-field="pace"] .field-label .unit'
    )!.textContent = paceUnit
    document.querySelector(
      '[data-field="speed"] .field-label .unit'
    )!.textContent = speedUnit
    document.querySelector(
      '[data-field="distance"] .field-label .unit'
    )!.textContent = distanceUnit
    document.querySelector(
      '[data-field="time"] .field-label .unit'
    )!.textContent = timeUnit

    // Update track lap mode display
    const distanceRow = document.querySelector('[data-field="distance"]')
    const distanceInput = this.elements.distanceInput
    const timeInput = this.elements.timeInput

    if (this.state.isTrackLap) {
      distanceRow?.classList.add('track-lap-hidden')
      distanceInput.placeholder = '🏃‍♂️ 400m'
      timeInput.placeholder = '87'
      timeInput.inputMode = 'numeric'
    } else {
      distanceRow?.classList.remove('track-lap-hidden')
      distanceInput.placeholder = '10.0'
      timeInput.placeholder = '00:50:00'
      timeInput.inputMode = 'numeric'
    }

    // Update calculation states and input/output modes
    const individualFields = ['pace', 'speed', 'distance', 'time']

    individualFields.forEach(field => {
      const row = document.querySelector(`[data-field="${field}"]`)
      const input = this.elements[
        `${field}Input` as keyof typeof this.elements
      ] as HTMLInputElement

      let isCalculated = false

      // Determine if this field is being calculated
      if (
        this.state.calculatedField === 'pace-speed' &&
        (field === 'pace' || field === 'speed')
      ) {
        isCalculated = true
      } else if (this.state.calculatedField === field) {
        isCalculated = true
      }

      // Special handling for distance in track lap mode
      if (this.state.isTrackLap && field === 'distance') {
        row?.classList.add('calculated')
        row?.classList.remove('input-field')
        input.disabled = true
        input.tabIndex = -1
      } else if (isCalculated) {
        // This field is calculated (output)
        row?.classList.add('calculated')
        row?.classList.remove('input-field')
        input.disabled = true
        input.tabIndex = -1 // Remove from tab order
      } else {
        // This field is input
        row?.classList.remove('calculated')
        row?.classList.add('input-field')
        input.disabled = false
        input.tabIndex = 0 // Add back to tab order
      }
    })
  }
}

// Initialize the app when DOM is loaded
new PaceCalculatorApp()
