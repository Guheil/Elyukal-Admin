from fastapi import APIRouter, Depends, HTTPException, Request, Response
from app.db.database import supabase_client
from app.core.security import hash_password, verify_password
from app.schemas.user import UserRegister, UserLogin
from uuid import uuid4
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

# Configure detailed logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

SESSION_COOKIE_NAME = "session_id"
SESSION_EXPIRY_MINUTES = 30  

def set_session_cookie(response: Response, session_id: str):
    """Set an HTTP-only session cookie with secure attributes."""
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_id,
        httponly=True,  # Prevent JavaScript access
        secure=True,    # Enforce HTTPS (disable in development if needed)
        samesite="strict",  # Prevent CSRF
        max_age=SESSION_EXPIRY_MINUTES * 60,  # Cookie expiry in seconds
    )

def delete_session_cookie(response: Response):
    """Delete the session cookie."""
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        secure=True,
        samesite="strict",
    )

async def verify_session(request: Request) -> dict:
    """Verify the session ID from the cookie and retrieve session data from Supabase."""
    session_id = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_id:
        logger.warning("No session cookie found")
        raise HTTPException(status_code=403, detail="Invalid session")

    # Retrieve session from Supabased
    try:
        session_response = supabase_client.table("sessions").select("*").eq("session_id", session_id).execute()
        if not session_response.data or len(session_response.data) == 0:
            logger.warning(f"Session not found for session_id: {session_id}")
            raise HTTPException(status_code=403, detail="Invalid session")

        session = session_response.data[0]
        
        # Check session expiry
        created_at = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
        expiry_time = created_at + timedelta(minutes=SESSION_EXPIRY_MINUTES)
        if datetime.utcnow() > expiry_time:
            logger.info(f"Session expired for session_id: {session_id}")
            supabase_client.table("sessions").delete().eq("session_id", session_id).execute()
            raise HTTPException(status_code=403, detail="Session expired")

        return session
    except Exception as e:
        logger.exception(f"Error verifying session: {str(e)}")
        raise HTTPException(status_code=500, detail="Session verification failed")

@router.post("/register")
async def register_user(user: UserRegister):
    try:
        logger.debug(f"Registering user: {user.email}")
        existing_user = supabase_client.table("users").select("*").eq("email", user.email).execute()
        if existing_user.data and len(existing_user.data) > 0:
            logger.warning(f"User already exists: {user.email}")
            raise HTTPException(status_code=400, detail="User already exists")

        hashed_password = hash_password(user.password)
        
        response = supabase_client.table("users").insert({
            "email": user.email,
            "password_hash": hashed_password,
            "first_name": user.first_name,
            "last_name": user.last_name
        }).execute()

        logger.info(f"User registered: {user.email}")
        return {"message": "User registered successfully"}
    except Exception as e:
        logger.exception(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login_user(user: UserLogin, response: Response):
    logger.debug("Entering login endpoint")  # Add this
    try:
        logger.debug(f"Logging in user: {user.email}")
        db_response = supabase_client.table("users").select("*").eq("email", user.email).execute()
        logger.debug(f"Database response: {db_response.data}")  # Add this
        
        if not db_response.data or len(db_response.data) == 0:
            logger.warning(f"Login failed: User not found for email {user.email}")
            raise HTTPException(status_code=400, detail="User not found")

        db_user = db_response.data[0]
        logger.debug(f"Found user: {db_user}")  # Add this
        if not verify_password(user.password, db_user["password_hash"]):
            logger.warning(f"Login failed: Incorrect password for {user.email}")
            raise HTTPException(status_code=400, detail="Incorrect password")
        
        # Create a session
        session_id = str(uuid4())
        session_data = {
            "session_id": session_id,
            "email": user.email,
            "created_at": datetime.utcnow().isoformat() + "Z",
        }
        logger.debug(f"Creating session: {session_data}")  # Add this
        supabase_client.table("sessions").insert(session_data).execute()

        # Set session cookie in the response
        set_session_cookie(response, session_id)

        logger.info(f"Login successful: {user.email}")
        return {"message": "Login successful"}
    except Exception as e:
        logger.exception(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/profile")
async def get_user_profile(session: dict = Depends(verify_session)):
    try:
        user_email = session.get("email")
        if not user_email:
            logger.warning("Invalid session: No email found")
            raise HTTPException(status_code=403, detail="Invalid session")

        response = supabase_client.table("users").select("email", "first_name", "last_name").eq("email", user_email).execute()
        
        if not response.data or len(response.data) == 0:
            logger.warning(f"User not found: {user_email}")
            raise HTTPException(status_code=404, detail="User not found")
            
        logger.info(f"Profile retrieved for: {user_email}")
        return {"profile": response.data[0]}
    except Exception as e:
        logger.exception(f"Profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout(response: Response, session: dict = Depends(verify_session)):
    try:
        session_id = session.get("session_id")
        logger.debug(f"Logging out session: {session_id}")
        supabase_client.table("sessions").delete().eq("session_id", session_id).execute()
        delete_session_cookie(response)
        logger.info("Logout successful")
        return {"message": "Logout successful"}
    except Exception as e:
        logger.exception(f"Logout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))