import React, { useState } from 'react';
import ChessBoard from './components/ChessBoard';
import SidePanel from './components/SidePanel';
import './index.css';

const INITIAL_BOARD = {
  uk: { x: 4, y: 7 }, // User King (Bottom center)
  ub: { x: 3, y: 7 }, // User Boat
  sk: { x: 4, y: 0 }, // System King (Top center)
  points: 1000
};

function App() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [logs, setLogs] = useState([
    { text: "Game started. Your turn.", type: "system" }
  ]);

  const addLog = (text, type) => {
    setLogs(prev => [...prev.slice(-19), { text, type }]);
  };

  const handleReset = () => {
    setBoard(INITIAL_BOARD);
    setIsUserTurn(true);
    setWinner(null);
    setLogs([{ text: "Game reset.", type: "system" }]);
  };

  return (
    <div className="game-container">
      <ChessBoard 
        board={board} 
        setBoard={setBoard} 
        isUserTurn={isUserTurn} 
        setIsUserTurn={setIsUserTurn}
        addLog={addLog}
        winner={winner}
        setWinner={setWinner}
      />
      <SidePanel 
        points={board.points} 
        logs={logs} 
        onReset={handleReset} 
      />
      {winner && (
        <div className="winner-popup glass animate-fade-in">
          <h2 className={winner === 'user' ? 'text-blue' : 'text-red'}>
            {winner === 'user' ? 'Victory!' : 'Defeat!'}
          </h2>
          <p>
            {winner === 'user' ? 'You captured the System King.' : 'The System captured your King.'}
          </p>
          <button onClick={handleReset} className="glass play-again-btn">
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
