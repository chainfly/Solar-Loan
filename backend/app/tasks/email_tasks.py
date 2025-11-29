"""
Email Tasks
"""
from app.celery_app import celery_app
import logging

logger = logging.getLogger(__name__)


@celery_app.task(name="send_email_task")
def send_email_task(to: str, subject: str, body: str):
    """Send email asynchronously"""
    logger.info(f"Sending email to {to}: {subject}")
    # Implementation would send email via SMTP or email service
    return {"status": "sent", "to": to}

