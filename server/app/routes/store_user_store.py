from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Path
from app.db.database import supabase_client
from app.schemas.stores import Store
from app.routes.store_user_auth import verify_store_user_session
from typing import List, Optional
import uuid
import json
import logging
from fastapi import Request

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='store_user_store_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Store Operations"])

@router.post("/store-user/create-store")
async def create_seller_store(
    request: Request,
    name: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    rating: float = Form(0.0),
    type: Optional[str] = Form(None),
    operating_hours: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    town: Optional[str] = Form(None),
    store_image: Optional[UploadFile] = File(None),
):
    try:
        # Verify the store user session
        session = await verify_store_user_session(request)
        user_email = session.get("email")
        
        if not user_email:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Get the store user record
        user_response = supabase_client.table("store_user").select("*").eq("email", user_email).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=404, detail="Store user not found")
        
        store_user = user_response.data[0]
        
        # Check if the store user is approved
        if store_user.get("status") != "accepted":
            raise HTTPException(status_code=403, detail="Your account must be approved to create a store")
        
        # Check if the user already has a store
        if store_user.get("store_owned"):
            raise HTTPException(status_code=400, detail="You already have a store. You can only own one store.")
        
        logger.info(f"Starting store creation for seller: {user_email}, store: {name}")
        
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
            "phone": phone,
            "town": town
        }
        
        logger.debug(f"Inserting store data: {json.dumps(store_data)}")
        response = supabase_client.table("stores").insert(store_data).execute()
        
        if not response.data:
            logger.error("Supabase returned no data after store insert")
            raise HTTPException(status_code=500, detail="Failed to add store")
        
        # Update the store_user record with the new store_id
        update_response = supabase_client.table("store_user").update(
            {"store_owned": store_id}
        ).eq("email", user_email).execute()
        
        if not update_response.data:
            logger.error(f"Failed to update store_user with store_id: {store_id}")
            # If we can't update the user, we should delete the store to maintain consistency
            supabase_client.table("stores").delete().eq("store_id", store_id).execute()
            raise HTTPException(status_code=500, detail="Failed to associate store with your account")
        
        logger.info(f"Successfully added store with ID: {store_id} for seller: {user_email}")
        return {"message": "Store added successfully", "store": response.data[0]}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error adding store: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error adding store: {str(e)}")