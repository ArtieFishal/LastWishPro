"""
Legal Template Models for Last Wish Platform
Handles legal document templates, state-specific requirements, compliance checking, and legal resources
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from src.models.user import db

class LegalTemplate(db.Model):
    """Legal document templates for different states and document types"""
    __tablename__ = 'legal_templates'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    template_type = Column(String(50), nullable=False)  # 'will_addendum', 'codicil', 'power_of_attorney'
    state_code = Column(String(2), nullable=True)  # US state code, null for federal/general
    jurisdiction = Column(String(100), nullable=True)  # Specific jurisdiction if applicable
    
    # Template content
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)  # Jinja2 template content
    description = Column(Text, nullable=True)
    
    # Template metadata
    version = Column(String(20), default='1.0')
    is_active = Column(Boolean, default=True)
    requires_notarization = Column(Boolean, default=False)
    requires_witnesses = Column(Integer, default=0)  # Number of witnesses required
    
    # Legal requirements
    legal_requirements = Column(JSON, nullable=True)  # JSON array of requirements
    variables = Column(JSON, nullable=True)  # JSON array of template variables
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'template_type': self.template_type,
            'state_code': self.state_code,
            'jurisdiction': self.jurisdiction,
            'title': self.title,
            'content': self.content,
            'description': self.description,
            'version': self.version,
            'is_active': self.is_active,
            'requires_notarization': self.requires_notarization,
            'requires_witnesses': self.requires_witnesses,
            'legal_requirements': self.legal_requirements,
            'variables': self.variables,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class StateRequirement(db.Model):
    """State-specific legal requirements for estate planning documents"""
    __tablename__ = 'state_requirements'
    
    id = Column(Integer, primary_key=True)
    state_code = Column(String(2), nullable=False, unique=True)
    state_name = Column(String(100), nullable=False)
    
    # Digital asset laws
    has_digital_asset_law = Column(Boolean, default=False)
    digital_asset_law_name = Column(String(200), nullable=True)
    digital_asset_law_year = Column(Integer, nullable=True)
    
    # RUFADAA compliance
    rufadaa_adopted = Column(Boolean, default=False)
    rufadaa_version = Column(String(20), nullable=True)  # '2014', '2015', 'modified'
    
    # Will requirements
    will_requires_notarization = Column(Boolean, default=False)
    will_requires_witnesses = Column(Integer, default=2)
    will_witness_restrictions = Column(JSON, nullable=True)  # JSON array of restrictions
    
    # Addendum requirements
    addendum_requires_notarization = Column(Boolean, default=False)
    addendum_requires_witnesses = Column(Integer, default=0)
    addendum_witness_restrictions = Column(JSON, nullable=True)
    
    # Digital executor provisions
    allows_digital_executor = Column(Boolean, default=True)
    digital_executor_requirements = Column(JSON, nullable=True)
    
    # Cryptocurrency specific
    crypto_inheritance_guidance = Column(Text, nullable=True)
    crypto_tax_considerations = Column(Text, nullable=True)
    
    # Additional requirements
    additional_requirements = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'state_code': self.state_code,
            'state_name': self.state_name,
            'has_digital_asset_law': self.has_digital_asset_law,
            'digital_asset_law_name': self.digital_asset_law_name,
            'digital_asset_law_year': self.digital_asset_law_year,
            'rufadaa_adopted': self.rufadaa_adopted,
            'rufadaa_version': self.rufadaa_version,
            'will_requires_notarization': self.will_requires_notarization,
            'will_requires_witnesses': self.will_requires_witnesses,
            'will_witness_restrictions': self.will_witness_restrictions,
            'addendum_requires_notarization': self.addendum_requires_notarization,
            'addendum_requires_witnesses': self.addendum_requires_witnesses,
            'addendum_witness_restrictions': self.addendum_witness_restrictions,
            'allows_digital_executor': self.allows_digital_executor,
            'digital_executor_requirements': self.digital_executor_requirements,
            'crypto_inheritance_guidance': self.crypto_inheritance_guidance,
            'crypto_tax_considerations': self.crypto_tax_considerations,
            'additional_requirements': self.additional_requirements,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ComplianceCheck(db.Model):
    """Compliance checking results for user documents"""
    __tablename__ = 'compliance_checks'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    addendum_id = Column(Integer, ForeignKey('addendums.id'), nullable=True)
    
    # Check details
    check_type = Column(String(50), nullable=False)  # 'profile', 'document', 'state_compliance'
    state_code = Column(String(2), nullable=True)
    
    # Results
    overall_score = Column(Integer, nullable=False)  # 0-100
    max_score = Column(Integer, nullable=False, default=100)
    status = Column(String(20), nullable=False)  # 'compliant', 'warning', 'non_compliant'
    
    # Detailed results
    issues = Column(JSON, nullable=True)  # JSON array of issues found
    warnings = Column(JSON, nullable=True)  # JSON array of warnings
    recommendations = Column(JSON, nullable=True)  # JSON array of recommendations
    
    # Check metadata
    check_version = Column(String(20), default='1.0')
    check_date = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", backref="compliance_checks")
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'addendum_id': self.addendum_id,
            'check_type': self.check_type,
            'state_code': self.state_code,
            'overall_score': self.overall_score,
            'max_score': self.max_score,
            'status': self.status,
            'issues': self.issues,
            'warnings': self.warnings,
            'recommendations': self.recommendations,
            'check_version': self.check_version,
            'check_date': self.check_date.isoformat() if self.check_date else None
        }

class LegalResource(db.Model):
    """Legal resources and educational content"""
    __tablename__ = 'legal_resources'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    content_type = Column(String(50), nullable=False)  # 'article', 'guide', 'faq', 'template'
    category = Column(String(100), nullable=False)  # 'estate_planning', 'cryptocurrency', 'state_law'
    
    # Content
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    
    # Targeting
    state_specific = Column(String(2), nullable=True)  # State code if state-specific
    audience = Column(String(100), nullable=True)  # 'general', 'attorney', 'financial_advisor'
    
    # Metadata
    author = Column(String(200), nullable=True)
    source_url = Column(String(500), nullable=True)
    last_reviewed = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=True)
    
    # SEO and organization
    tags = Column(JSON, nullable=True)  # JSON array of tags
    related_resources = Column(JSON, nullable=True)  # JSON array of related resource IDs
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content_type': self.content_type,
            'category': self.category,
            'content': self.content,
            'summary': self.summary,
            'state_specific': self.state_specific,
            'audience': self.audience,
            'author': self.author,
            'source_url': self.source_url,
            'last_reviewed': self.last_reviewed.isoformat() if self.last_reviewed else None,
            'is_published': self.is_published,
            'tags': self.tags,
            'related_resources': self.related_resources,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

