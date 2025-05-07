import logging
from app.utils.simple_email_service import send_seller_application_status_email
from app.config import EMAIL_USERNAME, EMAIL_FROM, EMAILER_PASSWORD

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_email():
    """Test sending an email using the simple email service."""
    logger.info("Starting email test...")
    
    # Test email parameters
    test_email = "xgael.sanjuan@gmail.comc  "  # Use your own email for testing
    test_first_name = "Test"
    test_last_name = "User"
    test_status = "accepted"  # or "rejected"
    
    logger.info(f"Sending test email to: {test_email}")
    logger.info(f"Email configuration: USERNAME={EMAIL_USERNAME}, FROM={EMAIL_FROM}, PASSWORD_SET={'Yes' if EMAILER_PASSWORD else 'No'}")
    
    # Send the test email
    result = send_seller_application_status_email(
        email=test_email,
        first_name=test_first_name,
        last_name=test_last_name,
        status=test_status
    )
    
    if result:
        logger.info("Test email sent successfully!")
    else:
        logger.error("Failed to send test email.")

if __name__ == "__main__":
    test_email()
