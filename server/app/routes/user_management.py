from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel
from app.db.database import supabase_client
from app.auth.auth_handler import get_current_user
from app.utils.activity_logger import log_admin_activity
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(tags=["User Management"])

class BanUserRequest(BaseModel):
    reason: Optional[str] = None

@router.post("/ban_user/{email}")
async def ban_user(email: str = Path(...), ban_data: BanUserRequest = None, current_user: dict = Depends(get_current_user)):
    """
    Ban a user by email.
    This endpoint marks a user as banned in the database and logs the action.
    """
    try:
        logger.info(f"Starting user ban process for email: {email}")

        if ban_data is None:
            ban_data = BanUserRequest()

        # First, check if the user exists
        user_response = supabase_client.table("users").select("*").eq("email", email).execute()

        if not user_response.data or len(user_response.data) == 0:
            logger.error(f"User with email {email} not found")
            raise HTTPException(status_code=404, detail=f"User with email {email} not found")

        user = user_response.data[0]

        # Check if the user is already banned
        if user.get("is_banned", False):
            logger.info(f"User {email} is already banned")
            return {"success": True, "message": "User is already banned"}

        # Update the user to mark them as banned
        update_data = {
            "is_banned": True,
            "banned_at": "now()",
            "banned_by": current_user.get("email"),
            "ban_reason": ban_data.reason
        }

        ban_response = supabase_client.table("users").update(update_data).eq("email", email).execute()

        if not ban_response.data:
            logger.error(f"Failed to ban user with email {email}")
            raise HTTPException(status_code=500, detail="Failed to ban user")

        # Log admin activity
        user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}"
        await log_admin_activity(current_user, "edited", f"{user_name} (banned)")

        logger.info(f"Successfully banned user with email: {email}")
        return {"success": True, "message": f"User {user_name} has been banned successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.exception(f"Error banning user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error banning user: {str(e)}")

@router.post("/unban_user/{email}")
async def unban_user(email: str = Path(...), current_user: dict = Depends(get_current_user)):
    """
    Unban a user by email.
    This endpoint removes the ban status from a user in the database and logs the action.
    """
    try:
        logger.info(f"Starting user unban process for email: {email}")

        # First, check if the user exists
        user_response = supabase_client.table("users").select("*").eq("email", email).execute()

        if not user_response.data or len(user_response.data) == 0:
            logger.error(f"User with email {email} not found")
            raise HTTPException(status_code=404, detail=f"User with email {email} not found")

        user = user_response.data[0]

        # Check if the user is not banned
        if not user.get("is_banned", False):
            logger.info(f"User {email} is not banned")
            return {"success": True, "message": "User is not banned"}

        # Update the user to remove ban
        update_data = {
            "is_banned": False,
            "banned_at": None,
            "banned_by": None,
            "ban_reason": None
        }

        unban_response = supabase_client.table("users").update(update_data).eq("email", email).execute()

        if not unban_response.data:
            logger.error(f"Failed to unban user with email {email}")
            raise HTTPException(status_code=500, detail="Failed to unban user")

        # Log admin activity
        user_name = f"{user.get('first_name', '')} {user.get('last_name', '')}"
        await log_admin_activity(current_user, "edited", f"{user_name} (unbanned)")

        logger.info(f"Successfully unbanned user with email: {email}")
        return {"success": True, "message": f"User {user_name} has been unbanned successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.exception(f"Error unbanning user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error unbanning user: {str(e)}")
