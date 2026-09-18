'use client';

import React, { useState } from 'react';
import { Crown, RotateCcw, History, ArrowRight } from 'lucide-react';

type PieceColor = 'w' | 'b';
type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

interface Piece {
  type: PieceType;
  color: PieceColor;
}

type BoardSquare = Piece | null;
type ChessBoard = BoardSquare[][];

const initialBoardState: ChessBoard = [
  [
    { type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' },
    { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }
  ],
  Array(8).fill({ type: 'p', color: 'b' }),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill({ type: 'p', color: 'w' }),
  [
    { type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' },
    { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }
  ]
];

export default function ChessPage() {
  const [board, setBoard] = useState<ChessBoard>(initialBoardState);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const pieceSymbols: Record<PieceColor, Record<PieceType, string>> = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
  };

  const fileNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const handleSquareClick = (r: number, c: number) => {
    const clickedPiece = board[r][c];

    // If a piece of the current turn is clicked, select it
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare([r, c]);
      return;
    }

    // If a square is selected and another square is clicked, attempt move
    if (selectedSquare) {
      const [fromR, fromC] = selectedSquare;
      const movingPiece = board[fromR][fromC];

      if (movingPiece) {
        // Create new board state
        const newBoard = board.map((row) => [...row]);
        newBoard[r][c] = movingPiece;
        newBoard[fromR][fromC] = null;

        setBoard(newBoard);

        // Move notation log e.g., e2 -> e4
        const fromSquare = `${fileNames[fromC]}${8 - fromR}`;
        const toSquare = `${fileNames[c]}${8 - r}`;
        const moveText = `${movingPiece.color.toUpperCase()}: ${movingPiece.type.toUpperCase()} ${fromSquare} -> ${toSquare}`;

        setMoveHistory([moveText, ...moveHistory]);
        setTurn(turn === 'w' ? 'b' : 'w');
        setSelectedSquare(null);
      }
    }
  };

  const handleResetGame = () => {
    setBoard(initialBoardState);
    setTurn('w');
    setSelectedSquare(null);
    setMoveHistory([]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Crown className="w-5 h-5 text-blue-600" />
            <span>Interactive Chess</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Classic 8x8 Chess game engine with move log tracking.</p>
        </div>

        <button
          onClick={handleResetGame}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>New Game</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 8x8 Chessboard */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center justify-center space-y-4">
          <div className="text-xs font-semibold text-slate-700 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span>Turn:</span>
            <span className={`font-bold ${turn === 'w' ? 'text-blue-600' : 'text-slate-900'}`}>
              {turn === 'w' ? "White's Turn ♔" : "Black's Turn ♚"}
            </span>
          </div>

          {/* Board */}
          <div className="border-4 border-slate-700 rounded-xl overflow-hidden shadow-lg">
            {board.map((row, rIdx) => (
              <div key={rIdx} className="flex">
                {row.map((square, cIdx) => {
                  const isLight = (rIdx + cIdx) % 2 === 0;
                  const isSelected = selectedSquare && selectedSquare[0] === rIdx && selectedSquare[1] === cIdx;

                  return (
                    <div
                      key={cIdx}
                      onClick={() => handleSquareClick(rIdx, cIdx)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-3xl font-bold cursor-pointer transition-colors select-none ${
                        isSelected
                          ? 'bg-blue-300 border-2 border-blue-600'
                          : isLight
                          ? 'bg-amber-50 text-slate-900 hover:bg-blue-100'
                          : 'bg-emerald-800 text-white hover:bg-blue-200 hover:text-slate-900'
                      }`}
                    >
                      {square && pieceSymbols[square.color][square.type]}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Move History Log */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Move History ({moveHistory.length})</span>
          </h2>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs overflow-y-auto max-h-80 space-y-1">
            {moveHistory.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-[11px]">Select a piece to make the first move.</p>
            ) : (
              moveHistory.map((m, idx) => (
                <div key={idx} className="p-1.5 bg-white border border-slate-100 rounded text-slate-800 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">{moveHistory.length - idx}.</span>
                  <span>{m}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
