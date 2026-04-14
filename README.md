# AI-Chess (Prolog-powered React App)

## Overview
AI-Chess is a browser-based chess variant that uniquely blends modern web technologies with classical logical programming. The game features a User King and a unique "User Boat" piece playing against a "System King". Built using a clean and responsive glassmorphism UI in React, the application handles all complex game logic, movement bounds, point scoring, and opponent AI directly in the browser via Tau-Prolog.

## Technical Stack
- **Frontend Framework**: React 19 + Vite 6
- **Styling**: Vanilla CSS with modern Glassmorphism aesthetics and custom animations.
- **Game Engine & AI**: Tau-Prolog (an ISO Prolog interpreter in JavaScript). The AI utilizes a built-in Minimax algorithm with Alpha-Beta pruning (search depth of 3) to evaluate potential board states natively without an external backend server.

## Features
- **Unique Game Rules**: Control a **User King** (1-step omnidirectional movement) and a **User Boat** (moves like a Rook, sliding vertically and horizontally without jumping). 
- **Point System**: Moves impose a cost (King moves cost 10 points, Boat moves cost 20 points). Capturing the System King awards maximum points and victory.
- **Client-Side AI Opponent**: The System King dynamically evaluates the board using calculated distance metrics and Minimax depth-search, planning an optimal escape sequence or an aggressive capture of your King to cause a defeat.
- **Premium Design**: Smooth user interactions with valid-move highlighting, detailed event logging, and an immersive UI.

## How to Play
1. **Installation**: Clone the repository and install dependencies using `npm install`.
2. **Start Game**: Run `npm run dev` to launch the local Vite development server.
3. **Gameplay**: 
   - Click on your active pieces (User King or User Boat) to generate and view valid highlighted squares.
   - Click a highlighted square to execute your move.
   - Wait for the System King to think and execute its optimal response.
   - Box in and capture the System King to achieve Victory!

## Core Project Structure
- `src/components/`: Contains React UI components (`ChessBoard.jsx`, `SidePanel.jsx`).
- `src/logic/`: Houses the core rules and calculations, specifically `game.pl` (the Prolog rulebase holding all rule bounds and the Minimax definitions).
- `src/hooks/`: Includes `useProlog.js`, a custom React hook that initializes the Tau-Prolog session, manages resolution step limits, and serves asynchronous promises for move validation and AI query requests.
