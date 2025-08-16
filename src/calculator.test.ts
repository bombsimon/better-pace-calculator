import { describe, it, expect } from 'vitest'
import {
  paceToSpeed,
  speedToPace,
  calculateTime,
  calculateDistance,
  calculatePaceFromTimeDistance,
  formatPace,
  parsePace,
  formatTime,
  parseTime,
  recalculate,
  convertDistance,
  convertSpeed,
  convertPace,
  KM_TO_MILES,
  MILES_TO_KM,
} from './calculator'

describe('Pace and Speed Conversions', () => {
  it('should convert pace to speed correctly', () => {
    expect(paceToSpeed(5)).toBe(12) // 5 min/km = 12 km/h
    expect(paceToSpeed(6)).toBe(10) // 6 min/km = 10 km/h
    expect(paceToSpeed(4)).toBe(15) // 4 min/km = 15 km/h
    expect(paceToSpeed(0)).toBe(0)
    expect(paceToSpeed(-1)).toBe(0)
  })

  it('should convert speed to pace correctly', () => {
    expect(speedToPace(12)).toBe(5) // 12 km/h = 5 min/km
    expect(speedToPace(10)).toBe(6) // 10 km/h = 6 min/km
    expect(speedToPace(15)).toBe(4) // 15 km/h = 4 min/km
    expect(speedToPace(0)).toBe(0)
    expect(speedToPace(-1)).toBe(0)
  })
})

describe('Time and Distance Calculations', () => {
  it('should calculate time from pace and distance', () => {
    expect(calculateTime(5, 10)).toBe(50) // 5 min/km × 10 km = 50 minutes
    expect(calculateTime(6, 5)).toBe(30) // 6 min/km × 5 km = 30 minutes
    expect(calculateTime(4.5, 8)).toBe(36) // 4.5 min/km × 8 km = 36 minutes
  })

  it('should calculate distance from pace and time', () => {
    expect(calculateDistance(5, 50)).toBe(10) // 50 min ÷ 5 min/km = 10 km
    expect(calculateDistance(6, 30)).toBe(5) // 30 min ÷ 6 min/km = 5 km
    expect(calculateDistance(0, 30)).toBe(0)
  })

  it('should calculate pace from time and distance', () => {
    expect(calculatePaceFromTimeDistance(50, 10)).toBe(5) // 50 min ÷ 10 km = 5 min/km
    expect(calculatePaceFromTimeDistance(30, 5)).toBe(6) // 30 min ÷ 5 km = 6 min/km
    expect(calculatePaceFromTimeDistance(30, 0)).toBe(0)
  })
})

describe('Pace Formatting and Parsing', () => {
  it('should format pace correctly', () => {
    expect(formatPace(5)).toBe('05:00')
    expect(formatPace(5.5)).toBe('05:30')
    expect(formatPace(4.25)).toBe('04:15')
    expect(formatPace(6.75)).toBe('06:45')
    expect(formatPace(10.17)).toBe('10:10')
  })

  it('should parse pace correctly', () => {
    expect(parsePace('05:00')).toBe(5)
    expect(parsePace('05:30')).toBe(5.5)
    expect(parsePace('04:15')).toBe(4.25)
    expect(parsePace('06:45')).toBe(6.75)
    expect(parsePace('10:10')).toBeCloseTo(10.167, 2)
    // Should also work with single digits
    expect(parsePace('5:00')).toBe(5)
    expect(parsePace('5:30')).toBe(5.5)
  })

  it('should handle invalid pace strings', () => {
    expect(parsePace('invalid')).toBe(0)
    expect(parsePace('5')).toBe(0)
    expect(parsePace('5:60')).toBe(0)
    expect(parsePace('5:-1')).toBe(0)
    expect(parsePace('')).toBe(0)
  })
})

describe('Time Formatting and Parsing', () => {
  it('should format time correctly (always hh:mm:ss)', () => {
    expect(formatTime(30)).toBe('00:30:00')
    expect(formatTime(45.5)).toBe('00:45:30')
    expect(formatTime(22.25)).toBe('00:22:15')
    expect(formatTime(59.75)).toBe('00:59:45')
  })

  it('should format time correctly (hours:minutes:seconds)', () => {
    expect(formatTime(90)).toBe('01:30:00') // 90 minutes = 1h 30m
    expect(formatTime(125.5)).toBe('02:05:30') // 125.5 minutes = 2h 5m 30s
    expect(formatTime(180.25)).toBe('03:00:15') // 180.25 minutes = 3h 0m 15s
  })

  it('should parse time correctly (minutes:seconds)', () => {
    expect(parseTime('30:00')).toBe(30)
    expect(parseTime('45:30')).toBe(45.5)
    expect(parseTime('22:15')).toBe(22.25)
    expect(parseTime('59:45')).toBe(59.75)
  })

  it('should parse time correctly (hours:minutes:seconds)', () => {
    expect(parseTime('01:30:00')).toBe(90)
    expect(parseTime('02:05:30')).toBe(125.5)
    expect(parseTime('03:00:15')).toBe(180.25)
    expect(parseTime('1:30:00')).toBe(90) // should also work without leading zero
  })

  it('should handle invalid time strings', () => {
    expect(parseTime('invalid')).toBe(0)
    expect(parseTime('30')).toBe(0)
    expect(parseTime('')).toBe(0)
    expect(parseTime('1:2:3:4')).toBe(0)
  })
})

describe('Recalculation Logic', () => {
  const baseData = { pace: 5, speed: 12, distance: 10, time: 50 }

  it('should calculate pace-speed from distance and time', () => {
    const result = recalculate(
      { ...baseData, distance: 8, time: 50 },
      'pace-speed',
      'distance'
    )
    expect(result.distance).toBe(8)
    expect(result.time).toBe(50)
    expect(result.pace).toBe(6.25) // 50 min ÷ 8 km = 6.25 min/km
    expect(result.speed).toBe(9.6) // 60 ÷ 6.25 = 9.6 km/h
  })

  it('should calculate pace-speed from distance and time (time change)', () => {
    const result = recalculate(
      { ...baseData, distance: 10, time: 60 },
      'pace-speed',
      'time'
    )
    expect(result.distance).toBe(10)
    expect(result.time).toBe(60)
    expect(result.pace).toBe(6) // 60 min ÷ 10 km = 6 min/km
    expect(result.speed).toBe(10) // 60 ÷ 6 = 10 km/h
  })

  it('should calculate distance from pace and time', () => {
    const result = recalculate(
      { ...baseData, pace: 6, time: 60 },
      'distance',
      'pace'
    )
    expect(result.pace).toBe(6)
    expect(result.speed).toBe(10) // 6 min/km = 10 km/h
    expect(result.time).toBe(60)
    expect(result.distance).toBe(10) // 60 min ÷ 6 min/km = 10 km
  })

  it('should calculate distance from speed and time', () => {
    const result = recalculate(
      { ...baseData, speed: 10, time: 60 },
      'distance',
      'speed'
    )
    expect(result.speed).toBe(10)
    expect(result.pace).toBe(6) // 10 km/h = 6 min/km pace
    expect(result.time).toBe(60)
    expect(result.distance).toBe(10) // 60 min ÷ 6 min/km = 10 km
  })

  it('should calculate time from pace and distance', () => {
    const result = recalculate(
      { ...baseData, pace: 6, distance: 10 },
      'time',
      'pace'
    )
    expect(result.pace).toBe(6)
    expect(result.speed).toBe(10) // 6 min/km = 10 km/h
    expect(result.distance).toBe(10)
    expect(result.time).toBe(60) // 6 min/km × 10 km = 60 minutes
  })

  it('should calculate time from speed and distance', () => {
    const result = recalculate(
      { ...baseData, speed: 10, distance: 10 },
      'time',
      'speed'
    )
    expect(result.speed).toBe(10)
    expect(result.pace).toBe(6) // 10 km/h = 6 min/km pace
    expect(result.distance).toBe(10)
    expect(result.time).toBe(60) // 6 min/km × 10 km = 60 minutes
  })

  it('should keep pace and speed in sync when pace changes', () => {
    const result = recalculate({ ...baseData, pace: 6 }, 'distance', 'pace')
    expect(result.pace).toBe(6)
    expect(result.speed).toBe(10) // pace and speed always stay in sync
  })

  it('should keep pace and speed in sync when speed changes', () => {
    const result = recalculate({ ...baseData, speed: 10 }, 'distance', 'speed')
    expect(result.speed).toBe(10)
    expect(result.pace).toBe(6) // pace and speed always stay in sync
  })
})

describe('Unit Conversions', () => {
  it('should convert distance from km to miles correctly', () => {
    expect(convertDistance(10, 'metric', 'imperial')).toBeCloseTo(6.21371, 4)
    expect(convertDistance(5, 'metric', 'imperial')).toBeCloseTo(3.10686, 4)
  })

  it('should convert distance from miles to km correctly', () => {
    expect(convertDistance(10, 'imperial', 'metric')).toBeCloseTo(16.0934, 4)
    expect(convertDistance(5, 'imperial', 'metric')).toBeCloseTo(8.0467, 4)
  })

  it('should convert speed from km/h to mph correctly', () => {
    expect(convertSpeed(12, 'metric', 'imperial')).toBeCloseTo(7.45645, 4)
    expect(convertSpeed(10, 'metric', 'imperial')).toBeCloseTo(6.21371, 4)
  })

  it('should convert speed from mph to km/h correctly', () => {
    expect(convertSpeed(7.45645, 'imperial', 'metric')).toBeCloseTo(12, 4)
    expect(convertSpeed(6.21371, 'imperial', 'metric')).toBeCloseTo(10, 4)
  })

  it('should convert pace from min/km to min/mile correctly', () => {
    expect(convertPace(5, 'metric', 'imperial')).toBeCloseTo(8.047, 3) // 5 min/km ≈ 8.047 min/mile
    expect(convertPace(6, 'metric', 'imperial')).toBeCloseTo(9.656, 3) // 6 min/km ≈ 9.656 min/mile
  })

  it('should convert pace from min/mile to min/km correctly', () => {
    expect(convertPace(8, 'imperial', 'metric')).toBeCloseTo(4.971, 3) // 8 min/mile ≈ 4.971 min/km
    expect(convertPace(9, 'imperial', 'metric')).toBeCloseTo(5.592, 3) // 9 min/mile ≈ 5.592 min/km
  })

  it('should return same value when converting to same unit system', () => {
    expect(convertDistance(10, 'metric', 'metric')).toBe(10)
    expect(convertSpeed(12, 'imperial', 'imperial')).toBe(12)
    expect(convertPace(5, 'metric', 'metric')).toBe(5)
  })

  it('should use correct conversion constants', () => {
    expect(KM_TO_MILES).toBe(0.621371)
    expect(MILES_TO_KM).toBe(1.609344)
    expect(KM_TO_MILES * MILES_TO_KM).toBeCloseTo(1, 6) // Should be approximately 1
  })
})
