"""
Authentication Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import HTMLResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user
from app.services.auth_service import AuthService
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    UserResponse,
    UserMe,
    VerifyEmailRequest,
    ResendVerificationRequest,
)
from app.models.user import User
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user"""
    try:
        user = await AuthService.register(db, user_data)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    login_data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login user"""
    try:
        user, access_token, refresh_token = await AuthService.login(db, login_data)
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token"""
    try:
        access_token, refresh_token = await AuthService.refresh_token(
            db, refresh_data.refresh_token
        )
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
):
    """Logout user"""
    await AuthService.logout(str(current_user.id))
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(
    request: Request,
    forgot_data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset"""
    await AuthService.forgot_password(db, forgot_data.email)
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password", response_model=UserResponse)
async def reset_password(
    reset_data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
):
    """Reset password"""
    try:
        user = await AuthService.reset_password(db, reset_data.token, reset_data.new_password)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/verify-email", response_model=UserResponse)
async def verify_email(
    verify_data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verify email with OTP"""
    try:
        user = await AuthService.verify_email(db, verify_data.email, verify_data.otp)
        return UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/verify-link", response_class=HTMLResponse)
async def verify_email_link(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify email with link"""
    try:
        await AuthService.verify_email_token(db, token)
        return """
        <html>
            <head>
                <title>Email Verified</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                    .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    h1 { color: #10b981; }
                    p { color: #6b7280; }
                    a { display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; }
                    a:hover { background-color: #1d4ed8; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Email Verified!</h1>
                    <p>Your email has been successfully verified.</p>
                    <a href="http://localhost:8080/auth/login">Go to Login</a>
                </div>
            </body>
        </html>
        """
    except ValueError as e:
        return HTMLResponse(
            content=f"""
            <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body {{ font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }}
                        .container {{ text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
                        h1 {{ color: #ef4444; }}
                        p {{ color: #6b7280; }}
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Verification Failed</h1>
                        <p>{str(e)}</p>
                    </div>
                </body>
            </html>
            """,
            status_code=400
        )


@router.post("/resend-verification")
@limiter.limit("5/minute")
async def resend_verification(
    request: Request,
    resend_data: ResendVerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Resend verification code"""
    try:
        await AuthService.resend_verification_code(db, resend_data.email)
        return {"message": "Verification code sent to your email"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me", response_model=UserMe)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current user information"""
    return UserMe.model_validate(current_user)
