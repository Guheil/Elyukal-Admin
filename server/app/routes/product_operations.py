from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form, Path
from app.db.database import supabase_client
from app.schemas.product import Products
from app.auth.auth_handler import get_current_user
from typing import List, Optional
import uuid
import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='product_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/add_product")
async def add_product(
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    price_min: float = Form(...),
    price_max: float = Form(...),
    address: str = Form(...),
    location_name: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    in_stock: bool = Form(...),
    store_id: str = Form(...),
    town: Optional[str] = Form(None),
    images: List[UploadFile] = File(...),
    ar_asset: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Starting product creation for store_id: {store_id}")
        
        # Check available buckets
        try:
            buckets = supabase_client.storage.list_buckets()
            bucket_names = [b.name for b in buckets]
            logger.info(f"Available buckets: {bucket_names}")
            if "test-bucket" not in bucket_names:
                logger.error("Bucket 'test-bucket' not found in Supabase storage")
                raise HTTPException(
                    status_code=500,
                    detail="Storage bucket 'test-bucket' not found in Supabase."
                )
        except Exception as bucket_error:
            logger.error(f"Failed to list buckets: {str(bucket_error)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error checking storage buckets: {str(bucket_error)}")

        product_id = str(uuid.uuid4())
        logger.debug(f"Generated product_id: {product_id}")
        
        # Upload images to 'product-images' folder in test-bucket
        image_urls = []
        for i, image in enumerate(images):
            try:
                image_path = f"product-images/products/{product_id}/{i}_{uuid.uuid4()}"
                logger.debug(f"Uploading image {i} to path: {image_path}")
                
                content = await image.read()
                supabase_client.storage.from_("test-bucket").upload(
                    path=image_path,
                    file=content,
                    file_options={"content-type": image.content_type}
                )
                
                image_url = supabase_client.storage.from_("test-bucket").get_public_url(image_path)
                image_urls.append(image_url)
                logger.debug(f"Successfully uploaded image {i}: {image_url}")
            except Exception as img_error:
                logger.error(f"Failed to upload image {i}: {str(img_error)}", exc_info=True)
                raise
        
        # Upload AR asset to 'ar-assets' folder in test-bucket
        ar_asset_url = ""
        if ar_asset:
            try:
                ar_asset_path = f"ar-assets/{product_id}/{uuid.uuid4()}"
                logger.debug(f"Uploading AR asset to path: {ar_asset_path}")
                
                content = await ar_asset.read()
                supabase_client.storage.from_("test-bucket").upload(
                    path=ar_asset_path,
                    file=content,
                    file_options={"content-type": ar_asset.content_type}
                )
                ar_asset_url = supabase_client.storage.from_("test-bucket").get_public_url(ar_asset_path)
                logger.debug(f"Successfully uploaded AR asset: {ar_asset_url}")
            except Exception as ar_error:
                logger.error(f"Failed to upload AR asset: {str(ar_error)}", exc_info=True)
                raise
        
        # Create product in database (excluding rating)
        product_data = {
            "name": name,
            "description": description,
            "category": category,
            "price_min": price_min,
            "price_max": price_max,
            "location_name": location_name,
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "ar_asset_url": ar_asset_url,
            "image_urls": image_urls,
            "in_stock": in_stock,
            "store_id": store_id,
            "town": town
        }
        
        logger.debug(f"Inserting product data: {json.dumps(product_data)}")
        response = supabase_client.table("products").insert(product_data).execute()
        
        if not response.data:
            logger.error("Supabase returned no data after insert")
            raise HTTPException(status_code=500, detail="Failed to add product")
        
        logger.info(f"Successfully added product with ID: {product_id}")
        return {"message": "Product added successfully", "product": response.data[0]}
        
    except Exception as e:
        logger.error(f"Error adding product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error adding product: {str(e)}")

@router.get("/fetch_product/{product_id}")
async def fetch_product(product_id: int = Path(...), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Fetching product with ID: {product_id}")
        
        # Query the product from the database
        response = supabase_client.table("products").select("*").eq("id", product_id).execute()
        
        if not response.data or len(response.data) == 0:
            logger.error(f"Product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        # Get the product data
        product = response.data[0]
        
        # Fetch the store information for this product
        store_response = supabase_client.table("stores").select("*").eq("store_id", product["store_id"]).execute()
        
        if store_response.data and len(store_response.data) > 0:
            product["stores"] = store_response.data[0]
        
        logger.info(f"Successfully fetched product with ID: {product_id}")
        return {"product": product}
        
    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error fetching product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching product: {str(e)}")

@router.put("/update_product/{product_id}")
async def update_product(
    product_id: int = Path(...),
    name: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    price_min: float = Form(...),
    price_max: float = Form(...),
    address: str = Form(...),
    location_name: str = Form(...),
    latitude: str = Form(...),
    longitude: str = Form(...),
    in_stock: bool = Form(...),
    store_id: str = Form(...),
    town: Optional[str] = Form(None),
    keep_images: str = Form(...),  # JSON string of image URLs to keep
    images: List[UploadFile] = File([]),  # New images to add
    keep_ar_asset: bool = Form(...),  # Whether to keep existing AR asset
    ar_asset: Optional[UploadFile] = File(None),  # New AR asset if not keeping existing
    current_user: dict = Depends(get_current_user)
):
    try:
        logger.info(f"Starting product update for product_id: {product_id}")
        
        # First, check if the product exists
        product_response = supabase_client.table("products").select("*").eq("id", product_id).execute()
        
        if not product_response.data or len(product_response.data) == 0:
            logger.error(f"Product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")
        
        existing_product = product_response.data[0]
        
        # Parse the keep_images JSON string to get the list of image URLs to keep
        try:
            keep_image_urls = json.loads(keep_images)
            if not isinstance(keep_image_urls, list):
                keep_image_urls = []
        except json.JSONDecodeError:
            keep_image_urls = []
            logger.warning(f"Invalid keep_images JSON: {keep_images}")
        
        # Prepare the final list of image URLs (kept + new)
        final_image_urls = keep_image_urls.copy()
        
        # Upload new images if any
        if images:
            for i, image in enumerate(images):
                try:
                    image_path = f"product-images/products/{product_id}/{i}_{uuid.uuid4()}"
                    logger.debug(f"Uploading new image {i} to path: {image_path}")
                    
                    content = await image.read()
                    supabase_client.storage.from_("test-bucket").upload(
                        path=image_path,
                        file=content,
                        file_options={"content-type": image.content_type}
                    )
                    
                    image_url = supabase_client.storage.from_("test-bucket").get_public_url(image_path)
                    final_image_urls.append(image_url)
                    logger.debug(f"Successfully uploaded new image {i}: {image_url}")
                except Exception as img_error:
                    logger.error(f"Failed to upload new image {i}: {str(img_error)}", exc_info=True)
                    raise
        
        # Handle AR asset
        ar_asset_url = existing_product.get("ar_asset_url", "") if keep_ar_asset else ""
        
        # Upload new AR asset if provided and not keeping existing
        if ar_asset and not keep_ar_asset:
            try:
                ar_asset_path = f"ar-assets/{product_id}/{uuid.uuid4()}"
                logger.debug(f"Uploading new AR asset to path: {ar_asset_path}")
                
                content = await ar_asset.read()
                supabase_client.storage.from_("test-bucket").upload(
                    path=ar_asset_path,
                    file=content,
                    file_options={"content-type": ar_asset.content_type}
                )
                ar_asset_url = supabase_client.storage.from_("test-bucket").get_public_url(ar_asset_path)
                logger.debug(f"Successfully uploaded new AR asset: {ar_asset_url}")
            except Exception as ar_error:
                logger.error(f"Failed to upload new AR asset: {str(ar_error)}", exc_info=True)
                raise
        
        # Update product data in the database
        product_data = {
            "name": name,
            "description": description,
            "category": category,
            "price_min": price_min,
            "price_max": price_max,
            "location_name": location_name,
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "ar_asset_url": ar_asset_url,
            "image_urls": final_image_urls,
            "in_stock": in_stock,
            "store_id": store_id,
            "town": town
        }
        
        logger.debug(f"Updating product data: {json.dumps(product_data)}")
        response = supabase_client.table("products").update(product_data).eq("id", product_id).execute()
        
        if not response.data:
            logger.error("Supabase returned no data after update")
            raise HTTPException(status_code=500, detail="Failed to update product")
        
        logger.info(f"Successfully updated product with ID: {product_id}")
        return {"message": "Product updated successfully", "product": response.data[0]}
        
    except Exception as e:
        logger.error(f"Error updating product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")