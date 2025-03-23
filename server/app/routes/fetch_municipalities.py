# app/routes/fetch_municipalities.py
from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from typing import List
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class Municipality(BaseModel):
    id: int
    name: str

@router.get("/fetch_municipalities", response_model=List[Municipality])
async def fetch_municipalities():
    try:
        # Fetch all municipalities from the database
        response = supabase_client.table("municipalities").select("id, name").execute()
        
        if not response.data:
            return []
        
        return response.data
    except Exception as e:
        logger.error(f"Error in fetch_municipalities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")