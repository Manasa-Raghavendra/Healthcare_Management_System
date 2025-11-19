# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import init_db

# Routers
from app.routes import patients, files, audit
from app import auth


app = FastAPI(
    title=getattr(settings, "PROJECT_NAME", "SecureCare API")
)

# -------------------------
# 🔥 CORS CONFIGURATION
# -------------------------
# Your device IP is 10.125.55.38 → frontend runs on port 8080
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://10.125.55.38:8080", 
        # your LAN IP  # ⭐ your correct frontend origin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# 🔥 STARTUP
# -------------------------
@app.on_event("startup")
def on_startup():
    init_db()

# -------------------------
# 🔥 ROUTES
# -------------------------
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(files.router)
app.include_router(audit.router)

# -------------------------
# 🔥 ROOT ENDPOINT
# -------------------------
@app.get("/")
def index():
    return {
        "ok": True,
        "project": getattr(settings, "PROJECT_NAME", "SecureCare API")
    }
