from fastapi import APIRouter, HTTPException, Form, File, UploadFile, Depends
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from app.db.database import supabase_client
from app.auth.auth_handler import get_current_user
import bcrypt
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User"])

# Pydantic model for SellerApplication
class SellerApplication(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str
    phone_number: Optional[str] = None
    status: str = "pending"  # Default to 'pending'

    @validator('status')
    def validate_status(cls, v):
        allowed_values = ['pending', 'accepted', 'rejected']
        if v.lower() not in allowed_values:
            raise ValueError(f'Status must be one of: {", ".join(allowed_values)}')
        return v.lower()

# Pydantic model for status update request
class StatusUpdate(BaseModel):
    status: str

    @validator('status')
    def validate_status(cls, v):
        allowed_values = ['accepted', 'rejected', 'pending']
        if v.lower() not in allowed_values:
            raise ValueError(f'Status must be one of: {", ".join(allowed_values)}')
        return v.lower()

@router.post("/seller-application")
async def submit_seller_application(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    phone_number: Optional[str] = Form(None),
    status: str = Form("pending"),  # Default to 'pending'
    business_permit: UploadFile = File(...),
    valid_id: UploadFile = File(...),
    dti_registration: Optional[UploadFile] = File(None)
):
    """
    Submit a seller application.
    Handles form data and file uploads, storing them in Supabase and inserting a record into the store_user table.
    """
    try:
        # Validate form data using Pydantic schema
        application_data = SellerApplication(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            phone_number=phone_number,
            status=status
        )

        # Validate file types and sizes (max 5MB)
        max_size_bytes = 5 * 1024 * 1024
        for file in [business_permit, valid_id, dti_registration]:
            if file:
                if file.size > max_size_bytes:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 5MB limit")
                if not file.content_type.startswith("image/"):
                    raise HTTPException(status_code=400, detail=f"File {file.filename} must be an image (JPEG or PNG)")

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Upload files to Supabase Storage
        async def upload_file(file: UploadFile, bucket: str) -> str:
            try:
                # Create a folder name based on the applicant's name
                folder_name = f"{application_data.first_name.lower()}_{application_data.last_name.lower()}"
                file_extension = file.filename.split('.')[-1].lower()
                file_name = file.filename.split('/')[-1].split('\\')[-1]  # Get filename without path
                file_name = file_name.split('.')[0]  # Remove extension
                
                # Create path: bucket/applicant_name/file_type.extension
                file_path = f"{folder_name}/{file_name}.{file_extension}"
                file_content = await file.read()
                
                # Upload file
                supabase_client.storage.from_(bucket).upload(
                    file_path,
                    file_content,
                    file_options={"content-type": file.content_type}
                )
                
                # Return the file path
                logger.info(f"Uploaded file to {bucket}/{file_path}")
                return file_path
                
            except Exception as e:
                logger.error(f"Failed to upload file to {bucket}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

        business_permit_path = await upload_file(business_permit, "permits")
        valid_id_path = await upload_file(valid_id, "valid-ids")
        dti_registration_path = await upload_file(dti_registration, "dti") if dti_registration else None

        # Insert into store_user table
        user_data = {
            "first_name": application_data.first_name,
            "last_name": application_data.last_name,
            "email": application_data.email,
            "hashed_password": hashed_password,
            "phone_number": application_data.phone_number,
            "business_permit": business_permit_path,
            "valid_id": valid_id_path,
            "dti_registration": dti_registration_path,
            "store_owned": None,  # Nullable foreign key to stores.store_id
            "status": application_data.status  # Use validated status
        }

        response = supabase_client.table("store_user").insert(user_data).execute()
        if not response.data:
            logger.error("Failed to insert store_user data")
            raise HTTPException(status_code=500, detail="Failed to insert user data")

        logger.info(f"Submitted seller application for {application_data.email}")
        return {"message": "Application submitted successfully", "status": application_data.status}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Error submitting seller application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/seller-applications")
async def get_seller_applications():
    """Get all seller applications."""
    try:
        response = supabase_client.table("store_user").select(
            "id, first_name, last_name, email, phone_number, status, created_at, "
            "business_permit, valid_id, dti_registration, store_owned"
        ).execute()
        if not response.data:
            return []
        
        # Add public URLs for file fields
        for application in response.data:
            if application.get('business_permit'):
                application['business_permit'] = supabase_client.storage.from_("permits").get_public_url(application['business_permit'])
            if application.get('valid_id'):
                application['valid_id'] = supabase_client.storage.from_("valid-ids").get_public_url(application['valid_id'])
            if application.get('dti_registration'):
                application['dti_registration'] = supabase_client.storage.from_("dti").get_public_url(application['dti_registration'])
        
        return response.data
    except Exception as e:
        logger.exception(f"Error fetching seller applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seller-applications/{application_id}")
async def get_seller_application(application_id: str):
    """Get a specific seller application."""
    try:
        response = supabase_client.table("store_user").select(
            "id, first_name, last_name, email, phone_number, status, created_at, "
            "business_permit, valid_id, dti_registration, store_owned"
        ).eq("id", application_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Get public URLs for documents
        data = response.data
        if data.get('business_permit'):
            data['business_permit'] = supabase_client.storage.from_("permits").get_public_url(data['business_permit'])
        if data.get('valid_id'):
            data['valid_id'] = supabase_client.storage.from_("valid-ids").get_public_url(data['valid_id'])
        if data.get('dti_registration'):
            data['dti_registration'] = supabase_client.storage.from_("dti").get_public_url(data['dti_registration'])
        
        return data
    except Exception as e:
        logger.exception(f"Error fetching seller application: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/seller-applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: StatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the status of a seller application.
    Optionally creates a store if status is 'accepted'.
    """
    try:
        # Validate status
        status = status_update.status.lower()
        
        # Check if application exists and current status
        check_response = supabase_client.table("store_user").select("*").eq("id", application_id).execute()
        if not check_response.data:
            raise HTTPException(status_code=404, detail="Application not found")

        current_status = check_response.data[0].get('status', '').lower()
        if current_status == status:
            return check_response.data[0]  # No change needed
        
        if current_status != 'pending':
            raise HTTPException(
                status_code=400,
                detail=f"Cannot update status. Application is already {current_status}"
            )

        # Handle status update
        update_data = {"status": status, "store_owned": None}
        
        if status == "accepted":
            # Create a new store
            store_data = {
                "store_name": f"{check_response.data[0]['first_name']}'s Store",
                # Add other store fields as needed
            }
            store_response = supabase_client.table("stores").insert(store_data).execute()
            if not store_response.data:
                raise HTTPException(status_code=500, detail="Failed to create store")
            
            update_data["store_owned"] = store_response.data[0]["store_id"]

        # Update store_user
        response = supabase_client.table("store_user").update(update_data).eq("id", application_id).execute()
        
        if not response.data:
            logger.error(f"Failed to update status for application {application_id}")
            raise HTTPException(status_code=500, detail="Failed to update application status")
            
        logger.info(f"Successfully updated application {application_id} status to {status}")
        return response.data[0]
        
    except Exception as e:
        logger.exception(f"Error updating application status: {str(e)}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))