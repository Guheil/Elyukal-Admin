from typing import Optional, Union
from uuid import UUID
from pydantic import BaseModel

class Store(BaseModel):
    store_id: Union[UUID, str]  # Accept UUID or string
    name: str
    description: str
    latitude: float
    longitude: float
    rating: float
    store_image: Optional[str] = None  # Make it optional
    type: Optional[str] = None  # Make it optional as well based on previous error
    operating_hours: Optional[str] = None  # For highlights
    phone: Optional[str] = None           # For highlights