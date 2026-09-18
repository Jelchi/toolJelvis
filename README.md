<<<<<<< HEAD
# NEXUS WORKSPACE

> **Tagline:** One Workspace. Infinite Possibilities.  
> All-in-One Digital Productivity, Documentation, Visual Diagramming, Creative, and IT Workspace Platform.

---

## 🚀 Features Implemented

1. **Phase 1 Foundation & Auth Core:**
   - Full Monorepo setup (`frontend/` Next.js 14 App Router + `backend/` Python FastAPI).
   - JWT Authentication with Argon2id password hashing and multi-tenant workspace isolation.
   - Clean Layered Architecture (`API` -> `Services` -> `Repositories` -> `SQLAlchemy 2.0 Async ORM`).
   - Dark & Light mode theme design system (`#F8FAFC`, `#1E293B`, `#64748B`, `#E2E8F0`).

2. **Notes Module:**
   - Tiptap Rich Text Editor with headers, lists, code blocks, and markdown support.
   - Autosave with debounce indicator ("Autosaved" / "Saving...").
   - Tags management, keyword search, favorites filtering, and soft delete/restore.

3. **Task Management Module:**
   - Kanban Board & List view.
   - Status workflow (`To Do`, `In Progress`, `Done`) and priority indicators (`Urgent`, `High`, `Medium`, `Low`).

4. **Visual Studio — Flowchart & Diagram Editor:**
   - React Flow node-based diagramming canvas.
   - Add/delete nodes, connect edges, edit labels, mini-map, zoom, and export JSON.

5. **Music Studio:**
   - Persistent global audio player fixed at bottom (`🎵 Track Name - Artist ◀ ▶ ⏸ ━━━━━━━ 🔊 ☰`).
   - Audio store in Zustand keeping music playing across page navigations.
   - Music library grid with albums, playlists, and track queue.

6. **IT Workspace & Developer Utilities:**
   - **JSON Formatter & Validator:** Format (Prettify), minify, and safe client-side validation (`JSON.parse`).
   - **UUID Generator:** Cryptographically secure UUID v1, v4, v5 generation with quantity, uppercase, hyphenation options, and TXT/CSV export.
   - **JPG to PDF Converter:** Upload images, reorder, paper size customization (A4, Letter, Legal), orientation, and PDF export.

---

## ⚡ Quick Launch (Windows 1-Click)
Cukup jalankan script batch berikut di root folder:
```cmd
run.bat
```
Script ini akan secara otomatis membuka jendela terminal untuk **FastAPI Backend (Port 8000)** dan **Next.js Frontend (Port 3000)**.

---

## 🛠 Setup & Running Instructions

### 1. Backend Setup (FastAPI & Python 3.11+)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python -m pytest       # Run automated unit test suite
python -m uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/api/v1/docs`

### 2. Frontend Setup (Next.js 14 & Node.js 18+)
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### 3. Full Stack Docker Compose Setup
```bash
docker-compose up --build
```
"# toolJelvis" 
=======
# toolJelvis
>>>>>>> 39ade27a832e760ba1aaa28ad0cc964f71a20a3e
