import React, { useState } from 'react';
import { useProlog } from '../hooks/useProlog';

const KING_SVG = (color) => (
    <svg viewBox="0 0 24 24" fill={color} className="piece">
        <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" />
    </svg>
);

const BOAT_SVG = (color) => (
    <svg viewBox="0 0 24 24" fill={color} className="piece">
        <path d="M20,21V19H18V17H20V15H18V13H20V11H18V9H20V7H18V5H20V3H4V5H6V7H4V9H6V11H4V13H6V15H4V17H6V19H4V21H20Z" />
    </svg>
);

const ChessBoard = ({ board, setBoard, isUserTurn, setIsUserTurn, addLog, winner, setWinner }) => {
    const { isLoaded, getValidMoves, checkMove, getBestMove } = useProlog();
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [validMoves, setValidMoves] = useState([]);

    const handleSquareClick = async (x, y) => {
        if (!isLoaded || !isUserTurn) return;

        // selection logic
        const clickedPos = { x, y };
        
        if (selectedPiece) {
            // Attempt move
            const moveResult = await checkMove(selectedPiece.type, selectedPiece.pos, clickedPos, board);
            if (moveResult.valid) {
                const newBoard = { ...board };
                if (selectedPiece.type === 'user_king') newBoard.uk = clickedPos;
                else newBoard.ub = clickedPos;
                
                // If system king hit
                let win = false;
                if (clickedPos.x === board.sk.x && clickedPos.y === board.sk.y) {
                    win = true;
                }

                setBoard(prev => ({
                    ...newBoard,
                    points: prev.points + moveResult.score
                }));
                
                addLog(`User moved ${selectedPiece.type.split('_')[1]} to (${x},${y}). Points: ${moveResult.score}`, 'user');
                
                setSelectedPiece(null);
                setValidMoves([]);
                
                if (win) {
                    addLog("Victory! System King captured.", "user");
                    setWinner('user');
                    setIsUserTurn(false); // Game end basically
                    return;
                }

                setIsUserTurn(false);
                triggerSystemTurn(newBoard);
            } else {
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else {
            // Select piece
            if (x === board.uk.x && y === board.uk.y) {
                setSelectedPiece({ type: 'user_king', pos: { x, y } });
                const moves = await getValidMoves('user_king', board);
                setValidMoves(moves);
            } else if (x === board.ub.x && y === board.ub.y) {
                setSelectedPiece({ type: 'user_boat', pos: { x, y } });
                const moves = await getValidMoves('user_boat', board);
                setValidMoves(moves);
            }
        }
    };

    const triggerSystemTurn = async (currentBoard) => {
        addLog("System thinking...", "system");
        const move = await getBestMove(currentBoard);
        if (move) {
            // System moves
            const moveResult = await checkMove('system_king', currentBoard.sk, move, currentBoard);
            
            setBoard(prev => ({
                ...prev,
                sk: move,
                points: prev.points + moveResult.score
            }));
            
            addLog(`System moved King to (${move.x},${move.y}).`, 'system');
            
            if (move.x === currentBoard.uk.x && move.y === currentBoard.uk.y) {
                addLog("Defeat! Your King was captured.", "system");
                setWinner('system');
                setIsUserTurn(false);
            } else {
                setIsUserTurn(true);
            }
        }
    };

    const renderSquares = () => {
        const squares = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const isDark = (x + y) % 2 === 1;
                const isValid = validMoves.some(m => m.x === x && m.y === y);
                const isUK = board.uk.x === x && board.uk.y === y && winner !== 'system';
                const isUB = board.ub.x === x && board.ub.y === y;
                const isSK = board.sk.x === x && board.sk.y === y && winner !== 'user';

                squares.push(
                    <div 
                        key={`${x}-${y}`} 
                        className={`square ${isDark ? 'dark' : 'light'} ${isValid ? 'valid' : ''}`}
                        onClick={() => handleSquareClick(x, y)}
                    >
                        {isUK && KING_SVG('#fbbf24')}
                        {isUB && BOAT_SVG('#38bdf8')}
                        {isSK && KING_SVG('#ef4444')}
                    </div>
                );
            }
        }
        return squares;
    };

    return (
        <div className="chess-board glass animate-fade-in">
            {renderSquares()}
        </div>
    );
};

export default ChessBoard;
