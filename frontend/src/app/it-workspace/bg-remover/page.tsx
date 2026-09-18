'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Scissors, Upload, Download, RefreshCw, Eye, Sparkles, Palette,
  Pipette, Eraser, Image as ImageIcon, RotateCcw, Check, Sparkle
} from 'lucide-react';

export default function BackgroundRemoverPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  );
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);

  // Removal Controls
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [targetColorHex, setTargetColorHex] = useState('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(35);
  const [feather, setFeather] = useState<number>(15);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);

  // Background Replacement Modes
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'gradient'>('transparent');
  const [replaceColor, setReplaceColor] = useState('#2563EB');
  const [replaceGradient, setReplaceGradient] = useState('linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sample Images Preset catalog
  const samplePresets = [
    { label: 'Model Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Product Photo', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
    { label: 'Gadget / Watch', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
  ];

  // Process Background Removal algorithm on Canvas
  const processRemoval = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const targetR = targetColor.r;
      const targetG = targetColor.g;
      const targetB = targetColor.b;

      // Tolerance color threshold range (0 - 255)
      const tol = (tolerance / 100) * 220;
      const ftr = feather;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB space
        const dist = Math.sqrt(
          (r - targetR) * (r - targetR) +
          (g - targetG) * (g - targetG) +
          (b - targetB) * (b - targetB)
        );

        if (dist < tol) {
          if (ftr > 0 && dist > tol - ftr) {
            const alphaRatio = (dist - (tol - ftr)) / ftr;
            data[i + 3] = Math.round(alphaRatio * 255);
          } else {
            data[i + 3] = 0; // Transparent
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = originalImage;
  };

  useEffect(() => {
    processRemoval();
  }, [originalImage, targetColor, tolerance, feather]);

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setOriginalImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Eyedropper click on image canvas to select background color
  const handleCanvasClickToPickColor = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isEyedropperActive || !imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const clickX = Math.floor((e.clientX - rect.left) * scaleX);
    const clickY = Math.floor((e.clientY - rect.top) * scaleY);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
      const r = pixel[0];
      const g = pixel[1];
      const b = pixel[2];

      setTargetColor({ r, g, b });
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
      setTargetColorHex(hex);
      setIsEyedropperActive(false);
    }
  };

  // Auto Detect White/Light Background
  const handleAutoDetectLightBg = () => {
    setTargetColor({ r: 255, g: 255, b: 255 });
    setTargetColorHex('#FFFFFF');
    setTolerance(35);
  };

  // Download Transparent PNG File
  const handleDownloadPng = () => {
    if (!processedDataUrl) return;

    // Create temp canvas to render final background + image
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    const resultImg = new Image();

    resultImg.onload = () => {
      finalCanvas.width = resultImg.width;
      finalCanvas.height = resultImg.height;

      if (ctx) {
        if (bgMode === 'color') {
          ctx.fillStyle = replaceColor;
          ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        } else if (bgMode === 'gradient') {
          const grad = ctx.createLinearGradient(0, 0, finalCanvas.width, finalCanvas.height);
          grad.addColorStop(0, '#3B82F6');
          grad.addColorStop(1, '#8B5CF6');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        }

        ctx.drawImage(resultImg, 0, 0);

        const link = document.createElement('a');
        link.download = 'nexus-bg-removed.png';
        link.href = finalCanvas.toDataURL('image/png');
        link.click();
      }
    };
    resultImg.src = processedDataUrl;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-rose-500" />
            <span>AI & Canvas Remove Background Studio</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Hapus background foto secara instan, ubah transparansi PNG, atau ganti latar belakang dengan warna & gradien custom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Foto Baru</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Grid: Left Controls + Right Live Canvas Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Hapus Background</h2>

          {/* Preset Samples */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Contoh Preset Foto:</label>
            <div className="grid grid-cols-3 gap-2">
              {samplePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setOriginalImage(p.url)}
                  className={`p-1.5 border rounded-xl text-[10px] font-bold text-center transition-all ${
                    originalImage === p.url ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Keying & Eyedropper */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Warna Background Target</span>
              <span className="font-mono text-rose-600 text-xs">{targetColorHex}</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                className={`flex-1 py-2 px-3 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isEyedropperActive ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-rose-400'
                }`}
              >
                <Pipette className="w-4 h-4" />
                <span>{isEyedropperActive ? 'Klik Gambar!' : 'Pilih Warna (Eyedropper)'}</span>
              </button>

              <button
                onClick={handleAutoDetectLightBg}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                title="Detect White Background"
              >
                Auto White
              </button>
            </div>
          </div>

          {/* Sensitivity Tolerance Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Toleransi Sensitivitas ({tolerance}%)</label>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              value={tolerance}
              onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          {/* Feathering Soft Edges Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Kehalusan Pinggir / Feather ({feather}px)</label>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          {/* Background Replacement Mode */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              <span>Ganti Latar Belakang Baru</span>
            </label>

            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setBgMode('transparent')}
                className={`py-1.5 rounded-lg transition-all ${bgMode === 'transparent' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600'}`}
              >
                Transparan
              </button>
              <button
                onClick={() => setBgMode('color')}
                className={`py-1.5 rounded-lg transition-all ${bgMode === 'color' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600'}`}
              >
                Warna Polos
              </button>
              <button
                onClick={() => setBgMode('gradient')}
                className={`py-1.5 rounded-lg transition-all ${bgMode === 'gradient' ? 'bg-white text-rose-600 shadow-xs font-bold' : 'text-slate-600'}`}
              >
                Gradien
              </button>
            </div>

            {bgMode === 'color' && (
              <div className="flex gap-2 pt-2">
                {['#FFFFFF', '#2563EB', '#10B981', '#EF4444', '#8B5CF6', '#0F172A'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setReplaceColor(c)}
                    className="w-7 h-7 rounded-full border border-slate-300 shadow-xs hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={handleDownloadPng}
              disabled={!processedDataUrl}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG Transparan</span>
            </button>
          </div>
        </div>

        {/* Right Live Canvas Preview Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Image Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Asli (Original)</span>
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative flex items-center justify-center">
                {originalImage ? (
                  <img
                    ref={imageRef}
                    src={originalImage}
                    alt="Original"
                    crossOrigin="anonymous"
                    onClick={handleCanvasClickToPickColor}
                    className={`max-h-full max-w-full object-contain ${isEyedropperActive ? 'cursor-crosshair ring-4 ring-rose-500' : ''}`}
                  />
                ) : (
                  <span className="text-xs text-slate-500">Belum ada foto</span>
                )}

                {isEyedropperActive && (
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-md">
                    Klik titik background yang ingin dihapus!
                  </div>
                )}
              </div>
            </div>

            {/* Processed Background Removed Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hasil Remove Background (PNG)</span>
              </span>

              <div
                className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative flex items-center justify-center transition-all"
                style={{
                  background:
                    bgMode === 'transparent'
                      ? 'repeating-conic-gradient(#cbd5e1 0% 25%, #ffffff 0% 50%) 50% / 16px 16px'
                      : bgMode === 'color'
                      ? replaceColor
                      : replaceGradient,
                }}
              >
                {processedDataUrl ? (
                  <img src={processedDataUrl} alt="Background Removed" className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-slate-400">Memproses...</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
