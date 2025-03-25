from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Path
from app.db.database import supabase_client
from app.schemas.stores import Store
from app.auth.auth_handler import get_current_user
from app.utils.activity_logger import log_admin_activity
from typing import List, Optional
import uuid
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='store_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/add_store")
async def add_store(
    name: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    rating: float = Form(0.0),
    type: Optional[str] = Form(None),
    operating_hours: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    store_image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Starting store creation for store: {name}")
        
        # Generate a unique store_id
        store_id = str(uuid.uuid4())
        logger.debug(f"Generated store_id: {store_id}")
        
        # Upload store image if provided
        store_image_url = ""
        if store_image:
            try:
                image_path = f"store-images/{store_id}/{uuid.uuid4()}"
                logger.debug(f"Uploading store image to path: {image_path}")
                
                content = await store_image.read()
                supabase_client.storage.from_("test-bucket").upload(
                    path=image_path,
                    file=content,
                    file_options={"content-type": store_image.content_type}
                )
                
                store_image_url = supabase_client.storage.from_("test-bucket").get_public_url(image_path)
                logger.debug(f"Successfully uploaded store image: {store_image_url}")
            except Exception as img_error:
                logger.error(f"Failed to upload store image: {str(img_error)}", exc_info=True)
                raise
        
        # Prepare store data
        store_data = {
            "store_id": store_id,
            "name": name,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "rating": rating,
            "store_image": store_image_url,
            "type": type,
            "operating_hours": operating_hours,
            "phone": phone
        }
        
        logger.debug(f"Inserting store data: {json.dumps(store_data)}")
        response = supabase_client.table("stores").insert(store_data).execute()
        
        if not response.data:
            logger.error("Supabase returned no data after store insert")
            raise HTTPException(status_code=500, detail="Failed to add store")
        
        # Log admin activity for adding store
        await log_admin_activity(current_user, "added", name, "Store")
        
        logger.info(f"Successfully added store with ID: {store_id}")
        return {"message": "Store added successfully", "store": response.data[0]}
        
    except Exception as e:
        logger.error(f"Error adding store: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error adding store: {str(e)}")

@router.get("/fetch_store/{store_id}")
async def fetch_store(store_id: str = Path(...), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Fetching store with ID: {store_id}")
        
        # Query the store from the database
        response = supabase_client.table("stores").select("*").eq("store_id", store_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"Store with ID {store_id} not found")
            raise HTTPException(status_code=404, detail=f"Store with ID {store_id} not found")
        
        # Fetch products for this store
        products_response = supabase_client.table("products").select("*").eq("store_id", store_id).execute()
        
        store = response.data[0]
        store['products'] = products_response.data or []
        
        logger.info(f"Successfully fetched store with ID: {store_id}")
        return {"store": store}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error fetching store: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching store: {str(e)}")

@router.put("/update_store/{store_id}")
async def update_store(
    store_id: str = Path(...),
    name: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    rating: Optional[float] = Form(None),
    type: Optional[str] = Form(None),
    operating_hours: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    keep_image: bool = Form(True),
    store_image: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Starting store update for store_id: {store_id}")
        
        # First, check if the store exists
        store_response = supabase_client.table("stores").select("*").eq("store_id", store_id).execute()
        
        if not store_response.data or len(store_response.data) == 0:
            logger.error(f"Store with ID {store_id} not found")
            raise HTTPException(status_code=404, detail=f"Store with ID {store_id} not found")
        
        existing_store = store_response.data[0]
        
        # Handle store image
        store_image_url = existing_store.get("store_image", "") if keep_image else ""
        
        # Upload new store image if provided and not keeping existing
        if store_image and not keep_image:
            try:
                image_path = f"store-images/{store_id}/{uuid.uuid4()}"
                logger.debug(f"Uploading new store image to path: {image_path}")
                
                content = await store_image.read()
                supabase_client.storage.from_("test-bucket").upload(
                    path=image_path,
                    file=content,
                    file_options={"content-type": store_image.content_type}
                )
                
                store_image_url = supabase_client.storage.from_("test-bucket").get_public_url(image_path)
                logger.debug(f"Successfully uploaded new store image: {store_image_url}")
            except Exception as img_error:
                logger.error(f"Failed to upload new store image: {str(img_error)}", exc_info=True)
                raise
        
        # Prepare store update data
        store_data = {
            "name": name,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "rating": rating or existing_store.get("rating", 0.0),
            "store_image": store_image_url,
            "type": type,
            "operating_hours": operating_hours,
            "phone": phone
        }
        
        logger.debug(f"Updating store data: {json.dumps(store_data)}")
        response = supabase_client.table("stores").update(store_data).eq("store_id", store_id).execute()
        
        if not response.data:
            logger.error("Supabase returned no data after store update")
            raise HTTPException(status_code=500, detail="Failed to update store")
        
        # Log admin activity for updating store
        await log_admin_activity(current_user, "edited", name, "Store")
        
        logger.info(f"Successfully updated store with ID: {store_id}")
        return {"message": "Store updated successfully", "store": response.data[0]}
        
    except Exception as e:
        logger.error(f"Error updating store: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating store: {str(e)}")

@router.delete("/delete_store/{store_id}")
async def delete_store(store_id: str = Path(...), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Starting store deletion for store_id: {store_id}")
        
        # First, check if the store exists and get its name for logging
        store_response = supabase_client.table("stores").select("*").eq("store_id", store_id).execute()
        
        if not store_response.data or len(store_response.data) == 0:
            logger.error(f"Store with ID {store_id} not found")
            raise HTTPException(status_code=404, detail=f"Store with ID {store_id} not found")
        
        existing_store = store_response.data[0]
        store_name = existing_store.get("name", f"Store {store_id}")
        
        # Delete associated products first
        products_delete_response = supabase_client.table("products").delete().eq("store_id", store_id).execute()
        logger.info(f"Deleted {len(products_delete_response.data or [])} associated products")
        
        # Delete the store from the database
        delete_response = supabase_client.table("stores").delete().eq("store_id", store_id).execute()
        
        if not delete_response.data:
            logger.error(f"Failed to delete store with ID {store_id}")
            raise HTTPException(status_code=500, detail="Failed to delete store")
        
        # Log admin activity for deleting store
        await log_admin_activity(current_user, "deleted", store_name, "Store")
        
        logger.info(f"Successfully deleted store with ID: {store_id}")
        return {"message": "Store deleted successfully"}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error deleting store: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error deleting store: {str(e)}")