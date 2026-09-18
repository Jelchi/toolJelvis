'use client';

import React, { useState, useRef } from 'react';
import {
  Presentation, Plus, Trash2, Copy, Play, Type, Square, Image as ImageIcon,
  Sparkles, Palette, Upload, Move, ChevronLeft, ChevronRight, Maximize2,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Layers, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react';

interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  content: string; // Text string or Image DataURL/src
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  bgColor?: string;
  borderRadius?: number;
  zIndex?: number;
}

interface Slide {
  id: string;
  backgroundColor: string;
  elements: SlideElement[];
}

export default function PresentationPage() {
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: 'slide-1',
      backgroundColor: '#FFFFFF',
      elements: [
        { id: 'el-1', type: 'text', content: 'NEXUS Presentation Studio', x: 80, y: 60, fontSize: 32, fontWeight: 'bold', color: '#0F172A', zIndex: 1 },
        { id: 'el-2', type: 'text', content: 'Geser posisi teks & foto secara bebas dengan drag & drop', x: 80, y: 120, fontSize: 16, color: '#64748B', zIndex: 2 },
        {
          id: 'el-3',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
          x: 400,
          y: 80,
          width: 260,
          height: 160,
          borderRadius: 12,
          zIndex: 3
        },
      ],
    },
    {
      id: 'slide-2',
      backgroundColor: '#F0F9FF',
      elements: [
        { id: 'el-4', type: 'text', content: 'Key Features Overview', x: 60, y: 50, fontSize: 26, fontWeight: 'bold', color: '#1E40AF', zIndex: 1 },
        { id: 'el-5', type: 'text', content: '• Insert High-Res Photos & Local Uploads\n• Live Mouse Drag & Drop Element Positioning\n• Customizable Colors, Sizes, & Layer Ordering', x: 60, y: 120, fontSize: 15, color: '#334155', zIndex: 2 },
        {
          id: 'el-6',
          type: 'image',
          content: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80',
          x: 420,
          y: 110,
          width: 240,
          height: 150,
          borderRadius: 12,
          zIndex: 3
        },
      ],
    },
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPresentMode, setIsPresentMode] = useState<boolean>(false);
  const [presentSlideIndex, setPresentSlideIndex] = useState<number>(0);

  // Dragging state
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement>(null);
  const activeSlide = slides[activeSlideIndex] || slides[0];
  const selectedElement = activeSlide.elements.find((e) => e.id === selectedElementId);

  // Slide Operations
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      backgroundColor: '#FFFFFF',
      elements: [
        { id: `el-${Date.now()}`, type: 'text', content: 'Judul Slide Baru', x: 100, y: 100, fontSize: 28, fontWeight: 'bold', color: '#0F172A', zIndex: 1 }
      ],
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const handleDuplicateSlide = (idx: number) => {
    const target = slides[idx];
    const duplicated: Slide = {
      ...target,
      id: `slide-${Date.now()}`,
      elements: target.elements.map((e) => ({ ...e, id: `el-${Date.now()}-${Math.random()}` })),
    };
    const updated = [...slides];
    updated.splice(idx + 1, 0, duplicated);
    setSlides(updated);
    setActiveSlideIndex(idx + 1);
  };

  const handleDeleteSlide = (idx: number) => {
    if (slides.length === 1) return;
    const updated = slides.filter((_, i) => i !== idx);
    setSlides(updated);
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  };

  // Add Elements
  const handleAddTextElement = () => {
    const newEl: SlideElement = {
      id: `el-${Date.now()}`,
      type: 'text',
      content: 'Teks Baru (Bisa Digeser)',
      x: 150,
      y: 150,
      fontSize: 20,
      fontWeight: 'bold',
      color: '#0F172A',
      zIndex: activeSlide.elements.length + 1,
    };
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex].elements.push(newEl);
    setSlides(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  const handleInsertImageFromDevice = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newEl: SlideElement = {
            id: `el-${Date.now()}`,
            type: 'image',
            content: event.target.result as string,
            x: 200,
            y: 100,
            width: 240,
            height: 160,
            borderRadius: 12,
            zIndex: activeSlide.elements.length + 1,
          };
          const updatedSlides = [...slides];
          updatedSlides[activeSlideIndex].elements.push(newEl);
          setSlides(updatedSlides);
          setSelectedElementId(newEl.id);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStockImage = (url: string) => {
    const newEl: SlideElement = {
      id: `el-${Date.now()}`,
      type: 'image',
      content: url,
      x: 220,
      y: 120,
      width: 240,
      height: 150,
      borderRadius: 12,
      zIndex: activeSlide.elements.length + 1,
    };
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex].elements.push(newEl);
    setSlides(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  const handleAddShapeElement = () => {
    const newEl: SlideElement = {
      id: `el-${Date.now()}`,
      type: 'shape',
      content: '',
      x: 180,
      y: 180,
      width: 160,
      height: 100,
      bgColor: '#3B82F6',
      borderRadius: 16,
      zIndex: activeSlide.elements.length + 1,
    };
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex].elements.push(newEl);
    setSlides(updatedSlides);
    setSelectedElementId(newEl.id);
  };

  const handleUpdateBgColor = (color: string) => {
    setSlides((prev) => {
      const updated = [...prev];
      updated[activeSlideIndex].backgroundColor = color;
      return updated;
    });
  };

  // Element Property Updaters
  const updateSelectedElement = (updates: Partial<SlideElement>) => {
    if (!selectedElementId) return;
    setSlides((prev) => {
      const updated = [...prev];
      const el = updated[activeSlideIndex].elements.find((e) => e.id === selectedElementId);
      if (el) {
        Object.assign(el, updates);
      }
      return updated;
    });
  };

  const handleDeleteSelectedElement = () => {
    if (!selectedElementId) return;
    setSlides((prev) => {
      const updated = [...prev];
      updated[activeSlideIndex].elements = updated[activeSlideIndex].elements.filter((e) => e.id !== selectedElementId);
      return updated;
    });
    setSelectedElementId(null);
  };

  // Canvas Mouse Dragging Handlers
  const handleMouseDownElement = (e: React.MouseEvent, id: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setDraggingElementId(id);

    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - canvasRect.left - currentX,
        y: e.clientY - canvasRect.top - currentY,
      });
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingElementId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const newX = Math.max(0, Math.min(canvasRect.width - 40, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(canvasRect.height - 30, e.clientY - canvasRect.top - dragOffset.y));

    updateSelectedElement({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleMouseUpCanvas = () => {
    setDraggingElementId(null);
  };

  // Nudge position with arrow controls
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    updateSelectedElement({
      x: Math.max(0, selectedElement.x + dx),
      y: Math.max(0, selectedElement.y + dy),
    });
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
      {/* Top Header Bar */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Presentation className="w-5 h-5 text-blue-600" />
          <div>
            <h1 className="text-sm font-bold text-slate-900">Presentation Studio — Drag & Drop Canva Editor</h1>
            <p className="text-[10px] text-slate-500">Insert foto, geser teks secara bebas, ubah warna, ukuran & posisi elemen.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsPresentMode(true);
              setPresentSlideIndex(activeSlideIndex);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Present Fullscreen</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide Thumbnails */}
        <div className="w-56 border-r border-slate-200 bg-slate-50/50 p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Slides ({slides.length})</span>
            <button
              onClick={handleAddSlide}
              className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Add Slide"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => setActiveSlideIndex(idx)}
                className={`p-2 border rounded-xl cursor-pointer transition-all space-y-1 relative group ${
                  activeSlideIndex === idx ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                  <span>Slide {idx + 1}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleDuplicateSlide(idx); }} className="hover:text-blue-600">
                      <Copy className="w-3 h-3" />
                    </button>
                    {slides.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }} className="hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mini Preview Box */}
                <div
                  className="w-full aspect-video border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center text-[9px] font-semibold text-slate-500 p-1 relative"
                  style={{ backgroundColor: s.backgroundColor }}
                >
                  <span className="truncate">
                    {s.elements.find(e => e.type === 'text')?.content || 'Slide Content'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Interactive Slide Canvas */}
        <div className="flex-1 bg-slate-100 p-6 flex flex-col items-center justify-center overflow-auto select-none">
          <div className="text-[11px] text-slate-400 mb-2 flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-blue-600" />
            <span>Klik & Drag teks/gambar untuk menggeser posisi elemen pada slide canvas</span>
          </div>

          <div
            ref={canvasRef}
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            onMouseLeave={handleMouseUpCanvas}
            onClick={() => setSelectedElementId(null)}
            className="w-[720px] h-[405px] border border-slate-300 rounded-2xl shadow-xl relative overflow-hidden transition-colors bg-white cursor-crosshair"
            style={{ backgroundColor: activeSlide.backgroundColor }}
          >
            {activeSlide.elements.map((el) => {
              const isSelected = selectedElementId === el.id;

              if (el.type === 'image') {
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDownElement(e, el.id, el.x, el.y)}
                    className={`absolute cursor-move transition-shadow rounded-xl overflow-hidden ${
                      isSelected ? 'ring-2 ring-blue-600 border border-blue-400 shadow-lg' : 'hover:outline-dashed hover:outline-2 hover:outline-blue-400'
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width || 200}px`,
                      height: `${el.height || 140}px`,
                      zIndex: el.zIndex || 1,
                    }}
                  >
                    <img
                      src={el.content}
                      alt="Slide element"
                      className="w-full h-full object-cover pointer-events-none"
                      style={{ borderRadius: `${el.borderRadius || 12}px` }}
                    />
                  </div>
                );
              }

              if (el.type === 'shape') {
                return (
                  <div
                    key={el.id}
                    onMouseDown={(e) => handleMouseDownElement(e, el.id, el.x, el.y)}
                    className={`absolute cursor-move transition-all ${
                      isSelected ? 'ring-2 ring-blue-600 border border-blue-400 shadow-md' : 'hover:outline-dashed hover:outline-1 hover:outline-blue-400'
                    }`}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width || 140}px`,
                      height: `${el.height || 90}px`,
                      backgroundColor: el.bgColor || '#3B82F6',
                      borderRadius: `${el.borderRadius || 12}px`,
                      zIndex: el.zIndex || 1,
                    }}
                  />
                );
              }

              // Default: Text element
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDownElement(e, el.id, el.x, el.y)}
                  className={`absolute p-2 cursor-move transition-all rounded ${
                    isSelected ? 'ring-2 ring-blue-600 border border-blue-400 bg-blue-50/30 shadow-md' : 'hover:outline-dashed hover:outline-1 hover:outline-blue-400'
                  }`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    fontSize: `${el.fontSize || 18}px`,
                    fontWeight: el.fontWeight || 'normal',
                    color: el.color || '#0F172A',
                    zIndex: el.zIndex || 1,
                  }}
                >
                  <pre className="font-sans whitespace-pre-wrap leading-tight">{el.content}</pre>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Rich Element Formatting Toolbar */}
        <div className="w-72 border-l border-slate-200 bg-white p-4 space-y-4 overflow-y-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Tambah Elemen Baru</h2>

          {/* Add Elements Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddTextElement}
              className="py-2 px-3 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Type className="w-4 h-4 text-blue-600" />
              <span>Tambah Teks</span>
            </button>

            <button
              onClick={handleAddShapeElement}
              className="py-2 px-3 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Square className="w-4 h-4 text-purple-600" />
              <span>Tambah Shape</span>
            </button>
          </div>

          {/* Upload Image Section */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>Masukan Foto / Gambar</span>
            </label>

            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl p-2.5 text-center bg-slate-50 relative cursor-pointer transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleInsertImageFromDevice}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-800">Upload Foto dari Perangkat</p>
              <p className="text-[10px] text-slate-400">PNG, JPG, WEBP</p>
            </div>

            {/* Quick Preset Images */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Preset Foto Stok:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
                ].map((url, i) => (
                  <div
                    key={i}
                    onClick={() => handleAddStockImage(url)}
                    className="h-12 border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Background Color Picker */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              <span>Warna Background Slide</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {['#FFFFFF', '#F0F9FF', '#F8FAFC', '#FEF3C7', '#FEE2E2', '#0F172A'].map((c) => (
                <button
                  key={c}
                  onClick={() => handleUpdateBgColor(c)}
                  className="w-7 h-7 rounded-full border border-slate-300 shadow-xs hover:scale-110 transition-transform"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Selected Element Formatting Controller */}
          {selectedElement ? (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase">Pengaturan Elemen</span>
                <button
                  onClick={handleDeleteSelectedElement}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus Elemen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Text Edit Content */}
              {selectedElement.type === 'text' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Isi Teks</label>
                  <textarea
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 h-20"
                  />
                </div>
              )}

              {/* Font Size & Weight (For Text) */}
              {selectedElement.type === 'text' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-600">Ukuran Font ({selectedElement.fontSize || 18}px)</label>
                    <button
                      onClick={() => updateSelectedElement({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`px-2 py-0.5 text-xs font-bold rounded border ${
                        selectedElement.fontWeight === 'bold' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      B (Bold)
                    </button>
                  </div>
                  <input
                    type="range"
                    min={12}
                    max={64}
                    value={selectedElement.fontSize || 18}
                    onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {/* Image / Shape Dimension controls */}
              {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Lebar (Width)</label>
                    <input
                      type="number"
                      value={selectedElement.width || 200}
                      onChange={(e) => updateSelectedElement({ width: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">Tinggi (Height)</label>
                    <input
                      type="number"
                      value={selectedElement.height || 140}
                      onChange={(e) => updateSelectedElement({ height: Number(e.target.value) })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Warna Elemen</label>
                <div className="flex gap-1.5 flex-wrap">
                  {['#0F172A', '#1E40AF', '#059669', '#DC2626', '#D97706', '#7C3AED', '#FFFFFF'].map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        if (selectedElement.type === 'text') updateSelectedElement({ color: c });
                        else updateSelectedElement({ bgColor: c });
                      }}
                      className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Precise Position Nudge Controllers */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <Move className="w-3.5 h-3.5 text-blue-600" />
                  <span>Atur Posisi Presisi (X: {selectedElement.x}, Y: {selectedElement.y})</span>
                </label>
                <div className="flex items-center justify-center gap-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => handleNudge(-10, 0)} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleNudge(0, -10)} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleNudge(0, 10)} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleNudge(10, 0)} className="p-1 bg-white border border-slate-200 rounded hover:bg-slate-100">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-400">
              Klik salah satu teks, foto, atau elemen pada slide untuk mengedit properti & posisinya.
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Canva Present Mode Overlay */}
      {isPresentMode && (
        <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 p-6 select-none">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Slide {presentSlideIndex + 1} of {slides.length}
            </span>
            <button
              onClick={() => setIsPresentMode(false)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
            >
              Exit Presentation
            </button>
          </div>

          <div
            className="w-[960px] h-[540px] rounded-2xl shadow-2xl relative overflow-hidden transition-all"
            style={{ backgroundColor: slides[presentSlideIndex].backgroundColor }}
          >
            {slides[presentSlideIndex].elements.map((el) => {
              if (el.type === 'image') {
                return (
                  <img
                    key={el.id}
                    src={el.content}
                    alt="Slide photo"
                    className="absolute object-cover"
                    style={{
                      left: `${el.x * 1.33}px`,
                      top: `${el.y * 1.33}px`,
                      width: `${(el.width || 200) * 1.33}px`,
                      height: `${(el.height || 140) * 1.33}px`,
                      borderRadius: `${(el.borderRadius || 12) * 1.33}px`,
                      zIndex: el.zIndex || 1,
                    }}
                  />
                );
              }

              if (el.type === 'shape') {
                return (
                  <div
                    key={el.id}
                    className="absolute"
                    style={{
                      left: `${el.x * 1.33}px`,
                      top: `${el.y * 1.33}px`,
                      width: `${(el.width || 140) * 1.33}px`,
                      height: `${(el.height || 90) * 1.33}px`,
                      backgroundColor: el.bgColor || '#3B82F6',
                      borderRadius: `${(el.borderRadius || 12) * 1.33}px`,
                      zIndex: el.zIndex || 1,
                    }}
                  />
                );
              }

              return (
                <div
                  key={el.id}
                  className="absolute p-4 font-sans whitespace-pre-wrap leading-tight"
                  style={{
                    left: `${el.x * 1.33}px`,
                    top: `${el.y * 1.33}px`,
                    fontSize: `${(el.fontSize || 18) * 1.33}px`,
                    fontWeight: el.fontWeight || 'normal',
                    color: el.color || '#0F172A',
                    zIndex: el.zIndex || 1,
                  }}
                >
                  {el.content}
                </div>
              );
            })}
          </div>

          {/* Navigation controls */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setPresentSlideIndex(Math.max(0, presentSlideIndex - 1))}
              disabled={presentSlideIndex === 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setPresentSlideIndex(Math.min(slides.length - 1, presentSlideIndex + 1))}
              disabled={presentSlideIndex === slides.length - 1}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-full"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
