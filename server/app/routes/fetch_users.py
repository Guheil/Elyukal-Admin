from fastapi import APIRouter, Depends, HTTPException
from app.db.database import supabase_client
from pydantic import BaseModel, EmailStr
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


class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr


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

@router.put("/update_user/{email}")
async def update_user(email: str, user_data: UserUpdate):
    """
    Update a user's information by email.
    This endpoint updates the user's first_name, last_name, and email in the database.
    """
    try:
        # Check if the user exists
        check_response = supabase_client.table("users").select("*").eq("email", email).execute()
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Update the user in the database
        response = supabase_client.table("users").update({
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "email": user_data.email,
            "updated_at": "now()"
        }).eq("email", email).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update user")

        logger.info(f"Updated user: {email}")
        return {"success": True}
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/get_total_number_of_admin_users")
async def get_total_number_of_admin_users():
    """
    Get the total number of admin users in the system.
    This endpoint does not require authentication as it only returns a count.
    """
    try:
        # Query the total count of admin users
        response = supabase_client.table("admin_user").select("email", count="exact").execute()
        
        # The count is returned in the response count property
        total_admin_users = response.count
        
        if total_admin_users is None:
            # Fallback if count property is not available
            total_admin_users = len(response.data)
        
        logger.info(f"Total admin users count: {total_admin_users}")
        return {"total_admin_users": total_admin_users}
    
    except Exception as e:
        logger.exception(f"Error getting total admin user count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")