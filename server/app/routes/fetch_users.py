from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
import logging
from typing import List
from pydantic import BaseModel, EmailStr

logger = logging.getLogger(__name__)

# Define a schema for user response
class UserResponse(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    # Additional fields that might be in the users table
    created_at: str = None
    updated_at: str = None

router = APIRouter(tags=["Users"])

@router.get("/fetch_users")
async def fetch_users():
    """
    Fetch all users from the database.
    This endpoint returns all users for admin dashboard without requiring authentication.
    """
    try:
        # Fetch all users from the users table, excluding password-related fields
        response = supabase_client.table("users").select(
            "*"
        ).execute()

        if not response.data:
            return {"users": []}

        users = response.data
        logger.info(f"Retrieved {len(users)} users")
        
        return {"users": users}
    except Exception as e:
        logger.exception(f"Error fetching users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_user/{email}")
async def fetch_user_by_email(email: str):
    """
    Fetch a specific user by email.
    This endpoint does not require authentication as it only returns public information.
    """
    try:
        response = supabase_client.table("users").select(
            "*"
        ).eq("email", email).execute()

        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        user = response.data[0]
        logger.info(f"Retrieved user: {email}")
        
        return {"user": user}
    except HTTPException as he:
        # Re-raise HTTP exceptions without modification
        raise he
    except Exception as e:
        logger.exception(f"Error fetching user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/get_total_number_of_users")
async def get_total_number_of_users():
    """
    Get the total number of users in the system.
    This endpoint does not require authentication as it only returns a count.
    """
    try:
        # Query the total count of users
        response = supabase_client.table("users").select("email", count="exact").execute()
        
        # The count is returned in the response count property
        total_users = response.count
        
        if total_users is None:
            # Fallback if count property is not available
            total_users = len(response.data)
        
        logger.info(f"Total users count: {total_users}")
        return {"total_users": total_users}
    
    except Exception as e:
        logger.exception(f"Error getting total user count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")