from app.db.database import supabase_client
import logging
from typing import Optional
from uuid import UUID

logger = logging.getLogger(__name__)

async def log_admin_activity(
    admin_user: dict,
    activity_type: str,
    object_name: str,
    object_type: str = "Product"
):
    """
    Logs admin activities to the admin_activities table.

    Args:
        admin_user: The admin user performing the action (from get_current_user)
        activity_type: The type of activity ('added', 'edited', 'deleted', 'archived', 'restored', 'permanently deleted')
        object_name: The name of the object being acted upon
        object_type: The type of object ('Product' or 'Store', defaults to 'Product')
    """
    try:
        # Map extended activity types to database-compatible activity types
        # The database enum only supports 'added', 'edited', 'deleted'
        activity_type_mapping = {
            'archived': 'edited',
            'restored': 'edited',
            'permanently deleted': 'deleted'
        }

        # If the activity type is one of our extended types, map it to a compatible type
        db_activity_type = activity_type
        if activity_type in activity_type_mapping:
            db_activity_type = activity_type_mapping[activity_type]
            # Modify the object name to include the original action for clarity
            object_name = f"{object_name} ({activity_type})"

        # Validate activity_type against enum
        valid_activities = ['added', 'edited', 'deleted', 'archived', 'restored', 'permanently deleted']
        if activity_type not in valid_activities:
            raise ValueError(f"Invalid activity_type. Must be one of {valid_activities}")

        # Validate object_type
        valid_object_types = ['Product', 'Store']
        if object_type not in valid_object_types:
            raise ValueError(f"Invalid object_type. Must be one of {valid_object_types}")

        # Extract admin information
        admin_id = admin_user.get("id")
        first_name = admin_user.get("first_name", "")
        last_name = admin_user.get("last_name", "")
        admin_name = f"{first_name} {last_name}".strip()

        # If name is empty, use email as fallback
        if not admin_name and "email" in admin_user:
            admin_name = admin_user["email"]

        # Format the object field
        object_field = f"{object_type}: {object_name}"

        # Log to admin_activities table
        activity_data = {
            "admin_id": str(admin_id),  # Convert UUID to string for Supabase
            "admin_name": admin_name,
            "activity": db_activity_type,  # Use the mapped activity type that's compatible with the database
            "object": object_field
        }

        response = supabase_client.table("admin_activities").insert(activity_data).execute()

        if not response.data:
            logger.error(f"Failed to log admin activity: {activity_type} (mapped to {db_activity_type}) {object_field}")
        else:
            logger.info(f"Admin activity logged: {admin_name} {activity_type} (mapped to {db_activity_type}) {object_field}")

    except Exception as e:
        logger.error(f"Error logging admin activity: {str(e)}")
        raise  # Re-raise the exception to be handled by the caller if needed