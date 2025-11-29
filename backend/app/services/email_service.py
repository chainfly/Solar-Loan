import logging
from typing import List, Optional
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.core.config import settings
from itsdangerous import URLSafeTimedSerializer

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=settings.SMTP_USER,
            MAIL_PASSWORD=settings.SMTP_PASSWORD,
            MAIL_FROM=settings.SMTP_FROM_EMAIL,
            MAIL_PORT=settings.SMTP_PORT,
            MAIL_SERVER=settings.SMTP_HOST,
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )
        self.fastmail = FastMail(self.conf)
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY_JWT)

    def generate_verification_token(self, email: str) -> str:
        """Generate a timed verification token"""
        return self.serializer.dumps(email, salt='email-confirm')

    def verify_token(self, token: str, max_age: int = 3600) -> Optional[str]:
        """Verify the token and return the email if valid"""
        try:
            email = self.serializer.loads(token, salt='email-confirm', max_age=max_age)
            return email
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            return None

    async def send_verification_email(self, email: EmailStr, token: str):
        """Send verification email with link"""
        verification_link = f"http://localhost:8000/api/auth/verify-link?token={token}"
        
        html = f"""
        <p>Hi,</p>
        <p>Click the link below to verify your email address:</p>
        <p><a href="{verification_link}">{verification_link}</a></p>
        <p>If you did not sign up, please ignore this email.</p>
        """

        message = MessageSchema(
            subject="Verify your email",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        try:
            await self.fastmail.send_message(message)
            logger.info(f"Verification email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            # Don't raise error to avoid blocking registration if email fails

    async def send_reset_password_email(self, email: EmailStr, token: str):
        """Send password reset email with link"""
        reset_link = f"http://localhost:8080/auth/reset-password?token={token}"
        
        html = f"""
        <p>Hi,</p>
        <p>You requested to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        """

        message = MessageSchema(
            subject="Reset Your Password",
            recipients=[email],
            body=html,
            subtype=MessageType.html
        )

        try:
            await self.fastmail.send_message(message)
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
            raise ValueError("Failed to send password reset email")
