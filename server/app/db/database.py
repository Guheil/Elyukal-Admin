# app/db/database.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

logger.debug(f"Supabase URL: {SUPABASE_URL}")
logger.debug(f"Supabase Key: {SUPABASE_ANON_KEY[:10]}...")

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    logger.error("Missing Supabase configuration.")
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
logger.info("Supabase client initialized.")