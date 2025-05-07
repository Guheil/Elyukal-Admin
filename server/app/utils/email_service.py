from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
import os
from app.config import EMAIL_USERNAME, EMAIL_FROM, EMAILER_PASSWORD, CLIENT_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Use the email password from config
EMAIL_PASSWORD = EMAILER_PASSWORD

# Log email configuration (without showing the actual password)
logger.info(f"Email configuration: USERNAME={EMAIL_USERNAME}, FROM={EMAIL_FROM}, PASSWORD_SET={'Yes' if EMAIL_PASSWORD else 'No'}")

# Check if templates directory exists
templates_dir = Path(__file__).parent.parent / "templates"
if not templates_dir.exists():
    logger.error(f"Templates directory not found: {templates_dir}")
    # Create the directory if it doesn't exist
    templates_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created templates directory: {templates_dir}")

# Configure FastMail for Gmail
conf = ConnectionConfig(
    MAIL_USERNAME=EMAIL_USERNAME,
    MAIL_PASSWORD=EMAIL_PASSWORD,
    MAIL_FROM=EMAIL_FROM,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=templates_dir
)

# Log configuration details (without password)
logger.info(f"Mail configuration: SERVER=smtp.gmail.com, PORT=587, USERNAME={EMAIL_USERNAME}, FROM={EMAIL_FROM}")
logger.info(f"Templates folder: {templates_dir}")
logger.info(f"Templates exist: {templates_dir.exists()}")

# List template files
if templates_dir.exists():
    template_files = list(templates_dir.glob("*.html"))
    logger.info(f"Template files found: {[f.name for f in template_files]}")

# Initialize FastMail
fastmail = FastMail(conf)

async def send_email(
    recipients: List[EmailStr],
    subject: str,
    body: str,
    template_name: Optional[str] = None,
    template_body: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Send an email to the specified recipients.

    Args:
        recipients: List of email addresses to send to
        subject: Email subject
        body: Plain text email body (used if template_name is None)
        template_name: Optional name of the HTML template to use
        template_body: Optional dictionary of variables to pass to the template

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        logger.info(f"Attempting to send email to: {', '.join(recipients)}")
        logger.info(f"Subject: {subject}")

        if template_name and template_body:
            # Check if template file exists
            template_path = templates_dir / template_name
            if not template_path.exists():
                logger.error(f"Template file not found: {template_path}")
                return False

            logger.info(f"Using template: {template_name}")
            logger.info(f"Template variables: {template_body}")

            # Send email using HTML template
            message = MessageSchema(
                subject=subject,
                recipients=recipients,
                template_body=template_body,
                subtype="html"
            )
            await fastmail.send_message(message, template_name=template_name)
        else:
            # Send plain text email
            logger.info("Sending plain text email")
            message = MessageSchema(
                subject=subject,
                recipients=recipients,
                body=body,
                subtype="plain"
            )
            await fastmail.send_message(message)

        logger.info(f"Email sent successfully to {', '.join(recipients)}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        # Print more detailed error information
        import traceback
        logger.error(f"Error details: {traceback.format_exc()}")
        return False

async def send_seller_application_status_email(
    email: EmailStr,
    first_name: str,
    last_name: str,
    status: str
) -> bool:
    """
    Send an email notification about seller application status change.

    Args:
        email: Recipient email address
        first_name: Seller's first name
        last_name: Seller's last name
        status: New application status ('accepted' or 'rejected')

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        logger.info(f"Preparing to send application status email to {email}")
        logger.info(f"Application status: {status}")
        logger.info(f"Recipient: {first_name} {last_name} <{email}>")

        # Validate email address
        if not email or '@' not in email:
            logger.error(f"Invalid email address: {email}")
            return False

        # Prepare email content based on status
        if status == 'accepted':
            subject = "Congratulations! Your Seller Application has been Approved"
            template_name = "seller_application_accepted.html"
        else:
            subject = "Update on Your Seller Application"
            template_name = "seller_application_rejected.html"

        logger.info(f"Selected template: {template_name}")

        # Prepare template variables
        template_body = {
            "first_name": first_name,
            "last_name": last_name,
            "status": status,
            "app_url": CLIENT_URL
        }

        logger.info(f"Client URL for email: {CLIENT_URL}")

        # Create a fallback plain text message in case template fails
        plain_text_body = f"""
Dear {first_name} {last_name},

Your seller application for Produkto Elyu-Kal has been {status}.

{'Congratulations! You can now log in to your seller dashboard and start setting up your store.' if status == 'accepted' else 'We appreciate your interest and hope to welcome you as a seller in the future.'}

Best regards,
The Produkto Elyu-Kal Team
        """

        # Try to send with template first
        template_result = await send_email(
            recipients=[email],
            subject=subject,
            body="",  # Not used when template is provided
            template_name=template_name,
            template_body=template_body
        )

        # If template email fails, try plain text as fallback
        if not template_result:
            logger.warning("Template email failed, trying plain text fallback")
            return await send_email(
                recipients=[email],
                subject=subject,
                body=plain_text_body,
                template_name=None,
                template_body=None
            )

        return template_result
    except Exception as e:
        logger.error(f"Failed to send seller application status email: {str(e)}")
        import traceback
        logger.error(f"Error details: {traceback.format_exc()}")
        return False
