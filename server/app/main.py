# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, dashboard, reviews, fetch_products, fetch_stores, dashboard_stats
from app.auth.auth_handler import get_current_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elyukal Admin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.100.5:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Elyukal Admin API running!"}

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(reviews.router)
app.include_router(fetch_products.router)
app.include_router(fetch_stores.router)
app.include_router(dashboard_stats.router)