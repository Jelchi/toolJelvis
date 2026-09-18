'use client';

import React, { useState } from 'react';
import { Gamepad2, RotateCcw, Trophy, User, Bot } from 'lucide-react';

type Player = 'X' | 'O';
type Board = (Player | null)[];

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Tie' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const checkWinner = (currentBoard: Board): { winner: Player | 'Tie' | null; line: number[] | null } => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combo };
      }
    }
    if (currentBoard.every((cell) => cell !== null)) {
      return { winner: 'Tie', line: null };
    }
    return { winner: null, line: null };
  };

  const handleClickCell = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = turn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      updateScores(result.winner);
    } else {
      const nextTurn = turn === 'X' ? 'O' : 'X';
      setTurn(nextTurn);

      // AI move logic if enabled
      if (isAiMode && nextTurn === 'O') {
        setTimeout(() => makeAiMove(newBoard), 300);
      }
    }
  };

  const makeAiMove = (currentBoard: Board) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);

    if (emptyIndices.length === 0) return;

    // Simple AI: pick random empty slot
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const newBoard = [...currentBoard];
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.line);
      updateScores(result.winner);
    } else {
      setTurn('X');
    }
  };

  const updateScores = (resultWinner: Player | 'Tie') => {
    setScores((prev) => {
      if (resultWinner === 'X') return { ...prev, X: prev.X + 1 };
      if (resultWinner === 'O') return { ...prev, O: prev.O + 1 };
      return { ...prev, ties: prev.ties + 1 };
    });
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-blue-600" />
            <span>Tic Tac Toe</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Classic 3x3 strategy game. Play against AI or a friend.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsAiMode(!isAiMode);
              resetGame();
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isAiMode ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {isAiMode ? <Bot className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-slate-600" />}
            <span>Mode: {isAiMode ? 'vs AI Bot' : '2 Player (PvP)'}</span>
          </button>

          <button
            onClick={resetGame}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Game</span>
          </button>
        </div>
      </div>

      {/* Scoreboard & Status */}
      <div className="grid grid-cols-3 gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center">
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400">Player X</span>
          <p className="text-xl font-bold text-blue-600">{scores.X}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400">Ties</span>
          <p className="text-xl font-bold text-slate-700">{scores.ties}</p>
        </div>
        <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400">{isAiMode ? 'AI Bot (O)' : 'Player O'}</span>
          <p className="text-xl font-bold text-red-500">{scores.O}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs flex flex-col items-center justify-center space-y-6">
        {winner ? (
          <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>{winner === 'Tie' ? "It's a Tie!" : `Player ${winner} Wins! 🎉`}</span>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-600">
            Current Turn: <span className={turn === 'X' ? 'text-blue-600 font-bold' : 'text-red-500 font-bold'}>Player {turn}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 w-72 h-72">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleClickCell(idx)}
                className={`w-full h-full border rounded-2xl text-4xl font-black flex items-center justify-center transition-all ${
                  isWinningCell
                    ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-md'
                    : cell === 'X'
                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                    : cell === 'O'
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {cell}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
