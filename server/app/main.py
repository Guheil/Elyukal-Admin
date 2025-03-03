import os
from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabaseUrl = os.getenv("SUPABASE_URL")
supabaseKey = os.getenv("SUPABASE_KEY")

if not supabaseUrl or not supabaseKey:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY is missing in .env")

supabase:Client = create_client(
    supabaseUrl,
    supabaseKey,
)

@app.get("/api/data")
async def get_data():
    response = supabase.table("products").select("*").execute()
    return response