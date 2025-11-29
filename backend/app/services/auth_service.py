"""
Authentication Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.redis_client import get_redis
from app.schemas.auth import UserRegister, UserLogin
from datetime import datetime, timedelta
import uuid
import random
import logging
from app.services.decentro_service import DecentroService
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication service"""
    
    @staticmethod
    async def register(db: AsyncSession, user_data: UserRegister) -> User:
        """Register a new user"""
        # Check if user exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Create user
        user = User(
            email=user_data.email,
            hashed_password=hash_password(user_data.password),
            full_name=user_data.full_name,
            phone=user_data.phone,
            is_active=True,
            is_verified=False,
            verification_token=otp,  # Store OTP as verification token
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Store OTP in Redis (expires in 10 minutes)
        redis = await get_redis()
        await redis.setex(
            f"email_verification:{user.email}",
            600,  # 10 minutes
            otp
        )
        
        # Send verification email with OTP via Decentro
        try:
            decentro = DecentroService()
            await decentro.send_email(
                email=user.email,
                subject="Verify Your ChainFly Account",
                body=f"Your verification code is: {otp}"
            )
        except Exception as e:
            logger.error(f"Failed to send Decentro verification email: {e}")

        # Send verification link via SMTP (Fallback/Alternative)
        try:
            email_service = EmailService()
            token = email_service.generate_verification_token(user.email)
            await email_service.send_verification_email(user.email, token)
        except Exception as e:
            logger.error(f"Failed to send SMTP verification email: {e}")
        
        logger.info(f"User registered: {user.email} (OTP: {otp})")
        
        return user
    
    @staticmethod
    async def verify_email_token(db: AsyncSession, token: str) -> User:
        """Verify email with token"""
        email_service = EmailService()
        email = email_service.verify_token(token)
        
        if not email:
            raise ValueError("Invalid or expired verification link")
        
        # Get user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")
        
        if user.is_verified:
            return user
        
        # Verify user
        user.is_verified = True
        user.verification_token = None
        await db.commit()
        await db.refresh(user)
        
        # Delete OTP from Redis if exists
        redis = await get_redis()
        await redis.delete(f"email_verification:{email}")
        
        return user

    @staticmethod
    async def verify_email(db: AsyncSession, email: str, otp: str) -> User:
        """Verify email with OTP"""
        # Check OTP in Redis
        redis = await get_redis()
        stored_otp = await redis.get(f"email_verification:{email}")
        
        if not stored_otp or stored_otp != otp:
            raise ValueError("Invalid or expired verification code")
        
        # Get user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError("User not found")
        
        if user.is_verified:
            raise ValueError("Email already verified")
        
        # Verify user
        user.is_verified = True
        user.verification_token = None
        await db.commit()
        await db.refresh(user)
        
        # Delete OTP from Redis
        await redis.delete(f"email_verification:{email}")
        
        return user
    
    @staticmethod
    async def resend_verification_code(db: AsyncSession, email: str):
        """Resend verification code"""
        # Get user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if user exists
            return
        
        if user.is_verified:
            raise ValueError("Email already verified")
        
        # Generate new 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Update verification token
        user.verification_token = otp
        await db.commit()
        
        # Store OTP in Redis (expires in 10 minutes)
        redis = await get_redis()
        await redis.setex(
            f"email_verification:{email}",
            600,  # 10 minutes
            otp
        )
        
        # Send verification email with OTP via Decentro
        try:
            decentro = DecentroService()
            await decentro.send_email(
                email=user.email,
                subject="Your New Verification Code",
                body=f"Your new verification code is: {otp}"
            )
        except Exception as e:
            logger.error(f"Failed to send Decentro verification email: {e}")

        # Send verification link via SMTP
        try:
            email_service = EmailService()
            token = email_service.generate_verification_token(user.email)
            await email_service.send_verification_email(user.email, token)
        except Exception as e:
            logger.error(f"Failed to send SMTP verification email: {e}")

        logger.info(f"Resent verification code for {email} (OTP: {otp})")
    
    @staticmethod
    async def login(db: AsyncSession, login_data: UserLogin) -> tuple[User, str, str]:
        """Login user and return tokens"""
        # Find user
        result = await db.execute(select(User).where(User.email == login_data.email))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            raise ValueError("Invalid email or password")
        
        if not user.is_active:
            raise ValueError("User account is inactive")
        
        # Update last login
        user.last_login = datetime.utcnow()
        await db.commit()
        
        # Create tokens
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Store refresh token in Redis
        redis = await get_redis()
        await redis.setex(
            f"refresh_token:{user.id}",
            int(timedelta(days=7).total_seconds()),
            refresh_token
        )
        
        return user, access_token, refresh_token
    
    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
        """Refresh access token"""
        # Decode token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload")
        
        # Verify token in Redis
        redis = await get_redis()
        stored_token = await redis.get(f"refresh_token:{user_id}")
        if stored_token != refresh_token:
            raise ValueError("Refresh token not found or expired")
        
        # Get user
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        
        # Create new tokens
        access_token = create_access_token({"sub": str(user.id), "email": user.email})
        new_refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Update Redis
        await redis.setex(
            f"refresh_token:{user.id}",
            int(timedelta(days=7).total_seconds()),
            new_refresh_token
        )
        
        return access_token, new_refresh_token
    
    @staticmethod
    async def logout(user_id: str):
        """Logout user by revoking refresh token"""
        redis = await get_redis()
        await redis.delete(f"refresh_token:{user_id}")
    
    @staticmethod
    async def forgot_password(db: AsyncSession, email: str):
        """Generate password reset token"""
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            # Don't reveal if user exists
            return
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        await db.commit()
        
        # Send reset email
        try:
            email_service = EmailService()
            await email_service.send_reset_password_email(user.email, reset_token)
        except Exception as e:
            logger.error(f"Failed to send reset email: {e}")
            # We don't raise here to prevent user enumeration, but in a real app we might handle this differently
            
        logger.info(f"Password reset token generated for {email}")
    
    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str) -> User:
        """Reset password using token"""
        result = await db.execute(
            select(User).where(
                User.reset_token == token,
                User.reset_token_expires > datetime.utcnow()
            )
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise ValueError("Invalid or expired reset token")
        
        # Update password
        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        await db.commit()
        await db.refresh(user)
        
        return user
    
    @staticmethod
    async def get_current_user(db: AsyncSession, user_id: str) -> User:
        """Get current user by ID"""
        result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user or not user.is_active:
            raise ValueError("User not found or inactive")
        return user

