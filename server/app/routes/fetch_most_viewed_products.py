from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client

router = APIRouter()

@router.get("/fetch_most_viewed_products")
async def fetch_most_viewed_products():
    try:
        # Fetch products with store details
        response = supabase_client.table("products").select(
            "id, name, description, category, price_min, price_max, ar_asset_url, image_urls, address, in_stock, store_id, views, stores(name, store_id, latitude, longitude, store_image, type, rating, town)"
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

        # Sort products by views in descending order and take top 5
        sorted_products = sorted(products, key=lambda x: x.get("views", 0), reverse=True)[:5]

        return {"products": sorted_products}

    except Exception as e:
        print(f"Error fetching most viewed products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")