# app/schemas/dashboard.py
from pydantic import BaseModel

class DashboardStats(BaseModel):
    totalProducts: int
    totalCategories: int
    activeLocations: int
    totalReviews: int
    averageRating: float