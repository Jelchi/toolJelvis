'use client';

import React, { useState } from 'react';
import { FileCode, Check, AlertCircle, Copy, Trash2, AlignLeft, Minimize2 } from 'lucide-react';

export default function JSONFormatterPage() {
  const [inputJSON, setInputJSON] = useState<string>('{\n  "project": "NEXUS WORKSPACE",\n  "status": "active",\n  "modules": ["Notes", "Tasks", "Flowchart", "Music"]\n}');
  const [outputJSON, setOutputJSON] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleFormat = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputJSON);
      setOutputJSON(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON input format.');
      setOutputJSON('');
    }
  };

  const handleMinify = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(inputJSON);
      setOutputJSON(JSON.stringify(parsed));
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON input format.');
      setOutputJSON('');
    }
  };

  const handleCopy = () => {
    if (outputJSON || inputJSON) {
      navigator.clipboard.writeText(outputJSON || inputJSON);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  const handleClear = () => {
    setInputJSON('');
    setOutputJSON('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primaryText flex items-center gap-2">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <span>IT Workspace — JSON Formatter & Validator</span>
        </h1>
        <p className="text-xs text-secondaryText mt-0.5">
          Safely format, minify, and validate JSON payloads entirely client-side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Text Area */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3 flex flex-col shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondaryText">Input JSON</span>
            <button onClick={handleClear} className="text-xs text-secondaryText hover:text-red-400 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          <textarea
            value={inputJSON}
            onChange={(e) => setInputJSON(e.target.value)}
            placeholder="Paste raw JSON string here..."
            className="flex-1 w-full min-h-[350px] p-3 bg-background border border-border rounded-lg text-xs font-mono text-primaryText focus:outline-none focus:border-accent-500"
          />

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleFormat}
              className="flex-1 py-1.5 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Format (Prettify)</span>
            </button>
            <button
              onClick={handleMinify}
              className="flex-1 py-1.5 bg-background border border-border hover:border-accent-500 text-primaryText rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Minify</span>
            </button>
          </div>
        </div>

        {/* Output Text Area */}
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3 flex flex-col shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-secondaryText">Formatted Output</span>
            <button onClick={handleCopy} className="text-xs text-accent-500 hover:underline flex items-center gap-1">
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {errorMsg ? (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">JSON Syntax Error</p>
                <p className="text-[11px] mt-0.5 font-mono">{errorMsg}</p>
              </div>
            </div>
          ) : (
            <textarea
              readOnly
              value={outputJSON || inputJSON}
              placeholder="Formatted JSON will appear here..."
              className="flex-1 w-full min-h-[350px] p-3 bg-background border border-border rounded-lg text-xs font-mono text-emerald-400 focus:outline-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}
