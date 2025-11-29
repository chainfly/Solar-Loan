"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('is_superuser', sa.Boolean(), nullable=True),
        sa.Column('verification_token', sa.String(length=255), nullable=True),
        sa.Column('reset_token', sa.String(length=255), nullable=True),
        sa.Column('reset_token_expires', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)
    
    # Loan applications table
    op.create_table(
        'loan_applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('date_of_birth', sa.DateTime(timezone=True), nullable=True),
        sa.Column('pan_number', sa.String(length=10), nullable=True),
        sa.Column('aadhaar_number', sa.String(length=12), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('pincode', sa.String(length=10), nullable=True),
        sa.Column('annual_income', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('employment_type', sa.String(length=50), nullable=True),
        sa.Column('existing_loans', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('system_capacity_kw', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('roof_area_sqft', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('roof_type', sa.String(length=50), nullable=True),
        sa.Column('installation_address', sa.Text(), nullable=True),
        sa.Column('estimated_cost', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('loan_amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('loan_tenure_years', sa.Integer(), nullable=True),
        sa.Column('interest_rate', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('status', sa.Enum('draft', 'submitted', 'kyc_in_progress', 'kyc_completed', 'cibil_checking', 'cibil_completed', 'ai_eligibility_checking', 'ai_eligibility_completed', 'subsidy_checking', 'subsidy_completed', 'emi_calculated', 'approved', 'rejected', 'disbursed', name='loanstatus'), nullable=False),
        sa.Column('current_step', sa.String(length=50), nullable=True),
        sa.Column('workflow_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_eligibility_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('ai_eligibility_result', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('roi_prediction', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('subsidy_amount', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('emi_amount', sa.Numeric(precision=15, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_loan_applications_user_id'), 'loan_applications', ['user_id'], unique=False)
    
    # Documents table
    op.create_table(
        'documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('loan_application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('document_type', sa.Enum('aadhaar', 'pan', 'bank_statement', 'income_proof', 'address_proof', 'roof_photo', 'other', name='documenttype'), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_path', sa.String(length=500), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=True),
        sa.Column('status', sa.Enum('uploaded', 'processing', 'verified', 'rejected', name='documentstatus'), nullable=False),
        sa.Column('ocr_data', sa.Text(), nullable=True),
        sa.Column('ocr_confidence', sa.String(length=10), nullable=True),
        sa.Column('meta_data', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['loan_application_id'], ['loan_applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_loan_application_id'), 'documents', ['loan_application_id'], unique=False)
    op.create_index(op.f('ix_documents_user_id'), 'documents', ['user_id'], unique=False)
    
    # KYC records table
    op.create_table(
        'kyc_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('loan_application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('kyc_type', sa.Enum('aadhaar_xml', 'pan', 'bank', 'ckyc', name='kyctype'), nullable=False),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'failed', 'verified', 'rejected', name='kycstatus'), nullable=False),
        sa.Column('encrypted_request_data', sa.Text(), nullable=True),
        sa.Column('encrypted_response_data', sa.Text(), nullable=True),
        sa.Column('decentro_operation_id', sa.String(length=255), nullable=True),
        sa.Column('decentro_reference_id', sa.String(length=255), nullable=True),
        sa.Column('verification_result', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('verification_score', sa.String(length=10), nullable=True),
        sa.Column('consent_text', sa.Text(), nullable=True),
        sa.Column('consent_timestamp', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consent_ip', sa.String(length=50), nullable=True),
        sa.Column('meta_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['loan_application_id'], ['loan_applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kyc_records_user_id'), 'kyc_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_kyc_records_loan_application_id'), 'kyc_records', ['loan_application_id'], unique=False)
    op.create_index(op.f('ix_kyc_records_decentro_operation_id'), 'kyc_records', ['decentro_operation_id'], unique=False)
    
    # KYC tasks table
    op.create_table(
        'kyc_tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('kyc_record_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('task_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('operation_id', sa.String(length=255), nullable=True),
        sa.Column('result', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['kyc_record_id'], ['kyc_records.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_kyc_tasks_kyc_record_id'), 'kyc_tasks', ['kyc_record_id'], unique=False)
    
    # Credit checks table
    op.create_table(
        'credit_checks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('loan_application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('status', sa.Enum('pending', 'in_progress', 'completed', 'failed', 'expired', name='creditstatus'), nullable=False),
        sa.Column('job_id', sa.String(length=255), nullable=True),
        sa.Column('encrypted_report', sa.Text(), nullable=True),
        sa.Column('credit_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('credit_rating', sa.String(length=10), nullable=True),
        sa.Column('report_summary', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('consent_text', sa.Text(), nullable=True),
        sa.Column('consent_timestamp', sa.DateTime(timezone=True), nullable=True),
        sa.Column('consent_ip', sa.String(length=50), nullable=True),
        sa.Column('meta_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['loan_application_id'], ['loan_applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_credit_checks_user_id'), 'credit_checks', ['user_id'], unique=False)
    op.create_index(op.f('ix_credit_checks_loan_application_id'), 'credit_checks', ['loan_application_id'], unique=False)
    op.create_index(op.f('ix_credit_checks_job_id'), 'credit_checks', ['job_id'], unique=False)
    
    # AI predictions table
    op.create_table(
        'ai_predictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('loan_application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('prediction_type', sa.Enum('eligibility', 'roi_prediction', 'angle_optimization', 'prequal', 'simulate', name='predictiontype'), nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        sa.Column('input_features', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('prediction_result', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('confidence_score', sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column('shap_values', sa.Text(), nullable=True),
        sa.Column('feature_importance', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('processing_time_ms', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('meta_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['loan_application_id'], ['loan_applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_predictions_loan_application_id'), 'ai_predictions', ['loan_application_id'], unique=False)
    
    # Batch jobs table
    op.create_table(
        'batch_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_type', sa.String(length=50), nullable=False),
        sa.Column('status', sa.Enum('pending', 'processing', 'completed', 'failed', name='batchjobstatus'), nullable=False),
        sa.Column('input_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('results', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('total_count', sa.Integer(), nullable=True),
        sa.Column('success_count', sa.Integer(), nullable=True),
        sa.Column('failed_count', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('failed_items', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Audit logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('loan_application_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('action', sa.Enum('create', 'update', 'delete', 'login', 'logout', 'kyc_verify', 'cibil_fetch', 'ai_predict', 'document_upload', 'loan_submit', 'payment_initiate', 'webhook_receive', name='auditaction'), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=True),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=500), nullable=True),
        sa.Column('request_path', sa.String(length=500), nullable=True),
        sa.Column('request_method', sa.String(length=10), nullable=True),
        sa.Column('changes', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('old_values', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('new_values', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['loan_application_id'], ['loan_applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_user_id'), 'audit_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_loan_application_id'), 'audit_logs', ['loan_application_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_created_at'), 'audit_logs', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_audit_logs_created_at'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_loan_application_id'), table_name='audit_logs')
    op.drop_index(op.f('ix_audit_logs_user_id'), table_name='audit_logs')
    op.drop_table('audit_logs')
    op.drop_table('batch_jobs')
    op.drop_index(op.f('ix_ai_predictions_loan_application_id'), table_name='ai_predictions')
    op.drop_table('ai_predictions')
    op.drop_index(op.f('ix_credit_checks_job_id'), table_name='credit_checks')
    op.drop_index(op.f('ix_credit_checks_loan_application_id'), table_name='credit_checks')
    op.drop_index(op.f('ix_credit_checks_user_id'), table_name='credit_checks')
    op.drop_table('credit_checks')
    op.drop_index(op.f('ix_kyc_tasks_kyc_record_id'), table_name='kyc_tasks')
    op.drop_table('kyc_tasks')
    op.drop_index(op.f('ix_kyc_records_decentro_operation_id'), table_name='kyc_records')
    op.drop_index(op.f('ix_kyc_records_loan_application_id'), table_name='kyc_records')
    op.drop_index(op.f('ix_kyc_records_user_id'), table_name='kyc_records')
    op.drop_table('kyc_records')
    op.drop_index(op.f('ix_documents_user_id'), table_name='documents')
    op.drop_index(op.f('ix_documents_loan_application_id'), table_name='documents')
    op.drop_table('documents')
    op.drop_index(op.f('ix_loan_applications_user_id'), table_name='loan_applications')
    op.drop_table('loan_applications')
    op.drop_index(op.f('ix_users_phone'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')

