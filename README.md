# Running Pace Calculator

A simple, mobile-friendly web application for converting times and speeds for
runners.

## Features

- **Dual Unit System Support**: Toggle between metric (km/h, min/km, km) and
  imperial (mph, min/mile, miles) units
- **🏃‍♂️ 400m Track Lap Mode**: Special mode for track training with time
  displayed in seconds
- **Pace ↔ Speed Conversion**: Convert between pace and speed with automatic
  unit conversion
- **Time Calculation**: Calculate running time based on pace and distance
- **Distance Calculation**: Calculate distance based on pace and time
- **Smart Calculation Targeting**: Choose which field to calculate, pace and
  speed are linked
- **Mobile-Friendly**: Responsive design optimized for mobile devices with
  improved touch handling
- **Real-time Updates**: Instant calculations as you type with easy-to-edit text
  inputs

## How to Use

1. **Choose Unit System**: Toggle between metric and imperial units using the
   checkbox
2. **🏃‍♂️ Track Lap Mode**: Enable "400m Track Lap Mode" for track training:
   - Automatically sets distance to 400m (0.4km or ~0.25mi)
   - Time displays in seconds for easy lap timing
   - Preserves your current pace when toggling on/off
   - Perfect for track workouts and interval training
3. **Choose What to Calculate**: Click 🎯 to select which field you want to
   **calculate**:
   - **Pace/Speed** (linked together since they're directly related)
   - **Distance** (disabled in track lap mode since it's always 400m)
   - **Time**
4. **Enter Input Values**: Fill in the other fields to provide the data for
   calculation
5. **See Results**: Watch as the selected field updates automatically based on
   your inputs

### Input Formats

- **Pace**: Enter as minutes:seconds (e.g., `05:30` for 5 minutes 30 seconds per
  km/mile)
- **Speed**: Enter as decimal with up to 2 decimal places (e.g., `12.47` km/h or
  `7.82` mph depending on unit system)
- **Distance**: Enter as decimal with up to 2 decimal places (e.g., `10.22` km
  or `6.35` miles depending on unit system)
- **Time**:
  - **Normal mode**: Enter as hours:minutes:seconds (e.g., `01:30:00` for 1h 30m)
  - **Track lap mode**: Enter as seconds only (e.g., `87` for 87 seconds)

## Development

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run prettify` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Calculations

The app handles four interconnected values in both metric and imperial units:

- **Pace** (minutes per kilometer or minutes per mile)
- **Speed** (kilometers per hour or miles per hour)
- **Distance** (kilometers or miles)
- **Time** (minutes)

**Smart Calculation System:**

- **Dual Unit Support**: Toggle between metric and imperial units with automatic
  conversion
- **Pace and Speed** are always linked since they're directly related (`Speed =
60 / Pace`)
- Choose which field you want to **calculate** by clicking the 🎯 button
- Enter values in the other fields to see your target field update automatically

**Key Relationships:**

- `Speed = 60 / Pace` (pace and speed always stay in sync)
- `Time = Pace × Distance`
- `Distance = Time / Pace`

**Unit Conversions:**

- 1 km = 0.621371 miles
- 1 mile = 1.609344 km

## Deployment

The app automatically deploys to GitHub Pages when changes are pushed to the
main branch.

### GitHub Actions

- **CI Workflow**: Runs on every push and pull request to main branch
  - Uses Node.js 24 (latest)
  - Checks code formatting with Prettier
  - Runs all tests with Vitest
  - Builds the project to ensure no build errors
- **Deploy Workflow**: Automatically deploys to GitHub Pages on main branch
  pushes
  - Uses Node.js 24 (latest)
  - Runs tests before deployment
  - Builds with relative paths for flexible deployment
  - Deploys to GitHub Pages (works in any subdirectory)

## License

MIT License - feel free to use this project for any purpose!
