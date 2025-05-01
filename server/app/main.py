# app/main.py
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, dashboard, reviews, fetch_products, fetch_stores, dashboard_stats, fetch_users, product_operations, store_operations, fetch_municipalities, admin_activities, fetch_most_viewed_products, store_users, store_user_auth, store_user_store
from app.auth.auth_handler import get_current_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Elyukal Admin API")

# Import environment variables and config
import os
from app.config import SERVER_IP, CLIENT_URL

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", CLIENT_URL],
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
app.include_router(fetch_users.router)
app.include_router(product_operations.router)
app.include_router(fetch_municipalities.router)
app.include_router(admin_activities.router)
app.include_router(store_operations.router)
app.include_router(fetch_most_viewed_products.router)
app.include_router(store_users.router)
app.include_router(store_user_auth.router)
app.include_router(store_user_store.router)
