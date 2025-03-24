from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ReviewCreate(BaseModel):
    product_id: int
    rating: int 
    review_text: str

class ReviewResponse(BaseModel):
    id: UUID  
    user_id: str
    product_id: int
    rating: float  
    review_text: str
    created_at: str
    full_name: Optional[str] = None
    
    class Config:
        from_attributes = True  