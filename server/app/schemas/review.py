from pydantic import BaseModel
from typing import Optional

class ReviewCreate(BaseModel):
    product_id: int
    rating: int
    review_text: str

class ReviewResponse(BaseModel):
    id: int
    user_id: str
    product_id: int
    rating: int
    review_text: str
    created_at: str
    full_name: Optional[str] = None
    
    class Config:
        orm_mode = True