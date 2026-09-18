from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

# Import all models to ensure metadata registration
from app.models import user, workspace, note, task, diagram, music, problem, presentation, processed_image, daily_log, finance  # noqa: F401


from app.core.database import engine, Base, AsyncSessionLocal
from app.core.seed import seed_initial_data


from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they do not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        # Auto-migrate existing SQLite table columns if missing
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(100)"))
        except Exception:
            pass
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN password_changed_at DATETIME"))
        except Exception:
            pass

    # Seed initial user 'jelvis' and popular Mandarin songs into DB
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)

    yield
    # Shutdown: Close database engine connections
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION
    }
