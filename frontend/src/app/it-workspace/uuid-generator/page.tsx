'use client';

import React, { useState } from 'react';
import { KeyRound, Copy, Download, RefreshCw, Check, Sparkles } from 'lucide-react';

export default function UUIDGeneratorPage() {
  const [version, setVersion] = useState<'v4' | 'v1' | 'v5'>('v4');
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphenated, setHyphenated] = useState<boolean>(true);
  const [namespace, setNamespace] = useState<string>('dns');
  const [name, setName] = useState<string>('nexus.workspace');
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateUUIDs = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      let raw = crypto.randomUUID(); // Cryptographically secure random UUID v4
      if (!hyphenated) raw = raw.replace(/-/g, '');
      if (uppercase) raw = raw.toUpperCase();
      list.push(raw);
    }
    setUuids(list);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    alert('All UUIDs copied to clipboard!');
  };

  const handleDownload = (format: 'txt' | 'csv') => {
    const content = format === 'csv' ? `id,uuid\n${uuids.map((u, i) => `${i + 1},${u}`).join('\n')}` : uuids.join('\n');
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids.${format}`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-primaryText flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <span>IT Workspace — UUID Generator</span>
        </h1>
        <p className="text-xs text-secondaryText mt-0.5">
          Generate cryptographically secure Universally Unique Identifiers (v1, v4, v5).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondaryText">Configuration</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primaryText">UUID Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as any)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-primaryText focus:outline-none focus:border-accent-500"
            >
              <option value="v4">UUID v4 (Random / Cryptographic)</option>
              <option value="v1">UUID v1 (Timestamp-based)</option>
              <option value="v5">UUID v5 (Namespace & Name)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primaryText">Quantity ({quantity})</label>
            <input
              type="range"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full accent-accent-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs text-primaryText cursor-pointer">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="rounded text-accent-500"
              />
              <span>Uppercase (ABC-123)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-primaryText cursor-pointer">
              <input
                type="checkbox"
                checked={hyphenated}
                onChange={(e) => setHyphenated(e.target.checked)}
                className="rounded text-accent-500"
              />
              <span>Hyphenated (with dashes)</span>
            </label>
          </div>

          <button
            onClick={generateUUIDs}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate UUIDs</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-secondaryText">Generated UUIDs ({uuids.length})</h2>

            {uuids.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAll}
                  className="px-2.5 py-1 bg-background border border-border hover:border-accent-500 text-xs text-primaryText rounded flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy All</span>
                </button>
                <button
                  onClick={() => handleDownload('txt')}
                  className="px-2.5 py-1 bg-background border border-border hover:border-accent-500 text-xs text-primaryText rounded flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>TXT</span>
                </button>
                <button
                  onClick={() => handleDownload('csv')}
                  className="px-2.5 py-1 bg-background border border-border hover:border-accent-500 text-xs text-primaryText rounded flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 bg-background border border-border rounded-lg p-3 font-mono text-xs overflow-y-auto max-h-96 space-y-1.5">
            {uuids.length === 0 ? (
              <p className="text-secondaryText text-center py-12">Click "Generate UUIDs" to create unique identifiers.</p>
            ) : (
              uuids.map((u, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 hover:bg-surface rounded transition-colors group">
                  <span className="text-emerald-400 select-all">{u}</span>
                  <button
                    onClick={() => handleCopy(u, idx)}
                    className="p-1 text-secondaryText hover:text-primaryText"
                    title="Copy"
                  >
                    {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
