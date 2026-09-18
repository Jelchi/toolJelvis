from fastapi import APIRouter
from app.api.v1 import auth, workspaces, notes, tasks, diagrams, it_tools, music, problems, presentations, finance

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(diagrams.router, prefix="/diagrams", tags=["diagrams"])
api_router.include_router(it_tools.router, prefix="/it-tools", tags=["it-tools"])
api_router.include_router(music.router, prefix="/music", tags=["music"])
api_router.include_router(problems.router, prefix="/problems", tags=["problems"])
api_router.include_router(presentations.router, prefix="/presentations", tags=["presentations"])
api_router.include_router(finance.router, prefix="/finance", tags=["finance"])


