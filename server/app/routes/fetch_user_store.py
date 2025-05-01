from fastapi import APIRouter, HTTPException, Depends, Request
from app.db.database import supabase_client
from app.schemas.stores import Store
from app.routes.store_user_auth import verify_store_user_session
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='store_user_store_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Store Operations"])

@router.get("/store-user/store/{store_id}", response_model=Store)
async def fetch_user_store(
    store_id: str,
    request: Request
):
    """
    Fetch details of a specific store by its store_id.
    Only the store owner can access this endpoint.
    """
    try:
        # Verify the store user session
        session = await verify_store_user_session(request)
        user_email = session.get("email")
        
        if not user_email:
            logger.warning("Unauthorized access attempt to store details")
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Get the store user record
        user_response = supabase_client.table("store_user").select("*").eq("email", user_email).execute()
        
        if not user_response.data:
            logger.error(f"Store user not found for email: {user_email}")
            raise HTTPException(status_code=404, detail="Store user not found")
        
        store_user = user_response.data[0]
        
        # Check if the user owns the requested store
        if store_user.get("store_owned") != store_id:
            logger.warning(f"User {user_email} attempted to access store {store_id} they do not own")
            raise HTTPException(status_code=403, detail="You do not have permission to view this store")
        
        # Fetch store details
        store_response = supabase_client.table("stores").select("*").eq("store_id", store_id).execute()
        
        if not store_response.data:
            logger.error(f"Store not found for store_id: {store_id}")
            raise HTTPException(status_code=404, detail="Store not found")
        
        store_data = store_response.data[0]
        logger.info(f"Successfully fetched store details for store_id: {store_id} by user: {user_email}")
        
        return store_data
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error fetching store details for store_id: {store_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching store details: {str(e)}")