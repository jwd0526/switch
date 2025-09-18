# SWITCH

A modern lights-out puzzle game built with React and TypeScript, featuring smooth animations and glass morphism design.

## Game Rules

- Click any cell to toggle it and its neighbors in a cross pattern
- Goal: Turn off all lights to solve the puzzle
- Track your best scores by moves and time

## Features

- **Responsive Design** - Works on desktop and mobile
- **Glass Morphism UI** - Beautiful translucent effects
- **Smooth Animations** - Grid creation and game transitions
- **Local Leaderboard** - Track your best scores
- **TypeScript** - Full type safety
- **Modular Architecture** - Clean, maintainable code

## Tech Stack

- **React 18** with hooks
- **TypeScript** for type safety
- **Vite** for fast development and building
- **CSS3** with custom properties and animations
- **LocalStorage** for score persistence

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd switch

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

Configured for Vercel deployment with `vercel.json`. Simply connect your repository to Vercel for automatic deployments.

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── game/         # Game-specific components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── types/            # TypeScript definitions
├── styles/           # Modular CSS files
└── constants/        # Game configuration
```

## Architecture Highlights

- **Modular CSS** - Separated by component and responsibility
- **Custom Hooks** - Reusable game logic and state management
- **Type Safety** - Comprehensive TypeScript interfaces
- **Performance Optimized** - Memoized components and callbacks
- **Responsive** - Mobile-first design with breakpoints