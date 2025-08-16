import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the calculator module
vi.mock('./calculator', () => ({
  recalculate: vi.fn((data, calculatedField, changedField) => {
    // Simple mock that calculates the target field from inputs
    const result = { ...data }
    if (changedField === 'pace') {
      result.speed = 60 / data.pace
    }
    if (changedField === 'speed') {
      result.pace = 60 / data.speed
    }
    // If calculating distance from pace and time
    if (calculatedField === 'distance' && result.pace > 0 && result.time > 0) {
      result.distance = result.time / result.pace
    }
    return result
  }),
  formatPace: vi.fn(minutes => {
    const wholeMinutes = Math.floor(minutes)
    const seconds = Math.round((minutes - wholeMinutes) * 60)
    return `${wholeMinutes}:${seconds.toString().padStart(2, '0')}`
  }),
  parsePace: vi.fn(paceString => {
    const parts = paceString.split(':')
    if (parts.length !== 2) return 0
    const minutes = parseInt(parts[0])
    const seconds = parseInt(parts[1])
    if (isNaN(minutes) || isNaN(seconds)) return 0
    return minutes + seconds / 60
  }),
  formatTime: vi.fn(minutes => {
    const mins = Math.floor(minutes)
    const secs = Math.round((minutes % 1) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }),
  parseTime: vi.fn(timeString => {
    const parts = timeString.split(':')
    if (parts.length === 2) {
      const minutes = parseInt(parts[0])
      const seconds = parseInt(parts[1])
      if (isNaN(minutes) || isNaN(seconds)) return 0
      return minutes + seconds / 60
    }
    return 0
  }),
}))

describe('PaceCalculatorApp DOM Elements', () => {
  beforeEach(async () => {
    // Set up DOM
    document.body.innerHTML = '<div id="app"></div>'

    // Clear module cache and reimport
    vi.resetModules()

    // Import and initialize the app after setting up DOM
    await import('./main')

    // Wait for DOM updates
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('should create all required input elements', () => {
    const paceInput = document.getElementById('pace-input') as HTMLInputElement
    const speedInput = document.getElementById(
      'speed-input'
    ) as HTMLInputElement
    const distanceInput = document.getElementById(
      'distance-input'
    ) as HTMLInputElement
    const timeInput = document.getElementById('time-input') as HTMLInputElement

    expect(paceInput).toBeTruthy()
    expect(speedInput).toBeTruthy()
    expect(distanceInput).toBeTruthy()
    expect(timeInput).toBeTruthy()

    expect(paceInput.type).toBe('text')
    expect(speedInput.type).toBe('text')
    expect(distanceInput.type).toBe('text')
    expect(timeInput.type).toBe('text')
  })

  it('should create all required calc buttons', () => {
    const paceCalc = document.getElementById('pace-calc') as HTMLButtonElement
    const speedCalc = document.getElementById('speed-calc') as HTMLButtonElement
    const distanceCalc = document.getElementById(
      'distance-calc'
    ) as HTMLButtonElement
    const timeCalc = document.getElementById('time-calc') as HTMLButtonElement

    expect(paceCalc).toBeTruthy()
    expect(speedCalc).toBeTruthy()
    expect(distanceCalc).toBeTruthy()
    expect(timeCalc).toBeTruthy()

    expect(paceCalc.textContent).toBe('🎯')
    expect(speedCalc.textContent).toBe('🎯')
    expect(distanceCalc.textContent).toBe('🎯')
    expect(timeCalc.textContent).toBe('🎯')
  })

  it('should have proper field labels and units', () => {
    const labels = document.querySelectorAll('.field-label')
    const units = document.querySelectorAll('.field-label .unit')

    expect(labels).toHaveLength(4)
    expect(units).toHaveLength(4)

    const labelTexts = Array.from(labels).map(label => label.textContent)
    const unitTexts = Array.from(units).map(unit => unit.textContent)

    expect(labelTexts).toEqual([
      'Pace (min/km)',
      'Speed (km/h)',
      'Distance (km)',
      'Time (hh:mm:ss)',
    ])
    expect(unitTexts).toEqual(['(min/km)', '(km/h)', '(km)', '(hh:mm:ss)'])
  })

  it('should have instructions section', () => {
    const instructions = document.querySelector('.instructions')
    expect(instructions).toBeTruthy()

    const heading = instructions?.querySelector('h3')
    expect(heading?.textContent).toBe('How to use:')

    const list = instructions?.querySelector('ul')
    expect(list).toBeTruthy()
    expect(list?.children.length).toBeGreaterThan(0)
  })

  it('should have proper placeholder values', () => {
    const paceInput = document.getElementById('pace-input') as HTMLInputElement
    const speedInput = document.getElementById(
      'speed-input'
    ) as HTMLInputElement
    const distanceInput = document.getElementById(
      'distance-input'
    ) as HTMLInputElement
    const timeInput = document.getElementById('time-input') as HTMLInputElement

    expect(paceInput.placeholder).toBe('05:00')
    expect(speedInput.placeholder).toBe('12.0')
    expect(distanceInput.placeholder).toBe('10.0')
    expect(timeInput.placeholder).toBe('00:50:00')
  })

  it('should initialize with default values', () => {
    const paceInput = document.getElementById('pace-input') as HTMLInputElement
    const speedInput = document.getElementById(
      'speed-input'
    ) as HTMLInputElement
    const distanceInput = document.getElementById(
      'distance-input'
    ) as HTMLInputElement
    const timeInput = document.getElementById('time-input') as HTMLInputElement

    // Check that inputs have some initial values
    expect(paceInput.value).toBeTruthy()
    expect(speedInput.value).toBeTruthy()
    expect(distanceInput.value).toBeTruthy()
    expect(timeInput.value).toBeTruthy()
  })

  it('should have distance calculated by default', () => {
    const calculatedRows = document.querySelectorAll('.field-row.calculated')
    const calculatedButtons = document.querySelectorAll(
      '.calc-button.calculated'
    )

    expect(calculatedRows).toHaveLength(1) // distance row
    expect(calculatedButtons).toHaveLength(1) // distance button

    // Check that distance is specifically calculated
    const distanceRow = document.querySelector('[data-field="distance"]')
    const paceRow = document.querySelector('[data-field="pace"]')
    const speedRow = document.querySelector('[data-field="speed"]')
    expect(distanceRow?.classList.contains('calculated')).toBe(true)
    expect(paceRow?.classList.contains('calculated')).toBe(false)
    expect(speedRow?.classList.contains('calculated')).toBe(false)
  })

  it('should respond to calc button clicks', () => {
    const paceCalc = document.getElementById('pace-calc') as HTMLButtonElement
    const distanceRow = document.querySelector('[data-field="distance"]')
    const paceRow = document.querySelector('[data-field="pace"]')
    const speedRow = document.querySelector('[data-field="speed"]')

    // Initially distance is calculated, pace and speed are not
    expect(distanceRow?.classList.contains('calculated')).toBe(true)
    expect(paceRow?.classList.contains('calculated')).toBe(false)
    expect(speedRow?.classList.contains('calculated')).toBe(false)

    // Click the pace calc button
    paceCalc.click()

    // Now pace and speed should be calculated, distance should not
    expect(paceRow?.classList.contains('calculated')).toBe(true)
    expect(speedRow?.classList.contains('calculated')).toBe(true)
    expect(distanceRow?.classList.contains('calculated')).toBe(false)
  })
})

describe('PaceCalculatorApp Input Handling', () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>'
    vi.resetModules()
    await import('./main')
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('should handle pace input changes', () => {
    const paceInput = document.getElementById('pace-input') as HTMLInputElement
    const speedInput = document.getElementById(
      'speed-input'
    ) as HTMLInputElement

    // Change pace input
    paceInput.value = '06:00'
    paceInput.dispatchEvent(new Event('input'))

    // Speed should be updated (60/6 = 10)
    expect(speedInput.value).toBe('10.00')
  })

  it('should handle speed input changes', () => {
    const speedInput = document.getElementById(
      'speed-input'
    ) as HTMLInputElement
    const paceInput = document.getElementById('pace-input') as HTMLInputElement

    // Change speed input
    speedInput.value = '15'
    speedInput.dispatchEvent(new Event('input'))

    // Pace should be updated (60/15 = 4)
    // Note: The format may vary based on the segmented input handler
    expect(paceInput.value).toMatch(/0?4:00/)
  })

  it('should handle distance input changes', () => {
    const distanceInput = document.getElementById(
      'distance-input'
    ) as HTMLInputElement

    // Since distance is calculated by default, it should be disabled and not accept input changes
    expect(distanceInput.disabled).toBe(true)

    // But we can test that when we switch to calculating something else, distance becomes editable
    const paceCalc = document.getElementById('pace-calc') as HTMLButtonElement
    paceCalc.click() // Switch to calculating pace/speed

    expect(distanceInput.disabled).toBe(false)

    // Now distance input should be editable
    distanceInput.value = '5'
    distanceInput.dispatchEvent(new Event('input'))

    expect(distanceInput.value).toBe('5.00')
  })

  it('should handle time input changes', () => {
    const timeInput = document.getElementById('time-input') as HTMLInputElement

    // Change time input
    timeInput.value = '30:00'
    timeInput.dispatchEvent(new Event('input'))

    // Time should be accepted
    expect(timeInput.value).toBeTruthy()
  })
})
