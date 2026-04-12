export const gameLogic = `
% Game Logic for Chess Variant
:- use_module(library(lists)).

% --- Movement Definitions ---

board_coord(0). board_coord(1). board_coord(2). board_coord(3).
board_coord(4). board_coord(5). board_coord(6). board_coord(7).

king_move_offset(-1, -1). king_move_offset(-1, 0). king_move_offset(-1, 1).
king_move_offset(0, -1).                           king_move_offset(0, 1).
king_move_offset(1, -1).  king_move_offset(1, 0).  king_move_offset(1, 1).

% King moves 1 step in any direction (8 directions)
king_move(pos(X1, Y1), pos(X2, Y2)) :-
    king_move_offset(DX, DY),
    X2 is X1 + DX,
    Y2 is Y1 + DY,
    board_coord(X2),
    board_coord(Y2).

% Boat moves any number of steps horizontally/vertically, no jumping
boat_move(pos(X, Y), pos(NX, NY), Board) :-
    board_coord(NX),
    board_coord(NY),
    (X = NX, Y \\= NY ; Y = NY, X \\= NX),
    no_obstacle(pos(X, Y), pos(NX, NY), Board).

% Check for obstacles between two points (non-inclusive)
no_obstacle(pos(X, Y1), pos(X, Y2), Board) :-
    Y1 < Y2, !, NY is Y1 + 1, (NY =:= Y2 -> true ; \\+ occupied(pos(X, NY), Board), no_obstacle(pos(X, NY), pos(X, Y2), Board)).
no_obstacle(pos(X, Y1), pos(X, Y2), Board) :-
    Y1 > Y2, !, NY is Y1 - 1, (NY =:= Y2 -> true ; \\+ occupied(pos(X, NY), Board), no_obstacle(pos(X, NY), pos(X, Y2), Board)).
no_obstacle(pos(X1, Y), pos(X2, Y), Board) :-
    X1 < X2, !, NX is X1 + 1, (NX =:= X2 -> true ; \\+ occupied(pos(NX, Y), Board), no_obstacle(pos(NX, Y), pos(X2, Y), Board)).
no_obstacle(pos(X1, Y), pos(X2, Y), Board) :-
    X1 > X2, !, NX is X1 - 1, (NX =:= X2 -> true ; \\+ occupied(pos(NX, Y), Board), no_obstacle(pos(NX, Y), pos(X2, Y), Board)).
no_obstacle(_, _, _).

% Position is occupied by any piece
occupied(Pos, board(UK, UB, SK)) :-
    Pos = UK ; Pos = UB ; Pos = SK.

% --- Point System ---

move_cost(king, 10).
move_cost(boat, 20).
kill_reward(100).
lose_penalty(100).

% --- Game State Transitions ---

% move(Piece, From, To, CurrentBoard, NextBoard, ScoreChange)
move(user_king, From, To, board(From, UB, SK), board(To, UB, SK), Score) :-
    king_move(From, To),
    To \\= UB,
    (To = SK -> kill_reward(R), Score is -10 + R ; Score = -10).

move(user_boat, From, To, board(UK, From, SK), board(UK, To, SK), Score) :-
    boat_move(From, To, board(UK, From, SK)),
    To \\= UK,
    (To = SK -> kill_reward(R), Score is -20 + R ; Score = -20).

move(system_king, From, To, board(UK, UB, From), board(UK, UB, To), Score) :-
    king_move(From, To),
    To \\= UB,
    (To = UK -> lose_penalty(P), Score is -P ; Score = 0).

% --- AI Engine (Minimax) ---

% evaluate(Board, Score) - Positive favors User, Negative favors System
evaluate(board(pos(UX, UY), pos(BX, BY), pos(SX, SY)), Score) :-
    % Distance between System King and User King
    DistKing is abs(UX - SX) + abs(UY - SY),
    % Distance between Boat and System King
    DistBoat is abs(BX - SX) + abs(BY - SY),
    % Simple heuristic
    Score is DistKing * 5 - DistBoat * 2.

% minimax(Board, Depth, Maximizing, BestMove, Value) (Adapter)
minimax(Board, Depth, Maximizing, BestMove, Value) :-
    alpha_beta(Board, Depth, -10000, 10000, Maximizing, BestMove, Value).

% get_moves(+Maximizing, +Board, -Moves)
get_moves(true, Board, Moves) :-
    findall(m(To, NextBoard, ScoreChange), 
        (move(user_king, _, To, Board, NextBoard, ScoreChange) ; 
         move(user_boat, _, To, Board, NextBoard, ScoreChange)), 
        Moves).

get_moves(false, Board, Moves) :-
    findall(m(To, NextBoard, ScoreChange), 
        move(system_king, _, To, Board, NextBoard, ScoreChange), 
        Moves).

% alpha_beta(+Board, +Depth, +Alpha, +Beta, +Maximizing, -BestMove, -BestValue)
alpha_beta(Board, 0, _, _, _, none, Value) :-
    evaluate(Board, Value), !.

alpha_beta(Board, Depth, Alpha, Beta, Maximizing, BestMove, BestValue) :-
    Depth > 0,
    get_moves(Maximizing, Board, Moves),
    ( Moves = [] -> evaluate(Board, BestValue), BestMove = none
    ; evaluate_moves(Moves, Depth, Alpha, Beta, Maximizing, none, BestMove, BestValue)
    ).

% evaluate_moves(+Moves, +Depth, +Alpha, +Beta, +Maximizing, +RecordMove, -BestMove, -BestValue)
evaluate_moves([], _, Alpha, _, true, RecordMove, RecordMove, Alpha).
evaluate_moves([], _, _, Beta, false, RecordMove, RecordMove, Beta).

evaluate_moves([m(To, NextBoard, ScoreChange)|Rest], Depth, Alpha, Beta, true, RecordMove, BestMove, BestValue) :-
    D1 is Depth - 1,
    alpha_beta(NextBoard, D1, Alpha, Beta, false, _, ChildValue),
    Value is ChildValue + ScoreChange,
    ( Value >= Beta -> 
        BestMove = To, BestValue = Value % Beta cut-off
    ; Value > Alpha ->
        evaluate_moves(Rest, Depth, Value, Beta, true, To, BestMove, BestValue)
    ;
        ( RecordMove = none -> NextRecord = To ; NextRecord = RecordMove ),
        evaluate_moves(Rest, Depth, Alpha, Beta, true, NextRecord, BestMove, BestValue)
    ).

evaluate_moves([m(To, NextBoard, ScoreChange)|Rest], Depth, Alpha, Beta, false, RecordMove, BestMove, BestValue) :-
    D1 is Depth - 1,
    alpha_beta(NextBoard, D1, Alpha, Beta, true, _, ChildValue),
    Value is ChildValue + ScoreChange,
    ( Value =< Alpha -> 
        BestMove = To, BestValue = Value % Alpha cut-off
    ; Value < Beta ->
        evaluate_moves(Rest, Depth, Alpha, Value, false, To, BestMove, BestValue)
    ;
        ( RecordMove = none -> NextRecord = To ; NextRecord = RecordMove ),
        evaluate_moves(Rest, Depth, Alpha, Beta, false, NextRecord, BestMove, BestValue)
    ).

% Helper to get all valid moves for a piece (for GUI)
valid_moves(user_king, board(UK, UB, SK), To) :-
    king_move(UK, To), To \\= UB, To \\= SK.
valid_moves(user_king, board(UK, UB, SK), SK) :-
    king_move(UK, SK).

valid_moves(user_boat, board(UK, UB, SK), To) :-
    boat_move(UB, To, board(UK, UB, SK)), To \\= UK, To \\= SK.
valid_moves(user_boat, board(UK, UB, SK), SK) :-
    boat_move(UB, SK, board(UK, UB, SK)).
`;
