# app/db/database.py
from supabase import create_client, Client
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

logger.debug(f"Supabase URL: {SUPABASE_URL}")
logger.debug(f"Supabase Service Role Key: {SUPABASE_SERVICE_ROLE_KEY[:10]}...")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    logger.error("Missing Supabase configuration.")
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
logger.info("Supabase client initialized.")

# Test bucket listing
try:
    buckets = supabase_client.storage.list_buckets()
    logger.info(f"Available buckets during initialization: {[b.name for b in buckets]}")
except Exception as e:
    logger.error(f"Failed to list buckets during initialization: {str(e)}", exc_info=True)