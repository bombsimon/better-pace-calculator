export interface PaceData {
  pace: number // minutes per km or minutes per mile
  speed: number // km/h or mph
  distance: number // km or miles
  time: number // minutes
}

export type CalculatedField = 'pace-speed' | 'distance' | 'time'
export type UnitSystem = 'metric' | 'imperial'

// Conversion constants
export const KM_TO_MILES = 0.621371
export const MILES_TO_KM = 1.609344

// Unit conversion functions
export function convertDistance(
  distance: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return distance
  if (from === 'metric' && to === 'imperial') return distance * KM_TO_MILES
  if (from === 'imperial' && to === 'metric') return distance * MILES_TO_KM
  return distance
}

export function convertSpeed(
  speed: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return speed
  if (from === 'metric' && to === 'imperial') return speed * KM_TO_MILES
  if (from === 'imperial' && to === 'metric') return speed * MILES_TO_KM
  return speed
}

export function convertPace(
  pace: number,
  from: UnitSystem,
  to: UnitSystem
): number {
  if (from === to) return pace
  if (from === 'metric' && to === 'imperial') return pace / KM_TO_MILES
  if (from === 'imperial' && to === 'metric') return pace / MILES_TO_KM
  return pace
}

export function paceToSpeed(pace: number): number {
  if (pace <= 0) return 0
  return 60 / pace
}

export function speedToPace(speed: number): number {
  if (speed <= 0) return 0
  return 60 / speed
}

export function calculateTime(pace: number, distance: number): number {
  return pace * distance
}

export function calculateDistance(pace: number, time: number): number {
  if (pace <= 0) return 0
  return time / pace
}

export function calculatePaceFromTimeDistance(
  time: number,
  distance: number
): number {
  if (distance <= 0) return 0
  return time / distance
}

export function formatPace(minutes: number): string {
  const wholeMinutes = Math.floor(minutes)
  const seconds = Math.round((minutes - wholeMinutes) * 60)
  return `${wholeMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function parsePace(paceString: string): number {
  const parts = paceString.split(':')
  if (parts.length !== 2) return 0

  const minutes = parseInt(parts[0])
  const seconds = parseInt(parts[1])

  if (isNaN(minutes) || isNaN(seconds) || seconds >= 60 || seconds < 0) return 0

  return minutes + seconds / 60
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = Math.floor(minutes % 60)
  const secs = Math.round((minutes % 1) * 60)

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function parseTime(timeString: string): number {
  const parts = timeString.split(':')

  if (parts.length === 2) {
    const minutes = parseInt(parts[0])
    const seconds = parseInt(parts[1])
    if (isNaN(minutes) || isNaN(seconds)) return 0
    return minutes + seconds / 60
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0])
    const minutes = parseInt(parts[1])
    const seconds = parseInt(parts[2])
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return 0
    return hours * 60 + minutes + seconds / 60
  }

  return 0
}

export function recalculate(
  data: PaceData,
  calculatedField: CalculatedField,
  changedField: 'pace' | 'speed' | 'distance' | 'time'
): PaceData {
  const result = { ...data }

  // Always keep pace and speed in sync first
  if (changedField === 'pace') {
    result.speed = paceToSpeed(data.pace)
  } else if (changedField === 'speed') {
    result.pace = speedToPace(data.speed)
  }

  // Now calculate the target field based on the other inputs
  switch (calculatedField) {
    case 'pace-speed':
      // Calculate pace/speed from distance and time
      if (result.distance > 0 && result.time > 0) {
        result.pace = calculatePaceFromTimeDistance(
          result.time,
          result.distance
        )
        result.speed = paceToSpeed(result.pace)
      }
      break

    case 'distance':
      // Calculate distance from pace and time
      if (result.pace > 0 && result.time > 0) {
        result.distance = calculateDistance(result.pace, result.time)
      }
      break

    case 'time':
      // Calculate time from pace and distance
      if (result.pace > 0 && result.distance > 0) {
        result.time = calculateTime(result.pace, result.distance)
      }
      break
  }

  return result
}
