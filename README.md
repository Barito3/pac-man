# Pac-Man Game

A modern implementation of the classic Pac-Man arcade game using React, TypeScript, and Tailwind CSS.

## Features

- Smooth and responsive Pac-Man movement using arrow keys
- Realistic ghost AI with different behaviors:
  - **Blinky (Red)**: Directly chases Pac-Man
  - **Pinky (Pink)**: Targets a position 4 tiles ahead of Pac-Man
  - **Inky (Cyan)**: Uses Blinky's position to set up ambushes
  - **Clyde (Orange)**: Alternates between chasing and retreating
- Ghosts switch between chase, scatter, and frightened modes
- Power pellets that allow Pac-Man to eat ghosts
- Responsive design that works on various screen sizes

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pac-man.git
   cd pac-man
   ```

2. Install dependencies:
   ```
   npm install
   # or with yarn
   yarn
   # or with bun
   bun install
   ```

3. Start the development server:
   ```
   npm run dev
   # or with yarn
   yarn dev
   # or with bun
   bun dev
   ```

4. Open your browser and navigate to `http://localhost:5173` to play the game.

## How to Play

- Use the arrow keys to navigate Pac-Man through the maze
- Eat all the dots to complete the level
- Avoid ghosts — they'll cost you a life if they catch you
- Eat power pellets to temporarily turn the ghosts blue, allowing you to eat them for bonus points
- You have 3 lives to start

## Technical Implementation

- Built with Vite for fast development and optimized production builds
- React with TypeScript for type-safe components and game logic
- Game engine implemented with custom hooks for state management
- Ghost AI with individual behavior patterns
- Collision detection for walls and ghosts
- Tailwind CSS for responsive styling

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Pac-Man game by Namco
- Inspired by the game mechanics described in [The Pac-Man Dossier](https://www.gamasutra.com/view/feature/132330/the_pacman_dossier.php)
