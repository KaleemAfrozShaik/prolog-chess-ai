# AI Chess Engine (Prolog + React)

A browser-based chess variant powered by a **Prolog AI engine** and a **React + Vite** frontend.

## Overview

This project beautifully integrates classic declarative logic programming directly into a modern web stack:

- **Frontend**: Built with React and structured using clean, glassmorphism UI principles. The responsive board dynamically highlights valid paths.
- **Backend/AI Loop**: Leverages **Tau Prolog**, an ISO Prolog interpreter completely in JavaScript, allowing Prolog predicates to run locally in the browser with no external server required.
- **Game Logic**: Uses a Minimax algorithm executing in Prolog via a unified `.pl` logic source. Features a complete set of rules around collisions, grid bounds, unique piece abilities (e.g. King logic vs Boat logic), and game-over detection (Capture-to-Win). Wait times are natural as it evaluates thousands of board possibilities natively!

## Play

1. Clone the repo and install dependencies with `npm install`
2. Start the local dev server using `npm run dev`
3. Click on the User King (yellow crown) to view valid generated moves, select a destination, and let the AI counterpart ponder its best move. Capture the System King to gain victory!

## Technologies

- React 19
- Vite 6
- Tau-Prolog 0.3.x
- Vanilla CSS with custom glassmorphism styles

Enjoy outplaying the Prolog simulation!
