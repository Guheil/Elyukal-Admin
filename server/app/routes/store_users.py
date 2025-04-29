from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from pydantic import EmailStr
from typing import Optional
from app.schemas.store_user import SellerApplication
from app.db.database import supabase_client
import bcrypt
import logging
from uuid import uuid4

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Store User"])

@router.post("/seller-application")
async def submit_seller_application(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    phone_number: Optional[str] = Form(None),
    business_permit: UploadFile = File(...),
    valid_id: UploadFile = File(...),
    dti_registration: Optional[UploadFile] = File(None)
):
    """
    Submit a seller application.
    This endpoint handles form data and file uploads, storing them in Supabase and inserting a record into the store_user table.
    """
    try:
        # Validate form data using Pydantic schema
        application_data = SellerApplication(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password=password,
            phone_number=phone_number
        )

        # Validate file types and sizes (max 5MB)
        max_size_bytes = 5 * 1024 * 1024
        for file in [business_permit, valid_id, dti_registration]:
            if file:
                if file.size > max_size_bytes:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} exceeds 5MB limit")
                if file.content_type not in ["image/jpeg", "image/png", "application/pdf"]:
                    raise HTTPException(status_code=400, detail=f"File {file.filename} must be JPEG, PNG, or PDF")

        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Upload files to Supabase Storage
        async def upload_file(file: UploadFile, bucket: str) -> str:
            try:
                file_extension = file.filename.split('.')[-1].lower()
                file_path = f"{uuid4()}.{file_extension}"
                file_content = await file.read()
                
                # Upload the file
                supabase_client.storage.from_(bucket).upload(
                    file_path,
                    file_content,
                    file_options={"content-type": file.content_type}
                )
                
                # Get and return the public URL
                public_url = supabase_client.storage.from_(bucket).get_public_url(file_path)
                logger.info(f"Uploaded file to {bucket}/{file_path}")
                return file_path  # Return just the path, not the full URL
                
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
            # store_owned is null, status defaults to 'pending'
        }

        response = supabase_client.table("store_user").insert(user_data).execute()
        if not response.data:
            logger.error("Failed to insert store_user data")
            raise HTTPException(status_code=500, detail="Failed to insert user data")

        logger.info(f"Submitted seller application for {application_data.email}")
        return {"message": "Application submitted successfully", "status": "pending"}

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.exception(f"Error submitting seller application: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@router.get("/seller-applications")
async def get_seller_applications():
    """Get all seller applications"""
    try:
        response = supabase_client.table("store_user").select("*").execute()
        return response.data
    except Exception as e:
        logger.exception(f"Error fetching seller applications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seller-applications/{application_id}")
async def get_seller_application(application_id: str):
    """Get a specific seller application"""
    try:
        response = supabase_client.table("store_user").select(
            "id, first_name, last_name, email, phone_number, status, created_at, " +
            "business_permit, valid_id, dti_registration"  # Changed from *_url to match actual column names
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
async def update_application_status(application_id: str, status: str):
    """Update the status of a seller application"""
    try:
        if status not in ['approved', 'rejected']:
            raise HTTPException(status_code=400, detail="Invalid status")
            
        response = supabase_client.table("store_user").update(
            {"status": status}
        ).eq("id", application_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Application not found")
            
        return response.data[0]
    except Exception as e:
        logger.exception(f"Error updating application status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
