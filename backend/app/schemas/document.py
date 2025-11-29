"""
Document Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.document import DocumentType, DocumentStatus


class DocumentUploadResponse(BaseModel):
    id: UUID
    document_type: DocumentType
    file_name: str
    file_path: str
    file_size: int
    status: DocumentStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentResponse(DocumentUploadResponse):
    ocr_data: Optional[Dict[str, Any]] = None
    ocr_confidence: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(None, alias="meta_data")
    updated_at: datetime
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both meta_data and metadata


class OCRResult(BaseModel):
    extracted_fields: Dict[str, Any]
    confidence: float
    raw_text: Optional[str] = None

