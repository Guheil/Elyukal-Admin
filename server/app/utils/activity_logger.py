from app.db.database import supabase_client
import logging
from typing import Optional
from uuid import UUID

logger = logging.getLogger(__name__)

async def log_admin_activity(admin_user: dict, activity_type: str, object_name: str, object_type: str = "Product"):
    """
    Logs admin activities to the admin_activities table.
    
    Args:
        admin_user: The admin user performing the action (from get_current_user)
        activity_type: The type of activity ('added', 'edited', 'deleted')
        object_name: The name of the object being acted upon
        object_type: The type of object (default is "Product")
    """
    try:
        # Extract admin information
        admin_id = admin_user.get("id")
        first_name = admin_user.get("first_name", "")
        last_name = admin_user.get("last_name", "")
        admin_name = f"{first_name} {last_name}".strip()
        
        # If name is empty, use email as fallback
        if not admin_name and "email" in admin_user:
            admin_name = admin_user["email"]
        
        # Format the object field
        object_field = f"{object_type} - {object_name}"
        
        # Log to admin_activities table
        activity_data = {
            "admin_id": admin_id,
            "admin_name": admin_name,
            "activity": activity_type,
            "object": object_field
        }
        
        response = supabase_client.table("admin_activities").insert(activity_data).execute()
        
        if not response.data:
            logger.error(f"Failed to log admin activity: {activity_type} {object_field}")
        else:
            logger.info(f"Admin activity logged: {admin_name} {activity_type} {object_field}")
            
    except Exception as e:
        logger.error(f"Error logging admin activity: {str(e)}")