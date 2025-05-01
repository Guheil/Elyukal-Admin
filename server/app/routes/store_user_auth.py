from fastapi import APIRouter, Depends, HTTPException, Request, Response, Body
from app.db.database import supabase_client
from app.auth.auth_handler import get_current_user
import bcrypt
import logging
from datetime import datetime, timedelta
from uuid import uuid4
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Authentication"])

SESSION_COOKIE_NAME = "store_user_session"
SESSION_EXPIRY_MINUTES = 1440  # 24 hours

def set_session_cookie(response: Response, session_id: str):
    """Set an HTTP-only session cookie with secure attributes."""
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,  # Prevent JavaScript access
        secure=False,   # Set to False for HTTP in development, True for production HTTPS
        samesite="lax",  # Use 'lax' for better compatibility in development
        max_age=SESSION_EXPIRY_MINUTES * 60,  # Cookie expiry in seconds (24 hours)
    )

def delete_session_cookie(response: Response):
    """Delete the session cookie."""
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=False,  # Set to False for HTTP in development, True for production HTTPS
        samesite="lax",  # Use 'lax' for better compatibility in development
    )

async def verify_store_user_session(request: Request) -> dict:
    """Verify the session ID from the cookie and retrieve session data from Supabase."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_id:
        logger.warning("No store user session cookie found")
        raise HTTPException(status_code=403, detail="Invalid session")
    
    # Retrieve session from Supabase
    try:
        session_response = supabase_client.table("store_user_sessions").select("*").eq("session_id", session_id).execute()
        if not session_response.data or len(session_response.data) == 0:
            logger.warning(f"Store user session not found for session_id: {session_id}")
            raise HTTPException(status_code=403, detail="Invalid session")

        session = session_response.data[0]
        
        # Check session expiry
        created_at = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
        expiry_time = created_at + timedelta(minutes=SESSION_EXPIRY_MINUTES)
        # Convert utcnow to an offset-aware datetime to match expiry_time
        current_time = datetime.utcnow().replace(tzinfo=created_at.tzinfo)
        if current_time > expiry_time:
            logger.info(f"Store user session expired for session_id: {session_id}")
            supabase_client.table("store_user_sessions").delete().eq("session_id", session_id).execute()
            raise HTTPException(status_code=403, detail="Session expired")

        return session
    except Exception as e:
        logger.exception(f"Error verifying store user session: {str(e)}")
        raise HTTPException(status_code=500, detail="Session verification failed")

@router.post("/store-user/login")
async def login_store_user(response: Response, email: str = Body(...), password: str = Body(...)):
    """Login a store user and create a session"""
    try:
        user_response = supabase_client.table("store_user").select("*").eq("email", email).execute()
        if not user_response.data or len(user_response.data) == 0:
            admin_response = supabase_client.table("admin_user").select("*").eq("email", email).execute()
            if admin_response.data and len(admin_response.data) > 0:
                logger.warning(f"Admin user {email} attempted to login as store user")
                raise HTTPException(status_code=403, detail="Admin users cannot login as store users")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        store_user = user_response.data[0]
        if store_user.get("status") != "accepted":
            status = store_user.get("status", "unknown")
            logger.warning(f"Store user {email} with status '{status}' attempted to login")
            raise HTTPException(status_code=403, detail=f"Your account status is '{status}'. Only approved accounts can login.")
        
        stored_password = store_user.get("hashed_password")
        if not stored_password or not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        session_id = str(uuid4())
        session_data = {
            "session_id": session_id,
            "user_id": store_user.get("id"),
            "email": store_user.get("email"),
            "created_at": datetime.utcnow().isoformat()
        }
        
        session_response = supabase_client.table("store_user_sessions").insert(session_data).execute()
        if not session_response.data:
            logger.error(f"Failed to create session for user {email}")
            raise HTTPException(status_code=500, detail="Failed to create session")
        
        logger.info(f"Setting session cookie for session_id: {session_id}")
        set_session_cookie(response, session_id)
        
        return {"message": "Login successful", "status": store_user.get("status")}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Store user login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
@router.get("/store-user/profile")
async def get_store_user_profile(request: Request):
    """Get the profile of the currently logged in store user"""
    try:
        # Verify session
        session = await verify_store_user_session(request)
        
        # Get store user details
        user_response = supabase_client.table("store_user").select("*").eq("email", session.get("email")).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(status_code=404, detail="Store user not found")
        
        store_user = user_response.data[0]
        
        # Get store details if store_owned is not null
        store_details = None
        if store_user.get("store_owned"):
            store_response = supabase_client.table("stores").select("*").eq("store_id", store_user.get("store_owned")).execute()
            if store_response.data and len(store_response.data) > 0:
                store_details = store_response.data[0]
        
        # Create profile response
        profile = {
            "id": store_user.get("id"),
            "email": store_user.get("email"),
            "first_name": store_user.get("first_name"),
            "last_name": store_user.get("last_name"),
            "phone_number": store_user.get("phone_number"),
            "status": store_user.get("status"),
            "created_at": store_user.get("created_at"),
            "store_owned": store_user.get("store_owned"),
        }
        
        return {"profile": profile}
    
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Error fetching store user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(e)}")

@router.get("/store-user/logout", dependencies=None)
async def logout_store_user(request: Request, response: Response):
    """Logout a store user by clearing their session"""
    try:
        session_id = request.cookies.get(SESSION_COOKIE_NAME)
        logger.info(f"Attempting logout with session_id: {session_id}")
        if session_id:
            try:
                supabase_client.table("store_user_sessions").delete().eq("session_id", session_id).execute()
                logger.info(f"Session {session_id} deleted successfully")
            except Exception as e:
                logger.warning(f"Failed to delete session {session_id}: {str(e)}")
        
        delete_session_cookie(response)
        logger.info("Session cookie cleared")
        return {"message": "Logout successful"}
    
    except Exception as e:
        logger.exception(f"Store user logout error: {str(e)}")
        delete_session_cookie(response)
        return {"message": "Logout successful"}