from fastapi import APIRouter, HTTPException, Depends, Path, Request
from app.db.database import supabase_client
from app.routes.store_user_auth import verify_store_user_session
from typing import Optional
import logging
from datetime import datetime
import uuid

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='store_user_archived_products_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Archived Product Operations"])

@router.put("/store-user/archive-product/{product_id}")
async def archive_product(request: Request, product_id: int = Path(...)):
    """
    Archive a product by moving it from the products table to the archived_products table.
    """
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
        store_user_id = store_user.get("id")
        store_id = store_user.get("store_owned")

        if not store_id:
            raise HTTPException(status_code=400, detail="You don't have a store")

        logger.info(f"Starting product archiving for product_id: {product_id}")

        # First, check if the product exists and get its data
        product_response = supabase_client.table("products").select("*").eq("id", product_id).execute()

        if not product_response.data or len(product_response.data) == 0:
            logger.error(f"Product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

        existing_product = product_response.data[0]

        # Verify that the product belongs to the store user's store
        if str(existing_product["store_id"]) != str(store_id):
            logger.error(f"Product with ID {product_id} does not belong to store {store_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to archive this product")

        # Store the original product ID for reference
        original_product_id = existing_product["id"]

        # Log the original product ID
        logger.info(f"Archiving product with ID: {original_product_id}")

        # Prepare data for archived_products table
        archived_product_data = {
            # Don't include ID field since it's a serial/auto-increment field
            "original_product_id": original_product_id,  # Store the original ID for reference
            "name": existing_product["name"],
            "description": existing_product["description"],
            "category": existing_product["category"],
            "location_name": existing_product.get("location_name", ""),
            "address": existing_product["address"],
            "latitude": existing_product.get("latitude"),
            "longitude": existing_product.get("longitude"),
            "ar_asset_url": existing_product.get("ar_asset_url", ""),
            "image_urls": existing_product.get("image_urls", []),
            "in_stock": False,  # Archived products are set to not in stock
            "store_id": existing_product["store_id"],
            "town": existing_product.get("town"),
            "price_min": existing_product.get("price_min"),
            "price_max": existing_product.get("price_max"),
            "views": existing_product.get("views", 0),
            "archived_at": datetime.now().isoformat(),
            "archived_by": store_user_id,
            "archived_by_type": "store_user"
        }

        # Insert into archived_products table
        archive_response = supabase_client.table("archived_products").insert(archived_product_data).execute()

        if not archive_response.data:
            logger.error("Failed to insert into archived_products table")
            raise HTTPException(status_code=500, detail="Failed to archive product")

        # Delete from products table
        delete_response = supabase_client.table("products").delete().eq("id", product_id).execute()

        if not delete_response.data:
            logger.error(f"Failed to delete product with ID {product_id} from products table")
            # Try to delete from archived_products to maintain consistency
            # We can now use the original_product_id to find the archived product
            cleanup_response = supabase_client.table("archived_products").select("id").eq("original_product_id", product_id).execute()
            if cleanup_response.data and len(cleanup_response.data) > 0:
                archived_id = cleanup_response.data[0]["id"]
                supabase_client.table("archived_products").delete().eq("id", archived_id).execute()
            raise HTTPException(status_code=500, detail="Failed to complete product archiving")

        logger.info(f"Successfully archived product with ID: {product_id}")
        return {"message": "Product archived successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error archiving product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error archiving product: {str(e)}")

@router.put("/store-user/restore-product/{product_id}")
async def restore_product(request: Request, product_id: int = Path(...)):
    """
    Restore a product by moving it from the archived_products table back to the products table.
    """
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
        store_id = store_user.get("store_owned")

        if not store_id:
            raise HTTPException(status_code=400, detail="You don't have a store")

        logger.info(f"Starting product restoration for product_id: {product_id}")

        # First, check if the archived product exists and get its data
        # We can use either the ID directly or the original_product_id field
        # For this endpoint, we'll use the ID directly since that's what the client will have
        archived_product_response = supabase_client.table("archived_products").select("*").eq("id", product_id).execute()

        if not archived_product_response.data or len(archived_product_response.data) == 0:
            logger.error(f"Archived product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Archived product with ID {product_id} not found")

        archived_product = archived_product_response.data[0]

        # Verify that the product belongs to the store user's store
        if str(archived_product["store_id"]) != str(store_id):
            logger.error(f"Archived product with ID {product_id} does not belong to store {store_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to restore this product")

        # Prepare data for products table
        product_data = {
            "id": archived_product["original_product_id"],  # Use the original product ID
            "name": archived_product["name"],
            "description": archived_product["description"],
            "category": archived_product["category"],
            "location_name": archived_product.get("location_name", ""),
            "address": archived_product["address"],
            "latitude": archived_product.get("latitude"),
            "longitude": archived_product.get("longitude"),
            "ar_asset_url": archived_product.get("ar_asset_url", ""),
            "image_urls": archived_product.get("image_urls", []),
            "in_stock": True,  # Restored products are set to in stock by default
            "store_id": archived_product["store_id"],
            "town": archived_product.get("town"),
            "price_min": archived_product.get("price_min"),
            "price_max": archived_product.get("price_max"),
            "views": archived_product.get("views", 0)
        }

        # Insert into products table
        restore_response = supabase_client.table("products").insert(product_data).execute()

        if not restore_response.data:
            logger.error("Failed to insert into products table")
            raise HTTPException(status_code=500, detail="Failed to restore product")

        # Delete from archived_products table using the archived product's actual ID
        delete_response = supabase_client.table("archived_products").delete().eq("id", archived_product["id"]).execute()

        if not delete_response.data:
            logger.error(f"Failed to delete product with ID {product_id} from archived_products table")
            # Try to delete from products to maintain consistency
            # We can use the original_product_id directly
            original_id = archived_product["original_product_id"]
            supabase_client.table("products").delete().eq("id", original_id).execute()
            raise HTTPException(status_code=500, detail="Failed to complete product restoration")

        logger.info(f"Successfully restored product with ID: {product_id}")
        return {"message": "Product restored successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error restoring product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error restoring product: {str(e)}")

@router.get("/store-user/fetch-archived-products")
async def fetch_archived_products(request: Request):
    """
    Fetch all archived products for the current store user.
    """
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
        store_id = store_user.get("store_owned")

        if not store_id:
            return {"products": []}  # Return empty list if user doesn't have a store

        # Fetch archived products for this store
        response = supabase_client.table("archived_products").select(
            "*"
        ).eq("store_id", store_id).execute()

        if not response.data:
            return {"products": []}  # Return empty list if no archived products found

        archived_products = response.data

        # Fetch ratings for each product
        for product in archived_products:
            try:
                ratings_response = supabase_client.table("reviews").select(
                    "rating"
                ).eq("product_id", product["id"]).execute()

                ratings = [r.get("rating", 0) for r in ratings_response.data] if ratings_response.data else []
                product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
                product["total_reviews"] = len(ratings)
            except Exception as rating_error:
                logger.error(f"Error fetching ratings for archived product {product['id']}: {str(rating_error)}")
                product["average_rating"] = "0"
                product["total_reviews"] = 0

        return {"products": archived_products}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error fetching archived products: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching archived products: {str(e)}")

@router.delete("/store-user/permanently-delete-product/{product_id}")
async def permanently_delete_product(request: Request, product_id: int = Path(...)):
    """
    Permanently delete a product from the archived_products table.
    """
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
        store_id = store_user.get("store_owned")

        if not store_id:
            raise HTTPException(status_code=400, detail="You don't have a store")

        logger.info(f"Starting permanent deletion for product_id: {product_id}")

        # First, check if the archived product exists and get its data
        # We can use either the ID directly or the original_product_id field
        # For this endpoint, we'll use the ID directly since that's what the client will have
        archived_product_response = supabase_client.table("archived_products").select("*").eq("id", product_id).execute()

        if not archived_product_response.data or len(archived_product_response.data) == 0:
            logger.error(f"Archived product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Archived product with ID {product_id} not found")

        archived_product = archived_product_response.data[0]

        # Verify that the product belongs to the store user's store
        if str(archived_product["store_id"]) != str(store_id):
            logger.error(f"Archived product with ID {product_id} does not belong to store {store_id}")
            raise HTTPException(status_code=403, detail="You don't have permission to delete this product")

        # Delete from archived_products table using the archived product's actual ID
        delete_response = supabase_client.table("archived_products").delete().eq("id", archived_product["id"]).execute()

        if not delete_response.data:
            logger.error(f"Failed to delete product with ID {product_id} from archived_products table")
            raise HTTPException(status_code=500, detail="Failed to permanently delete product")

        logger.info(f"Successfully permanently deleted product with ID: {product_id}")
        return {"message": "Product permanently deleted successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error permanently deleting product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error permanently deleting product: {str(e)}")
