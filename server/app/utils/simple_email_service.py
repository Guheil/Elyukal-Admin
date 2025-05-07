import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from typing import List, Optional, Dict, Any
from app.config import EMAIL_USERNAME, EMAIL_FROM, EMAILER_PASSWORD, CLIENT_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Templates directory
templates_dir = Path(__file__).parent.parent / "templates"

def send_email(
    recipients: List[str],
    subject: str,
    body_text: str,
    body_html: Optional[str] = None
) -> bool:
    """
    Send an email using smtplib.

    Args:
        recipients: List of email addresses to send to
        subject: Email subject
        body_text: Plain text email body
        body_html: Optional HTML email body

    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    try:
        # Validate inputs
        if not recipients:
            logger.error("No recipients provided")
            return False

        logger.info(f"Attempting to send email to: {', '.join(recipients)}")
        logger.info(f"Subject: {subject}")
        logger.info(f"Using email credentials: {EMAIL_USERNAME}")

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = EMAIL_FROM
        msg['To'] = ", ".join(recipients)

        # Attach text part
        text_part = MIMEText(body_text, 'plain')
        msg.attach(text_part)

        # Attach HTML part if provided
        if body_html:
            html_part = MIMEText(body_html, 'html')
            msg.attach(html_part)

        # Connect to SMTP server
        logger.info("Connecting to SMTP server smtp.gmail.com:587...")

        # Use a direct approach with more debugging
        server = smtplib.SMTP('smtp.gmail.com', 587, timeout=30)
        server.set_debuglevel(1)  # Enable debug output

        logger.info("Starting TLS...")
        server.starttls()

        # Check if password is available
        if not EMAILER_PASSWORD:
            logger.error("Email password is empty or not set")
            return False

        # Login
        logger.info(f"Logging in as {EMAIL_USERNAME}...")
        server.login(EMAIL_USERNAME, EMAILER_PASSWORD)

        # Send email
        logger.info("Sending email...")
        server.sendmail(EMAIL_FROM, recipients, msg.as_string())

        # Close connection
        logger.info("Closing SMTP connection...")
        server.quit()

        logger.info(f"Email sent successfully to {', '.join(recipients)}")
        return True
    except smtplib.SMTPAuthenticationError as auth_error:
        logger.error(f"SMTP Authentication Error: {str(auth_error)}")
        logger.error("This is likely due to incorrect username/password or Google security settings")
        logger.error("Make sure you're using an App Password if 2FA is enabled on your Google account")
        return False
    except smtplib.SMTPException as smtp_error:
        logger.error(f"SMTP Error: {str(smtp_error)}")
        return False
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        import traceback
        logger.error(f"Error details: {traceback.format_exc()}")
        return False

def read_template_file(template_name: str) -> Optional[str]:
    """Read an HTML template file and return its contents."""
    try:
        template_path = templates_dir / template_name
        if not template_path.exists():
            logger.error(f"Template file not found: {template_path}")
            return None

        with open(template_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        logger.error(f"Error reading template file: {str(e)}")
        return None

def render_template(template_content: str, context: Dict[str, Any]) -> str:
    """Simple template rendering function."""
    result = template_content
    for key, value in context.items():
        result = result.replace(f"{{{{ {key} }}}}", str(value))
    return result

def send_seller_application_status_email(
    email: str,
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

        # Create a plain text version
        plain_text_body = f"""
Dear {first_name} {last_name},

Your seller application for Produkto Elyu-Kal has been {status}.

{'Congratulations! You can now log in to your seller dashboard and start setting up your store.' if status == 'accepted' else 'We appreciate your interest and hope to welcome you as a seller in the future.'}

Best regards,
The Produkto Elyu-Kal Team
        """

        # Try to load and render HTML template
        template_content = read_template_file(template_name)
        if template_content:
            # Prepare template variables
            context = {
                "first_name": first_name,
                "last_name": last_name,
                "status": status,
                "app_url": CLIENT_URL
            }

            # Render the template
            html_body = render_template(template_content, context)

            # Send email with HTML
            return send_email(
                recipients=[email],
                subject=subject,
                body_text=plain_text_body,
                body_html=html_body
            )
        else:
            # Fallback to plain text email
            logger.warning("HTML template not available, sending plain text email")
            return send_email(
                recipients=[email],
                subject=subject,
                body_text=plain_text_body
            )

    except Exception as e:
        logger.error(f"Failed to send seller application status email: {str(e)}")
        import traceback
        logger.error(f"Error details: {traceback.format_exc()}")
        return False
