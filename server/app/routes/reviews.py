from fastapi import APIRouter, Depends, HTTPException
import logging
from app.db.database import supabase_client
from app.schemas.review import ReviewCreate, ReviewResponse
from app.auth.auth_handler import get_current_user
from typing import List

router = APIRouter(prefix="/reviews", tags=["Reviews"])
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__) 

# Submit a review (Registered users only)
@router.post("/")
async def create_review(review: ReviewCreate, user=Depends(get_current_user)):
    try:
        logger.debug(f"User: {user}")
        logger.debug(f"Review payload: {review.dict()}")

        response = (
            supabase_client.table("reviews")
            .insert(
                {
                    "user_id": user["id"],
                    "product_id": review.product_id,
                    "rating": review.rating,
                    "review_text": review.review_text,
                }
            )
            .execute()
        )
        logger.debug(f"Insert response: {response.data}")

        return {"message": "Review submitted successfully", "review": response.data[0] if response.data else response.data}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error in create_review: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/{product_id}", response_model=List[ReviewResponse])
async def get_reviews(product_id: int):
    response = (
        supabase_client.table("reviews")
        .select("*, users(first_name, last_name)")
        .eq("product_id", product_id)
        .execute()
    )

    if not response.data:
        return []

    # Combine first_name and last_name into full_name
    flattened_reviews = [
        {
            **review,
            "full_name": f"{review['users']['first_name']} {review['users']['last_name']}"
        }
        for review in response.data
    ]
    return flattened_reviews