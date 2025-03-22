# app/routes/fetch_stores.py
from fastapi import APIRouter, HTTPException
from app.db.database import supabase_client
from app.schemas.stores import Store
from typing import List

router = APIRouter()

@router.get("/fetch_stores", response_model=List[Store])
async def fetch_stores():
    try:
        print("Attempting to connect to Supabase...")
        
        # Query updated to include only operating_hours and phone for highlights
        response = supabase_client.table("stores").select(
            "store_id, name, description, latitude, longitude, rating, store_image, type, operating_hours, phone"
        ).execute()
        
        print("Supabase Response:", response)
        
        if not response.data:
            print("No data found in response")
            raise HTTPException(status_code=404, detail="No stores found")
        
        return response.data
        
    except Exception as e:
        print(f"Error in fetch_stores: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")