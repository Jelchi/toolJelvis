'use client';

import React, { useState } from 'react';
import { FileImage, Upload, Trash2, Download, RefreshCw, FileText } from 'lucide-react';

interface ImageFileItem {
  id: string;
  file: File;
  previewUrl: string;
}

export default function JPGToPDFPage() {
  const [images, setImages] = useState<ImageFileItem[]>([]);
  const [paperSize, setPaperSize] = useState<string>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    const newItems: ImageFileItem[] = selectedFiles.map((file) => ({
      id: Math.random().toString(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleReset = () => {
    setImages([]);
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsConverting(true);

    try {
      const formData = new FormData();
      images.forEach((img) => formData.append('files', img.file));

      const res = await fetch(`http://localhost:8000/api/v1/it-tools/convert/jpg-to-pdf?paper_size=${paperSize}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Backend conversion failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted-document.pdf';
      a.click();
    } catch (err) {
      alert('Error converting images to PDF. Ensure backend is running.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-primaryText flex items-center gap-2">
          <FileImage className="w-5 h-5 text-emerald-400" />
          <span>File Converter — JPG to PDF</span>
        </h1>
        <p className="text-xs text-secondaryText mt-0.5">
          Convert JPG, JPEG, and PNG images into a unified PDF document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Config */}
        <div className="bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondaryText">Document Settings</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primaryText">Paper Size</label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-2 text-xs text-primaryText focus:outline-none focus:border-accent-500"
            >
              <option value="A4">A4 (210 x 297 mm)</option>
              <option value="Letter">Letter (8.5 x 11 in)</option>
              <option value="Legal">Legal (8.5 x 14 in)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-primaryText">Orientation</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOrientation('portrait')}
                className={`py-1.5 border rounded-lg text-xs font-semibold ${
                  orientation === 'portrait' ? 'bg-accent-500/10 border-accent-500 text-accent-500' : 'border-border text-secondaryText'
                }`}
              >
                Portrait
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`py-1.5 border rounded-lg text-xs font-semibold ${
                  orientation === 'landscape' ? 'bg-accent-500/10 border-accent-500 text-accent-500' : 'border-border text-secondaryText'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2">
            <button
              onClick={handleConvert}
              disabled={images.length === 0 || isConverting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isConverting ? 'Converting...' : 'Convert to PDF'}</span>
            </button>

            <button
              onClick={handleReset}
              className="w-full py-1.5 border border-border text-secondaryText hover:text-primaryText rounded-lg text-xs font-medium"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Image Dropzone & Preview List */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5 space-y-4 shadow-sm flex flex-col">
          <div className="border-2 border-dashed border-border hover:border-accent-500/50 rounded-xl p-8 text-center bg-background/50 cursor-pointer transition-colors relative">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-accent-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-primaryText">Drop JPG or PNG images here</p>
            <p className="text-[11px] text-secondaryText mt-0.5">Supports JPG, JPEG, PNG format</p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
            <h3 className="text-xs font-bold text-secondaryText uppercase tracking-wider">
              Selected Images ({images.length})
            </h3>

            {images.length === 0 ? (
              <p className="text-xs text-secondaryText text-center py-6">No images selected yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="relative group border border-border rounded-lg overflow-hidden bg-background">
                    <img src={img.previewUrl} alt="Preview" className="w-full h-24 object-cover" />
                    <button
                      onClick={() => handleRemove(img.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <p className="text-[10px] text-secondaryText truncate px-2 py-1 bg-surface border-t border-border">
                      {img.file.name}
                    </p>
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
