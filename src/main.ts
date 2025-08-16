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
}

class PaceCalculatorApp {
  private state: AppState
  private elements!: {
    paceInput: HTMLInputElement
    speedInput: HTMLInputElement
    distanceInput: HTMLInputElement
    timeInput: HTMLInputElement
    paceLock: HTMLButtonElement
    speedLock: HTMLButtonElement
    distanceLock: HTMLButtonElement
    timeLock: HTMLButtonElement
    imperialToggle: HTMLInputElement
  }
  constructor() {
    this.state = {
      data: { pace: 5, speed: 12, distance: 10, time: 50 },
      calculatedField: 'distance',
      unitSystem: 'metric',
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
          <button class="calc-button" id="pace-calc">🎯</button>
          <div class="field-label">Pace <span class="unit">(min/km)</span></div>
          <input type="text" class="field-input" id="pace-input" placeholder="05:00" inputmode="numeric">
        </div>

        <div class="field-row" data-field="speed">
          <button class="calc-button" id="speed-calc">🎯</button>
          <div class="field-label">Speed <span class="unit">(km/h)</span></div>
          <input type="text" class="field-input" id="speed-input" placeholder="12.0" inputmode="decimal">
        </div>

        <div class="field-row" data-field="distance">
          <button class="calc-button" id="distance-calc">🎯</button>
          <div class="field-label">Distance <span class="unit">(km)</span></div>
          <input type="text" class="field-input" id="distance-input" placeholder="10.0" inputmode="decimal">
        </div>

        <div class="field-row" data-field="time">
          <button class="calc-button" id="time-calc">🎯</button>
          <div class="field-label">Time <span class="unit">(hh:mm:ss)</span></div>
          <input type="text" class="field-input" id="time-input" placeholder="00:50:00" inputmode="numeric">
        </div>
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
          <li>Click the 🎯 button to select which field you want to <strong>calculate</strong></li>
          <li>Purple fields show <strong>calculated outputs</strong> - they become read-only</li>
          <li>Gray fields are <strong>inputs</strong> - enter your known values here</li>
          <li>Toggle between metric (km/h, min/km) and imperial (mph, min/mile) units</li>
          <li>Pace and speed are linked - calculating one updates both</li>
          <li>Enter pace as minutes:seconds (e.g., 05:30 for 5min 30sec per km/mile)</li>
          <li>Enter time as hours:minutes:seconds (e.g., 01:30:00 for 1h 30m)</li>
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
      paceLock: document.getElementById('pace-calc') as HTMLButtonElement,
      speedLock: document.getElementById('speed-calc') as HTMLButtonElement,
      distanceLock: document.getElementById(
        'distance-calc'
      ) as HTMLButtonElement,
      timeLock: document.getElementById('time-calc') as HTMLButtonElement,
      imperialToggle: document.getElementById(
        'imperial-toggle'
      ) as HTMLInputElement,
    }

    // Initialize input handlers
    new SegmentedTimeInput(this.elements.paceInput, false)
    new SegmentedTimeInput(this.elements.timeInput, true)
    new NumericInput(this.elements.speedInput, 2)
    new NumericInput(this.elements.distanceInput, 2)
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
      const time = parseTime(this.elements.timeInput.value)
      if (time > 0) {
        this.updateField('time', time)
      }
    })

    // Calculation button events
    this.elements.paceLock.addEventListener('click', () =>
      this.toggleCalculatedField('pace')
    )
    this.elements.speedLock.addEventListener('click', () =>
      this.toggleCalculatedField('speed')
    )
    this.elements.distanceLock.addEventListener('click', () =>
      this.toggleCalculatedField('distance')
    )
    this.elements.timeLock.addEventListener('click', () =>
      this.toggleCalculatedField('time')
    )

    // Unit system toggle
    this.elements.imperialToggle.addEventListener('change', () => {
      this.toggleUnitSystem()
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
      this.updateUI()
    }
  }

  private updateUI() {
    // Update input values (skip the currently active input to avoid overriding user typing)
    this.elements.paceInput.value = formatPace(this.state.data.pace)

    if (this.state.activeInput !== 'speed-input') {
      this.elements.speedInput.value = this.state.data.speed.toFixed(2)
    }

    if (this.state.activeInput !== 'distance-input') {
      this.elements.distanceInput.value = this.state.data.distance.toFixed(2)
    }

    this.elements.timeInput.value = formatTime(this.state.data.time)

    // Update unit labels based on current unit system
    const isImperial = this.state.unitSystem === 'imperial'
    const paceUnit = isImperial ? '(min/mile)' : '(min/km)'
    const speedUnit = isImperial ? '(mph)' : '(km/h)'
    const distanceUnit = isImperial ? '(miles)' : '(km)'

    document.querySelector(
      '[data-field="pace"] .field-label .unit'
    )!.textContent = paceUnit
    document.querySelector(
      '[data-field="speed"] .field-label .unit'
    )!.textContent = speedUnit
    document.querySelector(
      '[data-field="distance"] .field-label .unit'
    )!.textContent = distanceUnit

    // Update calculation states and input/output modes
    const individualFields = ['pace', 'speed', 'distance', 'time']

    individualFields.forEach(field => {
      const row = document.querySelector(`[data-field="${field}"]`)
      const calcButton = this.elements[
        `${field}Lock` as keyof typeof this.elements
      ] as HTMLButtonElement
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

      if (isCalculated) {
        // This field is calculated (output)
        row?.classList.add('calculated')
        row?.classList.remove('input-field')
        calcButton.classList.add('calculated')
        calcButton.classList.remove('input')
        input.disabled = true
        input.tabIndex = -1 // Remove from tab order
      } else {
        // This field is input
        row?.classList.remove('calculated')
        row?.classList.add('input-field')
        calcButton.classList.remove('calculated')
        calcButton.classList.add('input')
        input.disabled = false
        input.tabIndex = 0 // Add back to tab order
      }
    })
  }
}

// Initialize the app when DOM is loaded
new PaceCalculatorApp()
