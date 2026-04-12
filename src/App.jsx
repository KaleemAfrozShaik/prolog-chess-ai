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
    <div className="game-container" style={{ display: 'flex', gap: '2rem', width: '100%', height: '100%', position: 'relative' }}>
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
        <div className="winner-popup glass animate-fade-in" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '3rem', textAlign: 'center', zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid #38bdf8', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ fontSize: '2.5rem', color: winner === 'user' ? '#38bdf8' : '#ef4444', marginBottom: '1rem' }}>
            {winner === 'user' ? 'Victory!' : 'Defeat!'}
          </h2>
          <p style={{ marginBottom: '2rem', color: '#e2e8f0', fontSize: '1.2rem' }}>
            {winner === 'user' ? 'You captured the System King.' : 'The System captured your King.'}
          </p>
          <button onClick={handleReset} className="glass" style={{ padding: '0.75rem 1.5rem', cursor: 'pointer', color: 'white', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem', fontSize: '1.1rem', transition: 'all 0.2s' }}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
