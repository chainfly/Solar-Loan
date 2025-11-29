"""
S3/MinIO Client Configuration
"""
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

s3_client = None


def init_s3():
    """Initialize S3/MinIO client"""
    global s3_client
    try:
        config = Config(
            signature_version='s3v4',
            retries={'max_attempts': 3, 'mode': 'standard'}
        )
        
        if settings.USE_MINIO:
            s3_client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT_URL,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                config=config,
                region_name=settings.S3_REGION,
            )
        else:
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                config=config,
                region_name=settings.S3_REGION,
            )
        
        # Create bucket if it doesn't exist
        try:
            s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        except ClientError:
            s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
            logger.info(f"Created S3 bucket: {settings.S3_BUCKET_NAME}")
        
        logger.info("S3/MinIO client initialized")
    except Exception as e:
        logger.error(f"S3/MinIO initialization failed: {e}")
        raise


def get_s3_client():
    """Get S3 client"""
    return s3_client

