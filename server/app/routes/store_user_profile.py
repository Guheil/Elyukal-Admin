from fastapi import APIRouter, HTTPException, Request
from app.db.database import supabase_client
from app.routes.store_user_auth import verify_store_user_session
from typing import Optional
from pydantic import BaseModel
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='store_user_profile_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Profile Operations"])

# Pydantic model for profile update
class ProfileUpdate(BaseModel):
    first_name: str
    last_name: str
    phone_number: Optional[str] = None

@router.put("/store-user/update-profile")
async def update_store_user_profile(
    request: Request,
    profile_data: ProfileUpdate
):
    """
    Update the profile of the currently logged in store user.
    This endpoint updates the user's first_name, last_name, and phone_number in the database.
    """
    try:
        # Verify the store user session
        session = await verify_store_user_session(request)
        user_email = session.get("email")

        if not user_email:
            raise HTTPException(status_code=401, detail="Authentication required")

        # Check if the store user exists
        check_response = supabase_client.table("store_user").select("*").eq("email", user_email).execute()
        if not check_response.data or len(check_response.data) == 0:
            raise HTTPException(status_code=404, detail="Store user not found")

        # Update the store user in the database
        response = supabase_client.table("store_user").update({
            "first_name": profile_data.first_name,
            "last_name": profile_data.last_name,
            "phone_number": profile_data.phone_number,
        }).eq("email", user_email).execute()

        if not response.data:
            logger.error(f"Failed to update profile for user {user_email}")
            raise HTTPException(status_code=500, detail="Failed to update profile")

        logger.info(f"Successfully updated profile for user {user_email}")
        return {"message": "Profile updated successfully", "profile": response.data[0]}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")
