"""
Document Service
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.document import Document, DocumentType, DocumentStatus
from app.core.s3_client import get_s3_client
from app.core.config import settings
from fastapi import UploadFile
from uuid import UUID
import uuid
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class DocumentService:
    """Document upload and management service"""
    
    @staticmethod
    async def upload_document(
        db: AsyncSession,
        user_id: UUID,
        file: UploadFile,
        document_type: DocumentType,
        loan_application_id: UUID = None,
    ) -> Document:
        """Upload document to S3 and create record"""
        # Validate file type
        allowed_types = {
            DocumentType.AADHAAR: ["image/jpeg", "image/png", "application/pdf"],
            DocumentType.PAN: ["image/jpeg", "image/png", "application/pdf"],
            DocumentType.BANK_STATEMENT: ["application/pdf", "image/jpeg", "image/png"],
            DocumentType.INCOME_PROOF: ["application/pdf", "image/jpeg", "image/png"],
            DocumentType.ADDRESS_PROOF: ["application/pdf", "image/jpeg", "image/png"],
            DocumentType.ROOF_PHOTO: ["image/jpeg", "image/png"],
        }
        
        if file.content_type not in allowed_types.get(document_type, []):
            raise ValueError(f"Invalid file type for {document_type.value}")
        
        # Read file
        file_content = await file.read()
        file_size = len(file_content)
        
        # Generate S3 key
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        s3_key = f"documents/{user_id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload to S3
        s3_client = get_s3_client()
        s3_client.put_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
            Body=file_content,
            ContentType=file.content_type,
        )
        
        # Create document record
        document = Document(
            user_id=user_id,
            loan_application_id=loan_application_id,
            document_type=document_type,
            file_name=file.filename,
            file_path=s3_key,
            file_size=file_size,
            mime_type=file.content_type,
            status=DocumentStatus.UPLOADED,
        )
        db.add(document)
        await db.commit()
        await db.refresh(document)
        
        return document
    
    @staticmethod
    async def get_document(db: AsyncSession, document_id: UUID, user_id: UUID) -> Document:
        """Get document by ID"""
        result = await db.execute(
            select(Document).where(
                Document.id == document_id,
                Document.user_id == user_id,
            )
        )
        document = result.scalar_one_or_none()
        if not document:
            raise ValueError("Document not found")
        return document
    
    @staticmethod
    async def process_ocr(db: AsyncSession, document_id: UUID, user_id: UUID) -> dict:
        """Process OCR on document"""
        document = await DocumentService.get_document(db, document_id, user_id)
        
        # Update status
        document.status = DocumentStatus.PROCESSING
        await db.commit()
        
        try:
            # In production, use actual OCR service (Tesseract, AWS Textract, etc.)
            # For now, return mock data
            ocr_data = {
                "text": "MOCK EXTRACTED TEXT",
                "fields": {
                    "name": "MOCK USER",
                    "dob": "1990-01-01",
                    "address": "MOCK ADDRESS",
                },
            }
            
            document.ocr_data = json.dumps(ocr_data)
            document.ocr_confidence = "85.5"
            document.status = DocumentStatus.VERIFIED
            await db.commit()
            
            return {
                "extracted_fields": ocr_data["fields"],
                "confidence": 85.5,
                "raw_text": ocr_data["text"],
            }
        except Exception as e:
            logger.error(f"OCR processing failed: {e}")
            document.status = DocumentStatus.REJECTED
            await db.commit()
            raise ValueError(f"OCR processing failed: {e}")

