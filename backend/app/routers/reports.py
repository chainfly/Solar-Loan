"""
Reports Router
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.loan import LoanApplication
from app.core.s3_client import get_s3_client
from app.core.config import settings
from uuid import UUID
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import io
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/{loan_id}/pdf")
async def generate_pdf_report(
    loan_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate PDF report for loan"""
    try:
        # Get loan
        result = await db.execute(
            select(LoanApplication).where(
                LoanApplication.id == loan_id,
                LoanApplication.user_id == current_user.id,
            )
        )
        loan = result.scalar_one_or_none()
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
        
        # Check cache in S3
        s3_client = get_s3_client()
        pdf_key = f"reports/{loan_id}/loan_report.pdf"
        
        try:
            # Try to get from cache
            pdf_obj = s3_client.get_object(Bucket=settings.S3_BUCKET_NAME, Key=pdf_key)
            pdf_content = pdf_obj['Body'].read()
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=loan_report_{loan_id}.pdf"},
            )
        except:
            # Generate PDF
            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Title
            p.setFont("Helvetica-Bold", 16)
            p.drawString(100, 750, "Solar Loan Application Report")
            
            # Loan Details
            p.setFont("Helvetica", 12)
            y = 700
            p.drawString(100, y, f"Loan ID: {loan_id}")
            y -= 20
            p.drawString(100, y, f"Applicant: {loan.full_name}")
            y -= 20
            p.drawString(100, y, f"Loan Amount: ₹{loan.loan_amount}")
            y -= 20
            p.drawString(100, y, f"Status: {loan.status.value}")
            y -= 20
            p.drawString(100, y, f"System Capacity: {loan.system_capacity_kw} kW")
            y -= 20
            if loan.emi_amount:
                p.drawString(100, y, f"EMI: ₹{loan.emi_amount}")
            y -= 20
            if loan.subsidy_amount:
                p.drawString(100, y, f"Subsidy: ₹{loan.subsidy_amount}")
            y -= 20
            if loan.ai_eligibility_score:
                p.drawString(100, y, f"Eligibility Score: {loan.ai_eligibility_score}%")
            
            p.save()
            pdf_content = buffer.getvalue()
            
            # Cache in S3
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=pdf_key,
                Body=pdf_content,
                ContentType="application/pdf",
            )
            
            return Response(
                content=pdf_content,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename=loan_report_{loan_id}.pdf"},
            )
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

