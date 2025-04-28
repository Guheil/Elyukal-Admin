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
            file_extension = file.filename.split('.')[-1]
            file_path = f"public/{application_data.email}-{uuid4()}.{file_extension}"
            file_content = await file.read()
            try:
                response = supabase_client.storage.from_(bucket).upload(file_path, file_content)
                # Check if upload was successful (response is not None and no error)
                if not response or hasattr(response, 'error') and response.error:
                    error_message = getattr(response, 'error', 'Unknown error')
                    logger.error(f"Failed to upload {file.filename} to {bucket}: {error_message}")
                    raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}")
                # Get the public URL for the uploaded file
                public_url = supabase_client.storage.from_(bucket).get_public_url(file_path)
                return public_url
            except Exception as e:
                logger.error(f"Exception during file upload to {bucket}: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to upload {file.filename}")

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