from fastapi import APIRouter, HTTPException, Depends
from app.db.database import supabase_client
from app.auth.auth_handler import get_current_user
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User Dashboard"])

@router.get("/store-user/stats")
async def get_store_user_stats(current_user: dict = Depends(get_current_user)):
    """Fetch dashboard statistics for a store user"""
    try:
        # Verify the user is a store user
        if not current_user or 'email' not in current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        
        # Get the store user record
        store_user_response = supabase_client.table("store_user").select("*").eq("email", current_user["email"]).execute()
        
        if not store_user_response.data:
            raise HTTPException(status_code=404, detail="Store user not found")
        
        store_user = store_user_response.data[0]
        
        # Check if the store user is approved
        if store_user.get("status") != "accepted":
            raise HTTPException(status_code=403, detail="Store user account not approved")
        
        # Get the store owned by the user
        store_id = store_user.get("store_owned")
        
        # If no store is owned, return empty data but include store_owned status
        if not store_id:
            return {
                "store_owned": None,
                "totalProducts": 0,
                "totalCategories": 0,
                "productViews": 0,
                "totalReviews": 0,
                "averageRating": 0,
                "topProducts": [],
                "recentOrders": []
            }
        
        # Fetch products for this store
        products_response = supabase_client.table("products").select("*").eq("store_id", store_id).execute()
        products = products_response.data or []
        
        # Calculate total products
        total_products = len(products)
        
        # Calculate unique categories
        unique_categories = set()
        for product in products:
            if product.get("category"):
                unique_categories.add(product["category"])
        total_categories = len(unique_categories)
        
        # Calculate total product views
        product_views = sum([p.get("views", 0) for p in products]) if products else 0
        
        # Fetch reviews for this store's products
        product_ids = [p.get("id") for p in products if p.get("id")]
        total_reviews = 0
        avg_rating = 0
        
        if product_ids:
            reviews_response = supabase_client.table("reviews").select("*").in_("product_id", product_ids).execute()
            reviews = reviews_response.data or []
            total_reviews = len(reviews)
            
            if total_reviews > 0:
                ratings = [r.get("rating", 0) for r in reviews]
                avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0
        
        # Get top products (by views or sales)
        top_products = []
        if products:
            # Sort products by views (descending)
            sorted_products = sorted(products, key=lambda p: p.get("views", 0), reverse=True)
            top_products = sorted_products[:5]  # Get top 5 products
            
            # Format top products for frontend
            top_products = [
                {
                    "id": p.get("id"),
                    "name": p.get("name", "Unknown Product"),
                    "category": p.get("category", "Uncategorized"),
                    "sales": p.get("sales_count", 0),
                    "growth": 0,  # Placeholder for growth percentage
                    "price": p.get("price", 0)
                } for p in top_products
            ]
        
        # Get recent orders (placeholder - would be implemented with actual orders table)
        recent_orders = []
        
        # Get store details
        store_response = supabase_client.table("stores").select("*").eq("store_id", store_id).execute()
        store_details = store_response.data[0] if store_response.data else {}
        
        return {
            "store_owned": store_id,
            "store_details": store_details,
            "totalProducts": total_products,
            "totalCategories": total_categories,
            "productViews": product_views,
            "totalReviews": total_reviews,
            "averageRating": avg_rating,
            "topProducts": top_products,
            "recentOrders": recent_orders
        }
        
    except Exception as e:
        logger.exception(f"Error fetching store user stats: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")