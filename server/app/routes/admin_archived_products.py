from fastapi import APIRouter, HTTPException, Depends, Path
from app.db.database import supabase_client
from app.auth.auth_handler import get_current_user
from app.utils.activity_logger import log_admin_activity
from typing import Optional
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='admin_archived_products_errors.log'
)
logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin Archived Product Operations"])

@router.put("/admin/archive-product/{product_id}")
async def archive_product(product_id: int = Path(...), current_user: dict = Depends(get_current_user)):
    """
    Archive a product by moving it from the products table to the archived_products table.
    """
    try:
        logger.info(f"Starting product archiving for product_id: {product_id}")

        # Check if the product is already in the archived_products table
        archived_check = supabase_client.table("archived_products").select("*").eq("original_product_id", product_id).execute()

        if archived_check.data and len(archived_check.data) > 0:
            logger.info(f"Product with ID {product_id} is already archived")
            return {"message": "Product is already archived"}

        # First, check if the product exists and get its data
        product_response = supabase_client.table("products").select("*").eq("id", product_id).execute()

        if not product_response.data or len(product_response.data) == 0:
            logger.error(f"Product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Product with ID {product_id} not found")

        existing_product = product_response.data[0]

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
            "archived_by": current_user["id"],
            "archived_by_type": "admin"
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

        # Log admin activity for archiving product
        await log_admin_activity(current_user, "archived", existing_product["name"])

        logger.info(f"Successfully archived product with ID: {product_id}")
        return {"message": "Product archived successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error archiving product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error archiving product: {str(e)}")

@router.put("/admin/restore-product/{product_id}")
async def restore_product(product_id: int = Path(...), current_user: dict = Depends(get_current_user)):
    """
    Restore a product by moving it from the archived_products table back to the products table.
    """
    try:
        logger.info(f"Starting product restoration for product_id: {product_id}")

        # First, check if the archived product exists and get its data
        archived_product_response = supabase_client.table("archived_products").select("*").eq("id", product_id).execute()

        if not archived_product_response.data or len(archived_product_response.data) == 0:
            logger.error(f"Archived product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Archived product with ID {product_id} not found")

        archived_product = archived_product_response.data[0]

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
            original_id = archived_product["original_product_id"]
            supabase_client.table("products").delete().eq("id", original_id).execute()
            raise HTTPException(status_code=500, detail="Failed to complete product restoration")

        # Log admin activity for restoring product
        await log_admin_activity(current_user, "restored", archived_product["name"])

        logger.info(f"Successfully restored product with ID: {product_id}")
        return {"message": "Product restored successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error restoring product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error restoring product: {str(e)}")

@router.get("/admin/fetch-archived-products")
async def fetch_archived_products(_: dict = Depends(get_current_user)):
    """
    Fetch all archived products for admin users.
    """
    try:
        # Fetch all archived products
        response = supabase_client.table("archived_products").select("*").execute()

        if not response.data:
            return {"products": []}  # Return empty list if no archived products found

        archived_products = response.data

        # Fetch store information for each product
        for product in archived_products:
            try:
                store_response = supabase_client.table("stores").select("*").eq("store_id", product["store_id"]).execute()
                if store_response.data and len(store_response.data) > 0:
                    product["stores"] = store_response.data[0]
                else:
                    product["stores"] = {"name": "Unknown Store"}
            except Exception as store_error:
                logger.error(f"Error fetching store for archived product {product['id']}: {str(store_error)}")
                product["stores"] = {"name": "Unknown Store"}

            # Fetch ratings for each product
            try:
                ratings_response = supabase_client.table("reviews").select("rating").eq("product_id", product["id"]).execute()
                ratings = [r.get("rating", 0) for r in ratings_response.data] if ratings_response.data else []
                product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
                product["total_reviews"] = len(ratings)
            except Exception as rating_error:
                logger.error(f"Error fetching ratings for archived product {product['id']}: {str(rating_error)}")
                product["average_rating"] = "0"
                product["total_reviews"] = 0

        return {"products": archived_products}

    except Exception as e:
        logger.error(f"Error fetching archived products: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error fetching archived products: {str(e)}")

@router.delete("/admin/permanently-delete-product/{product_id}")
async def permanently_delete_product(product_id: int = Path(...), current_user: dict = Depends(get_current_user)):
    """
    Permanently delete a product from the archived_products table.
    """
    try:
        logger.info(f"Starting permanent deletion for product_id: {product_id}")

        # First, check if the archived product exists and get its data
        archived_product_response = supabase_client.table("archived_products").select("*").eq("id", product_id).execute()

        if not archived_product_response.data or len(archived_product_response.data) == 0:
            logger.error(f"Archived product with ID {product_id} not found")
            raise HTTPException(status_code=404, detail=f"Archived product with ID {product_id} not found")

        archived_product = archived_product_response.data[0]

        # Delete from archived_products table using the archived product's actual ID
        delete_response = supabase_client.table("archived_products").delete().eq("id", archived_product["id"]).execute()

        if not delete_response.data:
            logger.error(f"Failed to delete product with ID {product_id} from archived_products table")
            raise HTTPException(status_code=500, detail="Failed to permanently delete product")

        # Log admin activity for permanently deleting product
        await log_admin_activity(current_user, "permanently deleted", archived_product["name"])

        logger.info(f"Successfully permanently deleted product with ID: {product_id}")
        return {"message": "Product permanently deleted successfully"}

    except HTTPException as he:
        # Re-raise HTTP exceptions
        raise he
    except Exception as e:
        logger.error(f"Error permanently deleting product: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error permanently deleting product: {str(e)}")
