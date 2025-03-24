# app/auth/auth_handler.py
from fastapi import Depends, HTTPException, Request
import logging
from app.db.database import supabase_client
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

SESSION_COOKIE_NAME = "session_id"
SESSION_EXPIRY_MINUTES = 1440  # 24 hours

async def get_current_user(request: Request) -> dict:
    """Verify the session ID from the cookie and retrieve user data from Supabase."""
    logger.debug(f"Cookies received: {request.cookies}")
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_id:
        logger.warning("No session cookie found")
        raise HTTPException(status_code=403, detail="Authentication required")
    
    logger.debug(f"Session ID from cookie: {session_id}")

    # Retrieve session from Supabase
    try:
        session_response = supabase_client.table("sessions").select("*").eq("session_id", session_id).execute()
        if not session_response.data or len(session_response.data) == 0:
            logger.warning(f"Session not found for session_id: {session_id}")
            raise HTTPException(status_code=403, detail="Invalid session")

        session = session_response.data[0]
        
        # Check session expiry
        created_at = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
        expiry_time = created_at + timedelta(minutes=SESSION_EXPIRY_MINUTES)
        # Convert utcnow to an offset-aware datetime to match expiry_time
        current_time = datetime.utcnow().replace(tzinfo=created_at.tzinfo)
        if current_time > expiry_time:
            logger.info(f"Session expired for session_id: {session_id}")
            supabase_client.table("sessions").delete().eq("session_id", session_id).execute()
            raise HTTPException(status_code=403, detail="Session expired")

        # Get user data from the database
        user_email = session.get("email")
        if not user_email:
            logger.warning("Invalid session: No email found")
            raise HTTPException(status_code=403, detail="Invalid session")

        user_response = supabase_client.table("admin_user").select("*").eq("email", user_email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            logger.warning(f"User not found: {user_email}")
            raise HTTPException(status_code=404, detail="User not found")
            
        logger.info(f"User authenticated: {user_email}")
        return user_response.data[0]
    except HTTPException as he:
        # Re-raise HTTP exceptions without modification
        raise he
    except Exception as e:
        logger.exception(f"Error verifying user: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")