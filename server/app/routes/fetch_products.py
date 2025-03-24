from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.product import Products
from typing import List

router = APIRouter()

@router.get("/fetch_products")
async def fetch_products():
    try:
        # Fetch products with store details
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, views, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="No products found")

        products = response.data

        # Fetch ratings for each product
        for product in products:
            ratings_response = (
                supabase_client.table("reviews")
                .select("rating")
                .eq("product_id", product["id"])
                .execute()
            )
            ratings = [r["rating"] for r in ratings_response.data]
            product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)

        return {"products": products}

    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
@router.get("/get_total_number_of_products")
async def get_total_number_of_products():
    try:
        # Query the total count of products
        response = supabase_client.table("products").select("id", count="exact").execute()
        
        # The count is returned in the response count property
        total_products = response.count
        
        if total_products is None:
            # Fallback if count property is not available
            total_products = len(response.data)
        
        return {"total_products": total_products}
    
    except Exception as e:
        print(f"Error getting total product count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/get_total_number_of_product_views")
async def get_total_number_of_product_views():
    try:
        # Query all products to get their views
        response = supabase_client.table("products").select("views").execute()
        
        # Calculate the sum of all views
        total_views = sum([p.get("views", 0) for p in response.data]) if response.data else 0
        
        return {"total_product_views": total_views}
    
    except Exception as e:
        print(f"Error getting total product views: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
@router.get("/fetch_products_by_municipality/{municipality_id}")
async def fetch_products_by_municipality(municipality_id: str):
    try:
        # Fetch products for a specific municipality (filter by town) with store details
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, views, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("town", municipality_id).execute()

        if not response.data:
            return {"products": []}  # Return empty list if no products found

        products = response.data

        # Fetch ratings for each product
        for product in products:
            ratings_response = (
                supabase_client.table("reviews")
                .select("rating")
                .eq("product_id", product["id"])
                .execute()
            )
            ratings = [r["rating"] for r in ratings_response.data]
            product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)

        return {"products": products}

    except Exception as e:
        print(f"Error fetching products by municipality: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/fetch_similar_products/{product_id}")
async def fetch_similar_products(product_id: str):
    try:
        reference_product = supabase_client.table("products").select(
            "id, name, store_id, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("id", product_id).single().execute()

        if not reference_product.data:
            raise HTTPException(status_code=404, detail="Reference product not found")

        ref_name = reference_product.data["name"].strip()  # Remove leading/trailing spaces

        response = supabase_client.table("products").select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, views, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
        ).eq("name", ref_name).neq("id", product_id).execute()

        if not response.data:
            print(f"No similar products found for name: '{ref_name}'")  # Log for debugging
            return {"similar_products": []}

        similar_products = response.data
        print(f"Found similar products: {similar_products}")  # Log results

        for product in similar_products:
            ratings_response = (
                supabase_client.table("reviews")
                .select("rating")
                .eq("product_id", product["id"])
                .execute()
            )
            ratings = [r["rating"] for r in ratings_response.data]
            product["average_rating"] = "{:.1f}".format(round(sum(ratings) / len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)

        return {"similar_products": similar_products}

    except Exception as e:
        print(f"Error fetching similar products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
@router.get("/fetch_popular_products")
async def fetch_popular_products():
    try:
        # Fetch products without ordering yet
        response = supabase_client.table('products').select(
            "id, name, description, category, price_min,price_max, ar_asset_url, image_urls, address, in_stock, store_id, views, "
            "stores(name, store_id, latitude, longitude, store_image, type, rating)"
        ).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="No products found")
        
        products = response.data
        
        for product in products:
            ratings_response = supabase_client.table("reviews").select("rating").eq("product_id", product["id"]).execute()
            ratings = [r["rating"] for r in ratings_response.data] if ratings_response.data else []
            product["average_rating"] = "{:.1f}".format(round(sum(ratings)/len(ratings), 1)) if ratings else "0"
            product["total_reviews"] = len(ratings)
        
       
        sorted_products = sorted(products, key=lambda x: x["average_rating"], reverse=True)[:4]
        
        return {"products": sorted_products}
    
    except Exception as e:
        print(f"Error fetching products: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {type(e).__name__}: {str(e)}")