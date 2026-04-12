import React, { useState } from 'react';
import { useProlog } from '../hooks/useProlog';

const USER_KING_IMG = <img src="https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg" className="piece" alt="User King" />;
const SYSTEM_KING_IMG = <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg" className="piece" alt="System King" />;
const USER_BOAT_IMG = <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg" className="piece" alt="User Boat" />;

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
                setTimeout(() => triggerSystemTurn(newBoard), 50);
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
                        {x === 0 && <span className="rank-label">{8 - y}</span>}
                        {y === 7 && <span className="file-label">{String.fromCharCode(97 + x)}</span>}
                        {isUK && USER_KING_IMG}
                        {isUB && USER_BOAT_IMG}
                        {isSK && SYSTEM_KING_IMG}
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
