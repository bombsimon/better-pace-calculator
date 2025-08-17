export class NumericInput {
  private input: HTMLInputElement
  private maxDecimals: number

  constructor(input: HTMLInputElement, maxDecimals: number = 2) {
    this.input = input
    this.maxDecimals = maxDecimals
    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.input.addEventListener('focus', this.handleFocus.bind(this))
    this.input.addEventListener('keydown', this.handleKeyDown.bind(this))
    this.input.addEventListener('input', this.handleInput.bind(this))
    this.input.addEventListener('blur', this.handleBlur.bind(this))
  }

  private handleFocus() {
    // Select all on focus for easy replacement
    this.input.select()
  }

  private handleBlur() {
    // Format the value when user leaves the field
    this.formatValue()
  }

  private handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLInputElement
    const selectionStart = target.selectionStart || 0
    const selectionEnd = target.selectionEnd || 0
    const value = target.value

    // If user selects all and starts typing a number, clear the field first
    if (
      e.key >= '0' &&
      e.key <= '9' &&
      selectionStart === 0 &&
      selectionEnd === value.length
    ) {
      e.preventDefault()
      target.value = e.key
      target.setSelectionRange(1, 1)
      target.dispatchEvent(new Event('input', { bubbles: true }))
      return
    }

    // Handle comma as decimal separator (convert to period)
    if (
      e.key === ',' &&
      value.indexOf('.') === -1 &&
      value.indexOf(',') === -1
    ) {
      e.preventDefault()
      const newValue =
        value.slice(0, selectionStart) + '.' + value.slice(selectionEnd)
      target.value = newValue
      target.setSelectionRange(selectionStart + 1, selectionStart + 1)
      target.dispatchEvent(new Event('input', { bubbles: true }))
      return
    }

    // Allow: numbers, backspace, delete, tab, escape, enter, home, end, arrows, decimal separators
    if (
      // Numbers
      (e.key >= '0' && e.key <= '9') ||
      // Navigation and editing keys
      [8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z
      (e.ctrlKey && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase())) ||
      // Allow decimal point if none exists
      (e.key === '.' && value.indexOf('.') === -1 && value.indexOf(',') === -1)
    ) {
      return
    }

    // Block everything else
    e.preventDefault()
  }

  private handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    let value = target.value
    const cursorPos = target.selectionStart || 0

    // Convert comma to period for decimal separator
    value = value.replace(',', '.')

    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    } else {
      value = cleanValue
    }

    // Limit decimal places
    if (parts.length === 2 && parts[1].length > this.maxDecimals) {
      value = parts[0] + '.' + parts[1].slice(0, this.maxDecimals)
    }

    // Update value if it changed due to cleaning
    if (target.value !== value) {
      target.value = value
      target.setSelectionRange(
        Math.min(cursorPos, value.length),
        Math.min(cursorPos, value.length)
      )
    }
  }

  private formatValue() {
    const value = this.input.value
    if (value && !isNaN(parseFloat(value))) {
      const numValue = parseFloat(value)
      this.input.value = numValue.toFixed(this.maxDecimals)
    }
  }
}

export class SegmentedTimeInput {
  private input: HTMLInputElement
  private isTime: boolean

  constructor(input: HTMLInputElement, isTime: boolean = true) {
    this.input = input
    this.isTime = isTime
    this.bindEvents()
  }

  private bindEvents() {
    this.input.addEventListener('focus', () => this.handleFocus())
    this.input.addEventListener('keydown', e => this.handleKeydown(e))
    this.input.addEventListener('input', e => this.handleInput(e))
  }

  private handleFocus() {
    // Select all on focus for easy replacement
    this.input.select()
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      this.handleDigitInput(e.key)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      this.handleBackspace()
    } else if (e.key === 'Delete') {
      e.preventDefault()
      this.clearInput()
    } else if (e.key === 'Tab') {
      // Let Tab work normally to move between input fields
      return
    } else if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'Home' ||
      e.key === 'End'
    ) {
      // Allow cursor movement
      return
    } else {
      // Block other keys
      e.preventDefault()
    }
  }

  private handleInput(_e: Event) {
    // This is mainly to catch paste events - reformat the input
    const value = this.input.value
    const formatted = this.formatValue(value)
    if (formatted !== value) {
      this.input.value = formatted
    }
  }

  private handleDigitInput(digit: string) {
    const currentValue = this.input.value
    const cursorPos = this.input.selectionStart || 0

    // If we have a full selection, start fresh
    if (this.input.selectionStart !== this.input.selectionEnd) {
      const formatted = this.formatNumbers(digit)
      this.input.value = formatted
      this.input.setSelectionRange(1, 1) // Position after first digit
      this.input.dispatchEvent(new Event('input'))
      return
    }

    // Find what digit position we're at (skipping colons)
    const digitPosition = this.getDigitPosition(cursorPos)
    const numbersOnly = currentValue.replace(/[^\d]/g, '')

    // Replace the digit at the current position
    const newNumbers =
      numbersOnly.substring(0, digitPosition) +
      digit +
      numbersOnly.substring(digitPosition + 1)

    // Format and set the value
    const formatted = this.formatNumbers(newNumbers)
    this.input.value = formatted

    // Move cursor to the next digit position
    const nextDigitPos = Math.min(digitPosition + 1, this.isTime ? 6 : 4)
    const newCursorPos = this.getFormattedPosition(nextDigitPos)
    this.input.setSelectionRange(newCursorPos, newCursorPos)

    // Trigger input event for the app
    this.input.dispatchEvent(new Event('input'))
  }

  private handleBackspace() {
    const currentValue = this.input.value
    const cursorPos = this.input.selectionStart || 0

    if (this.input.selectionStart !== this.input.selectionEnd) {
      // Something is selected, delete it
      this.clearInput()
      return
    }

    const numbersOnly = currentValue.replace(/[^\d]/g, '')
    const digitPosition = this.getDigitPosition(cursorPos)

    if (digitPosition > 0) {
      // Zero out the digit at the current position instead of shifting
      const newNumbers =
        numbersOnly.substring(0, digitPosition - 1) +
        '0' +
        numbersOnly.substring(digitPosition)
      const formatted = this.formatNumbers(newNumbers)
      this.input.value = formatted

      const newCursorPos = this.getFormattedPosition(digitPosition - 1)
      this.input.setSelectionRange(newCursorPos, newCursorPos)

      // Trigger input event for the app
      this.input.dispatchEvent(new Event('input'))
    }
  }

  private clearInput() {
    if (this.isTime) {
      this.input.value = '00:00:00'
    } else {
      this.input.value = '05:00'
    }
    this.input.setSelectionRange(0, 0)

    // Trigger input event for the app
    this.input.dispatchEvent(new Event('input'))
  }

  private getDigitPosition(cursorPos: number): number {
    // Convert cursor position in formatted string to digit position
    const beforeCursor = this.input.value.substring(0, cursorPos)
    return beforeCursor.replace(/[^\d]/g, '').length
  }

  private getFormattedPosition(digitPos: number): number {
    // Convert digit position to cursor position in formatted string
    if (this.isTime) {
      // HH:MM:SS format
      if (digitPos <= 2) return digitPos
      if (digitPos <= 4) return digitPos + 1 // +1 for first colon
      return digitPos + 2 // +2 for both colons
    } else {
      // MM:SS format
      if (digitPos <= 2) return digitPos
      return digitPos + 1 // +1 for colon
    }
  }

  private formatNumbers(numbers: string): string {
    // Pad with leading zeros
    if (this.isTime) {
      numbers = numbers.padStart(6, '0')
      return `${numbers.substring(0, 2)}:${numbers.substring(2, 4)}:${numbers.substring(4, 6)}`
    } else {
      numbers = numbers.padStart(4, '0')
      return `${numbers.substring(0, 2)}:${numbers.substring(2, 4)}`
    }
  }

  private formatValue(value: string): string {
    // Take any value and format it properly
    const numbers = value.replace(/[^\d]/g, '')
    return this.formatNumbers(numbers)
  }
}
