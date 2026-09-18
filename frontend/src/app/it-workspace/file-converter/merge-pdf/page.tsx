'use client';

import React, { useState } from 'react';
import { FileType, Upload, Trash2, Download, ArrowUp, ArrowDown } from 'lucide-react';

interface PDFFileItem {
  id: string;
  file: File;
}

export default function MergePDFPage() {
  const [pdfFiles, setPdfFiles] = useState<PDFFileItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    const newItems: PDFFileItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(),
      file,
    }));
    setPdfFiles((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setPdfFiles((prev) => prev.filter((pdf) => pdf.id !== id));
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    const updated = [...pdfFiles];
    const temp = updated[idx - 1];
    updated[idx - 1] = updated[idx];
    updated[idx] = temp;
    setPdfFiles(updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx === pdfFiles.length - 1) return;
    const updated = [...pdfFiles];
    const temp = updated[idx + 1];
    updated[idx + 1] = updated[idx];
    updated[idx] = temp;
    setPdfFiles(updated);
  };

  const handleReset = () => {
    setPdfFiles([]);
  };

  const handleMergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    try {
      const formData = new FormData();
      pdfFiles.forEach((p) => formData.append('files', p.file));

      const res = await fetch('http://localhost:8000/api/v1/it-tools/convert/merge-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('PDF merge failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      a.click();
    } catch (err) {
      alert('Error merging PDF files. Please ensure the backend is running.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileType className="w-5 h-5 text-blue-600" />
          <span>File Utility — Merge PDF Files</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Combine multiple PDF documents into a single unified PDF file.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config & Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Merge Settings</h2>

          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Total Files:</strong> {pdfFiles.length}</p>
            <p className="text-[11px] text-slate-400">Reorder files using arrow buttons before merging.</p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              onClick={handleMergePDFs}
              disabled={pdfFiles.length < 2 || isMerging}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isMerging ? 'Merging PDFs...' : 'Merge PDF Documents'}</span>
            </button>

            <button
              onClick={handleReset}
              className="w-full py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-medium"
            >
              Reset List
            </button>
          </div>
        </div>

        {/* Upload & Files List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col">
          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50 cursor-pointer transition-colors relative">
            <input
              type="file"
              multiple
              accept="application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Drop PDF documents here or click to browse</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Select 2 or more PDF files</p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              PDF Merge Queue ({pdfFiles.length})
            </h3>

            {pdfFiles.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No PDF files added to queue yet.</p>
            ) : (
              <div className="space-y-2">
                {pdfFiles.map((pdf, idx) => (
                  <div key={pdf.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-3 truncate">
                      <span className="font-mono text-slate-400 font-bold">{idx + 1}.</span>
                      <FileType className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">{pdf.file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({(pdf.file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === pdfFiles.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemove(pdf.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
