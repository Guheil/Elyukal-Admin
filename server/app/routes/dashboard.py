from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
import logging
from datetime import datetime, timedelta
import random  # For demo data generation
from app.routes.fetch_products import fetch_products  # Import the fetch_products function

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats():
    """Fetch dashboard statistics from the database"""
    try:
        # Fetch total products count using the fetch_products function
        try:
            products_response = await fetch_products()
            if products_response and "products" in products_response:
                total_products = len(products_response["products"])
            else:
                total_products = 0
            
            logger.info(f"Total products count from fetch_products: {total_products}")
        except Exception as e:
            logger.error(f"Error fetching products with fetch_products: {str(e)}")
            # Fallback to direct query if fetch_products fails
            products_response = supabase_client.table("products").select("id", count="exact").execute()
            if hasattr(products_response, 'count'):
                total_products = products_response.count if products_response.count is not None else 0
            elif hasattr(products_response, 'data') and isinstance(products_response.data, list):
                total_products = len(products_response.data)
            else:
                total_products = 0
        
        # Fetch total categories count
        categories_response = supabase_client.table("products").select("category").execute()
        unique_categories = set()
        for product in categories_response.data:
            if product.get("category"):
                unique_categories.add(product["category"])
        total_categories = len(unique_categories)
        
        # Fetch active locations (stores) count
        stores_response = supabase_client.table("stores").select("store_id", count="exact").execute()
        active_locations = stores_response.count if stores_response.count is not None else 0
        
        # Fetch total reviews count
        reviews_response = supabase_client.table("reviews").select("id", count="exact").execute()
        total_reviews = reviews_response.count if reviews_response.count is not None else 0
        
        # Calculate average product rating
        if total_reviews > 0:
            ratings_response = supabase_client.table("reviews").select("rating").execute()
            ratings = [r["rating"] for r in ratings_response.data]
            avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0
        else:
            avg_rating = 0
            
        # Fetch pending approval products count
        pending_approval_response = supabase_client.table("products").select("id", count="exact").eq("status", "pending").execute()
        logger.debug(f"Pending approval response: {pending_approval_response}")
        logger.debug(f"Pending approval response count attribute: {getattr(pending_approval_response, 'count', None)}")
        
        # Check if count is available directly or needs to be extracted differently
        if hasattr(pending_approval_response, 'count'):
            pending_approval = pending_approval_response.count if pending_approval_response.count is not None else 0
        elif hasattr(pending_approval_response, 'data') and isinstance(pending_approval_response.data, list):
            # If count is not available, use the length of the data array
            pending_approval = len(pending_approval_response.data)
        else:
            pending_approval = 0
        
        # Calculate product views (using a placeholder value for now)
        product_views = 1250  # This would typically come from an analytics service
        product_views_growth = 8.2  # Growth percentage for product views
        
        # Calculate order conversion rate (placeholder)
        order_conversion_rate = 5.8  # This would typically come from an analytics service
        conversion_rate_growth = 1.5  # Growth percentage for conversion rate
        
        # Calculate growth percentages for other metrics
        products_growth = 2.3  # Growth percentage for total products
        stock_growth = 3.7  # Growth percentage for stock availability
        users_growth = 5.2  # Growth percentage for active users
        
        # Get top products and recent orders
        top_products = await get_top_products()
        recent_orders = await get_recent_orders()
        
        # Fetch total admin users count
        try:
            from app.routes.fetch_users import get_total_number_of_admin_users
            admin_users_response = await get_total_number_of_admin_users()
            total_admin_users = admin_users_response.get("total_admin_users", 0)
        except Exception as e:
            logger.error(f"Error fetching admin users count: {str(e)}")
            total_admin_users = 0
        
        return {
            "totalProducts": total_products,
            "totalCategories": total_categories,
            "activeLocations": active_locations,
            "totalReviews": total_reviews,
            "averageRating": avg_rating,
            "productViews": product_views,
            "productViewsGrowth": product_views_growth,
            "orderConversionRate": order_conversion_rate,
            "conversionRateGrowth": conversion_rate_growth,
            "productsGrowth": products_growth,
            "stockGrowth": stock_growth,
            "usersGrowth": users_growth,
            "pendingApproval": pending_approval,
            "totalAdminUsers": total_admin_users,
            "topProducts": top_products,
            "recentOrders": recent_orders
        }
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

async def get_top_products(limit=5):
    """Fetch top selling products from the database"""
    try:
        # Fetch products with their view/sales data
        # In a real application, you would join with sales or analytics tables
        products_response = supabase_client.table("products").select("id,name,category").limit(limit).execute()
        
        top_products = []
        for product in products_response.data:
            # Generate random sales and growth data for demo purposes
            # In a real app, this would come from actual sales/analytics data
            sales = random.randint(100, 1000)
            growth = round(random.uniform(-15.0, 20.0), 1)
            
            top_products.append({
                "id": product["id"],
                "name": product["name"],
                "category": product["category"],
                "sales": sales,
                "growth": growth
            })
        
        # Sort by sales (descending)
        top_products.sort(key=lambda x: x["sales"], reverse=True)
        
        return top_products[:limit]
    except Exception as e:
        logger.error(f"Error fetching top products: {str(e)}")
        # Return empty list in case of error
        return []

async def get_recent_orders(limit=5):
    """Fetch recent orders from the database"""
    try:
        # In a real application, you would fetch from an orders table
        # For demo purposes, we'll generate some sample data based on actual products
        
        # Get some real product names
        products_response = supabase_client.table("products").select("id,name").limit(limit).execute()
        
        recent_orders = []
        statuses = ["Completed", "Processing", "Pending"]
        
        for i, product in enumerate(products_response.data):
            # Generate a random date within the last 30 days
            days_ago = random.randint(0, 30)
            date = (datetime.now() - timedelta(days=days_ago)).strftime("%b %d, %Y")
            
            # Generate a random customer name
            customers = ["Ana Mercado", "Juan Dela Cruz", "Maria Santos", "Pedro Reyes", "Sofia Garcia"]
            
            recent_orders.append({
                "id": f"ORD-{random.randint(1000, 9999)}",
                "product": product["name"],
                "customer": random.choice(customers),
                "date": date,
                "status": random.choice(statuses)
            })
        
        # Sort by date (most recent first)
        # In a real app, you would sort by actual timestamp
        return recent_orders
    except Exception as e:
        logger.error(f"Error fetching recent orders: {str(e)}")
        # Return empty list in case of error
        return []