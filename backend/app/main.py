from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deviation import router as deviation_router


# =========================================================
# APPLICATION
# =========================================================

app = FastAPI(
    title="AIVOA Quality Management System API",
    description=(
        "AI-powered Quality Management System "
        "for deviation management."
    ),
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "success": True,
        "application": "AIVOA",
        "message": "AIVOA Backend API is running",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health():

    return {
        "success": True,
        "status": "healthy",
        "service": "AIVOA Backend"
    }


# =========================================================
# ROUTES
# =========================================================

app.include_router(
    deviation_router
)