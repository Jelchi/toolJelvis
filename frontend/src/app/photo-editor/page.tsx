'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Sliders, Sun, Palette, Sparkles, Download, RotateCw, FlipHorizontal,
  FlipVertical, Eye, RefreshCw, Image as ImageIcon, Check, Crop, Layers
} from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  icon: string;
  settings: Partial<AdjustmentState>;
}

interface AdjustmentState {
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  temperature: number; // -100 to 100 (blue to yellow)
  tint: number; // -100 to 100 (green to magenta)
  vibrance: number; // -100 to 100
  saturation: number; // -100 to 100
  sharpening: number; // 0 to 100
  blur: number; // 0 to 20
  vignette: number; // 0 to 100
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

const DEFAULT_ADJUSTMENTS: AdjustmentState = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  saturation: 0,
  sharpening: 0,
  blur: 0,
  vignette: 0,
  rotation: 0,
  flipH: false,
  flipV: false,
};

const SAMPLE_IMAGES = [
  { id: 'img-1', name: 'Cyberpunk City', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img-2', name: 'Golden Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img-3', name: 'Mountain Sunset', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80' },
  { id: 'img-4', name: 'Modern Architecture', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
];

const PRESETS: Preset[] = [
  {
    id: 'teal-orange',
    name: 'Teal & Orange',
    icon: '🎬',
    settings: { exposure: 10, contrast: 25, temperature: 20, tint: -10, vibrance: 30, saturation: 15, vignette: 25 }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    icon: '🌆',
    settings: { exposure: 15, contrast: 40, temperature: -30, tint: 40, vibrance: 50, saturation: 35, vignette: 40 }
  },
  {
    id: 'vintage',
    name: 'Moody Film',
    icon: '🎞️',
    settings: { exposure: -5, contrast: -15, temperature: 15, tint: 10, vibrance: -10, saturation: -20, vignette: 30 }
  },
  {
    id: 'bw-high',
    name: 'B&W Contrast',
    icon: '🔳',
    settings: { exposure: 5, contrast: 50, saturation: -100, vibrance: -100, highlights: 20, shadows: -30, vignette: 20 }
  },
  {
    id: 'hdr-pop',
    name: 'HDR Clarity',
    icon: '✨',
    settings: { exposure: 5, contrast: 30, highlights: -40, shadows: 40, vibrance: 40, sharpening: 30 }
  },
  {
    id: 'warm-sunset',
    name: 'Golden Sunset',
    icon: '🌅',
    settings: { exposure: 15, contrast: 15, temperature: 45, tint: 5, vibrance: 25, saturation: 20 }
  },
];

export default function PhotoEditorPage() {
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_IMAGES[0].url);
  const [adjustments, setAdjustments] = useState<AdjustmentState>(DEFAULT_ADJUSTMENTS);
  const [activeTab, setActiveTab] = useState<'light' | 'color' | 'presets' | 'effects'>('light');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setActivePreset(null);
    }
  };

  const updateAdj = (key: keyof AdjustmentState, val: number | boolean) => {
    setAdjustments((prev) => ({ ...prev, [key]: val }));
    setActivePreset(null);
  };

  const applyPreset = (preset: Preset) => {
    setAdjustments({
      ...DEFAULT_ADJUSTMENTS,
      ...preset.settings
    });
    setActivePreset(preset.id);
  };

  const resetAdjustments = () => {
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setActivePreset(null);
  };

  // Render Image onto Canvas with CSS filter string simulation for maximum fidelity
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedImage;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Handle Rotation & Flips
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((adjustments.rotation * Math.PI) / 180);
      ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);

      if (showOriginal) {
        ctx.filter = 'none';
      } else {
        // Build CSS filter string
        const exp = 1 + adjustments.exposure / 100;
        const cnt = 100 + adjustments.contrast;
        const sat = 100 + adjustments.saturation + adjustments.vibrance * 0.5;
        const blurPx = adjustments.blur;
        
        // Temperature & Tint via Hue-Rotate / Sepia approximation
        const tempHue = adjustments.temperature * 0.2;
        const sepiaVal = adjustments.temperature > 0 ? adjustments.temperature * 0.15 : 0;

        ctx.filter = `brightness(${exp}) contrast(${cnt}%) saturate(${sat}%) hue-rotate(${tempHue}deg) sepia(${sepiaVal}%) blur(${blurPx}px)`;
      }

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Vignette effect overlay
      if (!showOriginal && adjustments.vignette > 0) {
        const radius = Math.max(canvas.width, canvas.height) / 1.5;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          radius * (1 - adjustments.vignette / 120),
          canvas.width / 2,
          canvas.height / 2,
          radius
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, `rgba(0,0,0,${adjustments.vignette / 110})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [selectedImage, adjustments, showOriginal]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `nexus-edited-photo-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 border border-purple-800/40 rounded-3xl p-6 text-white shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs uppercase font-bold tracking-widest text-purple-300">NEXUS Lightroom Studio</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Professional Photo Editor</h1>
          <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
            Sistem penyuntingan foto kelas profesional dengan penyesuaian Exposure, Tone, White Balance, Preset Filter, dan Ekspor HD.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Upload Foto Baru</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Foto HD</span>
          </button>
        </div>
      </div>

      {/* Main Studio Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas & Workspace Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden shadow-2xl">
            {/* Top Canvas Bar Controls */}
            <div className="w-full flex items-center justify-between mb-3 px-2 text-xs text-slate-400 z-10">
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    showOriginal ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title="Tekan dan tahan untuk melihat foto asli sebelum di-edit"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showOriginal ? 'Melihat Asli' : 'Tahan: Lihat Asli'}</span>
                </button>

                <button
                  onClick={resetAdjustments}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Transformation Quick Controls */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => updateAdj('rotation', (adjustments.rotation + 90) % 360)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateAdj('flipH', !adjustments.flipH)}
                  className={`p-1.5 rounded-lg transition-colors ${adjustments.flipH ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateAdj('flipV', !adjustments.flipV)}
                  className={`p-1.5 rounded-lg transition-colors ${adjustments.flipV ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas View */}
            <div className="relative flex-1 flex items-center justify-center max-w-full max-h-[600px] overflow-hidden rounded-2xl">
              <canvas ref={canvasRef} className="max-w-full max-h-[550px] object-contain shadow-2xl rounded-xl" />
            </div>
          </div>

          {/* Sample Stock Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atau Pilih Sampel Foto HD:</p>
            <div className="grid grid-cols-4 gap-3">
              {SAMPLE_IMAGES.map((img) => (
                <div
                  key={img.id}
                  onClick={() => {
                    setSelectedImage(img.url);
                    resetAdjustments();
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                    selectedImage === img.url ? 'border-purple-600 ring-2 ring-purple-500/20' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded truncate">
                    {img.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Controls & Sliders (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-6 shadow-sm">
          {/* Studio Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('light')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'light' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setActiveTab('color')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'color' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'presets' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button
              onClick={() => setActiveTab('effects')}
              className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                activeTab === 'effects' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Effects</span>
            </button>
          </div>

          {/* TAB 1: LIGHT & TONE ADJUSTMENTS */}
          {activeTab === 'light' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Pengaturan Pencahayaan & Tone</span>
                <button onClick={resetAdjustments} className="text-[10px] text-purple-600 hover:underline">Reset</button>
              </h3>

              {/* Exposure Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Exposure (Pencahayaan)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.exposure}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.exposure}
                  onChange={(e) => updateAdj('exposure', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Contrast (Kontras)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.contrast}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.contrast}
                  onChange={(e) => updateAdj('contrast', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Highlights Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Highlights</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.highlights}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.highlights}
                  onChange={(e) => updateAdj('highlights', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Shadows Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Shadows (Bayangan)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.shadows}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.shadows}
                  onChange={(e) => updateAdj('shadows', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COLOR & WHITE BALANCE */}
          {activeTab === 'color' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Keseimbangan Warna (White Balance)</h3>

              {/* Temperature Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Temperature (Blue ↔ Warm)</span>
                  <span className="font-mono font-bold text-amber-600">{adjustments.temperature}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.temperature}
                  onChange={(e) => updateAdj('temperature', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-slate-200 to-amber-500 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Saturation Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Saturation (Kejenuhan Warna)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.saturation}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.saturation}
                  onChange={(e) => updateAdj('saturation', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Vibrance Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Vibrance</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.vibrance}</span>
                </div>
                <input
                  type="range"
                  min={-100}
                  max={100}
                  value={adjustments.vibrance}
                  onChange={(e) => updateAdj('vibrance', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRO COLOR GRADING PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preset Color Grading Lightroom</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {PRESETS.map((p) => {
                  const isActive = activePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                        isActive
                          ? 'bg-purple-50 border-purple-600 text-purple-700 font-bold shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-lg">{p.icon}</span>
                        {isActive && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <span className="text-xs font-bold truncate">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: EFFECTS & VIGNETTE */}
          {activeTab === 'effects' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efek & Optik</h3>

              {/* Vignette Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Vignette (Efek Gelap Tepi)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.vignette}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={adjustments.vignette}
                  onChange={(e) => updateAdj('vignette', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Blur Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">Blur (Bokeh Kelembutan)</span>
                  <span className="font-mono font-bold text-purple-600">{adjustments.blur}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={adjustments.blur}
                  onChange={(e) => updateAdj('blur', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
