from pydantic import BaseModel, EmailStr
from typing import Optional

class SellerApplication(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    status: str