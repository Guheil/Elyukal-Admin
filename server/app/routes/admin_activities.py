from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
import logging
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID

logger = logging.getLogger(__name__)

# Define a schema for activity response
class Activity(BaseModel):
    id: str
    admin_id: str
    admin_name: str
    activity: str
    object: str
    created_at: str

router = APIRouter(tags=["Admin Activities"])

@router.get("/fetch_activities")
async def fetch_activities():
    """
    Fetch all admin activities from the database.
    This endpoint returns all admin activities for the admin dashboard.
    """
    try:
        # Fetch all activities from the admin_activities table
        response = supabase_client.table("admin_activities").select(
            "*"
        ).order(
            "created_at", desc=True
        ).execute()
        
        if hasattr(response, 'data') and response.data:
            activities = response.data
            logger.info(f"Successfully fetched {len(activities)} admin activities")
            return {"activities": activities}
        else:
            logger.warning("No admin activities found or empty response")
            return {"activities": []}
            
    except Exception as e:
        logger.error(f"Error fetching admin activities: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch admin activities: {str(e)}")