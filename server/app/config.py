# Server configuration
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define server IP address - should match the client config
SERVER_IP = "192.168.100.5"

# API URL configuration
API_URL = os.getenv("API_URL", f"http://{SERVER_IP}:8000")

# Client URL for CORS configuration
CLIENT_URL = os.getenv("CLIENT_URL", f"http://{SERVER_IP}:3000")

# Email configuration
# Remove spaces from the app password - Gmail app passwords should not have spaces
raw_password = os.getenv("EMAILER_PASSWORD", "dndkiunjltcnbfov")
EMAILER_PASSWORD = raw_password.replace(" ", "")  # Remove any spaces from the password
EMAIL_USERNAME = "produktoelyukalph@gmail.com"  # Gmail account
EMAIL_FROM = EMAIL_USERNAME

# Log email configuration (without showing the actual password)
print(f"Email configuration loaded: USERNAME={EMAIL_USERNAME}, PASSWORD_SET={'Yes' if EMAILER_PASSWORD else 'No'}")