# app/routes/dashboard_stats.py
from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client

router = APIRouter()

@router.get("/get_total_number_of_categories")
async def get_total_number_of_categories():
    try:
        # Query all products to get their categories
        response = supabase_client.table("products").select("category").execute()
        
        # Extract unique categories
        unique_categories = set()
        for product in response.data:
            if product.get("category"):
                unique_categories.add(product["category"])
        
        # Return the count of unique categories
        return {"total_categories": len(unique_categories)}
    
    except Exception as e:
        print(f"Error getting total categories count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/get_total_number_of_stores")
async def get_total_number_of_stores():
    try:
        # Query the total count of stores
        response = supabase_client.table("stores").select("store_id", count="exact").execute()
        
        # The count is returned in the response count property
        total_stores = response.count
        
        if total_stores is None:
            # Fallback if count property is not available
            total_stores = len(response.data)
        
        return {"total_stores": total_stores}
    
    except Exception as e:
        print(f"Error getting total stores count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/get_total_number_of_reviews")
async def get_total_number_of_reviews():
    try:
        # Query the total count of reviews
        response = supabase_client.table("reviews").select("id", count="exact").execute()
        
        # The count is returned in the response count property
        total_reviews = response.count
        
        if total_reviews is None:
            # Fallback if count property is not available
            total_reviews = len(response.data)
        
        return {"total_reviews": total_reviews}
    
    except Exception as e:
        print(f"Error getting total reviews count: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")