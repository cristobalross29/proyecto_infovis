# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a social media usage analysis visualization project built with vanilla JavaScript and Plotly.js. The application loads social media usage data from a CSV file and creates 5 different interactive charts to analyze usage patterns, academic performance impacts, and sleep correlations.

## Development Commands

- `npm start` - Start development server on port 3000 with live-server
- `npm run dev` - Start development server with file watching for auto-reload
- No test framework is configured (test script shows error message)

## Architecture

### Modular Chart System
The application follows a modular architecture where each chart is implemented in its own file:
- `main.js` - Entry point that orchestrates data loading and chart initialization
- `dataLoader.js` - Handles CSV file loading and parsing into JavaScript objects
- `chart1.js` through `chart5.js` - Individual chart implementations using Plotly.js

### Data Flow
1. `main.js` imports all chart modules and the data loader
2. On DOM load, `loadCSVData()` fetches and parses `DataSetSocialMedia.csv`
3. Parsed data is passed to each chart creation function
4. Charts render into predefined div containers in `index.html`

### Chart Container Pattern
Each chart follows this pattern:
- Exported function named `createChart[N](data)`
- Takes the full dataset as parameter
- Filters/processes data as needed for specific visualization
- Creates Plotly trace and layout objects
- Calls `Plotly.newPlot()` with corresponding chart container ID

## Key Dependencies

- **Plotly.js** (CDN) - Primary charting library for all visualizations
- **live-server** - Development server with auto-reload
- **Chart.js**, **D3.js** - Installed but not currently used

## Data Source

The application expects `DataSetSocialMedia.csv` to be in the project root with social media usage data including fields like:
- `Avg_Daily_Usage_Hours`
- `Sleep_Hours_Per_Night`
- `Affects_Academic_Performance`

## File Structure

```
├── index.html          # Main HTML with chart containers and styling
├── main.js             # Application entry point and orchestration
├── dataLoader.js       # CSV data loading and parsing utility
├── chart1.js-chart5.js # Individual chart implementations
├── DataSetSocialMedia.csv # Source data file
└── package.json        # Dependencies and scripts
```

## Coding Standards

### CSS Units
- **NUNCA usar píxeles (px)**: Siempre usar unidades relativas como `rem`, `em`, `%`, `vh`, `vw` para todos los tamaños
  - Tamaños de fuente: `rem` o `em`
  - Márgenes y padding: `rem`
  - Anchos y altos: `%`, `vh`, `vw`, o `rem`
  - Bordes: `rem` (ej: `0.0625rem` en lugar de `1px`)
  - Media queries: `rem` (ej: `48rem` en lugar de `768px`)