"""
Security Utilities
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from app.core.config import settings
import hashlib
import hmac
import base64
import re

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encryption
fernet_key = settings.FERNET_KEY.encode()
if len(fernet_key) != 32:
    # Generate a key if not provided correctly
    fernet_key = Fernet.generate_key()
fernet = Fernet(base64.urlsafe_b64encode(fernet_key[:32].ljust(32, b'0')))


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY_JWT, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY_JWT, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY_JWT, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data using Fernet"""
    return fernet.encrypt(data.encode()).decode()


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data"""
    return fernet.decrypt(encrypted_data.encode()).decode()


def mask_pii(data: str, mask_char: str = "*") -> str:
    """Mask PII in logs"""
    # Mask email
    data = re.sub(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', 
                  lambda m: m.group(1)[:2] + mask_char * (len(m.group(1)) - 2) + '@' + mask_char * len(m.group(2)), 
                  data)
    # Mask phone (10 digits)
    data = re.sub(r'(\d{2})\d{6}(\d{2})', r'\1' + mask_char * 6 + r'\2', data)
    # Mask PAN (A-Z5 digits A-Z)
    data = re.sub(r'([A-Z]{3})[A-Z0-9]{2}([A-Z]{1})(\d{4})', r'\1' + mask_char * 2 + r'\2' + mask_char * 4, data)
    # Mask Aadhaar (12 digits)
    data = re.sub(r'(\d{4})\d{4}(\d{4})', r'\1' + mask_char * 4 + r'\2', data)
    return data


def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """Verify webhook signature using HMAC"""
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected_signature, signature)

