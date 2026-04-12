import { useState, useEffect, useCallback } from 'react';
import { gameLogic } from '../logic/gameLogic';

const pl = window.pl;

export const useProlog = () => {
    const [session, setSession] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Increase resolution step limit from 1000 to large number for Minimax expansion
        const s = pl.create(1000000);
        s.consult(gameLogic, {
            success: () => {
                setSession(s);
                setIsLoaded(true);
                console.log("Prolog Engine Loaded Successfully (Local)");
            },
            error: (err) => console.error("Prolog Consult Error:", err)
        });
    }, []);

    const query = useCallback((queryString) => {
        return new Promise((resolve, reject) => {
            if (!session) return reject("Session not initialized");

            session.query(queryString, {
                success: () => {
                    const results = [];
                    const collect = () => {
                        session.answer({
                            success: (answer) => {
                                results.push(answer);
                                collect();
                            },
                            fail: () => resolve(results),
                            error: (err) => reject(err),
                            limit: () => {
                                console.warn("Prolog step limit reached for query:", queryString);
                                resolve(results);
                            }
                        });
                    };
                    collect();
                },
                error: (err) => reject(err)
            });
        });
    }, [session]);

    const getValidMoves = async (piece, board) => {
        const boardTerm = `board(pos(${board.uk.x},${board.uk.y}), pos(${board.ub.x},${board.ub.y}), pos(${board.sk.x},${board.sk.y}))`;
        const q = `valid_moves(${piece}, ${boardTerm}, pos(X, Y)).`;
        const answers = await query(q);
        return answers.map(a => ({
            x: parseInt(a.lookup("X").toJavaScript()),
            y: parseInt(a.lookup("Y").toJavaScript())
        }));
    };

    const getBestMove = async (board) => {
        const boardTerm = `board(pos(${board.uk.x},${board.uk.y}), pos(${board.ub.x},${board.ub.y}), pos(${board.sk.x},${board.sk.y}))`;
        const q = `minimax(${boardTerm}, 3, false, pos(X, Y), Value).`;
        const answers = await query(q);
        if (answers.length > 0) {
            return {
                x: parseInt(answers[0].lookup("X").toJavaScript()),
                y: parseInt(answers[0].lookup("Y").toJavaScript())
            };
        }
        return null;
    };

    const checkMove = async (piece, from, to, board) => {
        const boardTerm = `board(pos(${board.uk.x},${board.uk.y}), pos(${board.ub.x},${board.ub.y}), pos(${board.sk.x},${board.sk.y}))`;
        const q = `move(${piece}, pos(${from.x}, ${from.y}), pos(${to.x}, ${to.y}), ${boardTerm}, NextBoard, Score).`;
        const answers = await query(q);
        if (answers.length > 0) {
            const score = parseInt(answers[0].lookup("Score").toJavaScript());
            return { valid: true, score };
        }
        return { valid: false };
    };

    return { isLoaded, getValidMoves, getBestMove, checkMove };
};
