"""
Legal Service for Last Wish Platform
Handles legal document generation, compliance checking, and state-specific guidance
"""

import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from jinja2 import Template, Environment, BaseLoader
from src.models.legal_template import LegalTemplate, StateRequirement, ComplianceCheck, LegalResource
from src.models.user import User
from src.models.addendum import Addendum
from src.models.user import db

class LegalService:
    """Service for legal document generation and compliance"""
    
    def __init__(self):
        self.jinja_env = Environment(loader=BaseLoader())
    
    def get_state_requirements(self, state_code: str) -> Optional[Dict]:
        """Get legal requirements for a specific state"""
        try:
            state_req = StateRequirement.query.filter_by(state_code=state_code.upper()).first()
            return state_req.to_dict() if state_req else None
        except Exception as e:
            print(f"Error getting state requirements: {e}")
            return None
    
    def get_legal_templates(self, template_type: str = None, state_code: str = None) -> List[Dict]:
        """Get available legal templates"""
        try:
            query = LegalTemplate.query.filter_by(is_active=True)
            
            if template_type:
                query = query.filter_by(template_type=template_type)
            
            if state_code:
                # Get state-specific templates first, then general ones
                state_templates = query.filter_by(state_code=state_code.upper()).all()
                general_templates = query.filter_by(state_code=None).all()
                templates = state_templates + general_templates
            else:
                templates = query.all()
            
            return [template.to_dict() for template in templates]
        except Exception as e:
            print(f"Error getting legal templates: {e}")
            return []
    
    def generate_document(self, template_id: int, user_data: Dict, addendum_data: Dict) -> Dict:
        """Generate a legal document from template"""
        try:
            template = LegalTemplate.query.get(template_id)
            if not template or not template.is_active:
                return {'error': 'Template not found or inactive'}
            
            # Prepare template variables
            template_vars = {
                'user': user_data,
                'addendum': addendum_data,
                'date': datetime.now().strftime('%B %d, %Y'),
                'state': user_data.get('state', ''),
                'assets': addendum_data.get('assets', []),
                'beneficiaries': addendum_data.get('beneficiaries', [])
            }
            
            # Render the document
            jinja_template = self.jinja_env.from_string(template.content_template)
            rendered_content = jinja_template.render(**template_vars)
            
            return {
                'success': True,
                'template_info': template.to_dict(),
                'content': rendered_content,
                'legal_requirements': template.legal_requirements,
                'requires_notarization': template.requires_notarization,
                'requires_witnesses': template.requires_witnesses,
                'witness_count': template.witness_count,
                'legal_disclaimers': template.legal_disclaimers
            }
        except Exception as e:
            print(f"Error generating document: {e}")
            return {'error': f'Document generation failed: {str(e)}'}
    
    def check_compliance(self, user_id: int, addendum_id: int = None, state_code: str = None) -> Dict:
        """Perform comprehensive compliance check"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}
            
            # Use user's state if not provided
            if not state_code:
                state_code = user.state
            
            # Get state requirements
            state_req = self.get_state_requirements(state_code)
            if not state_req:
                return {'error': f'State requirements not found for {state_code}'}
            
            # Initialize compliance check
            compliance_check = ComplianceCheck(
                user_id=user_id,
                addendum_id=addendum_id,
                check_type='comprehensive',
                state_code=state_code,
                status='pending'
            )
            
            issues = []
            warnings = []
            recommendations = []
            required_actions = []
            missing_requirements = []
            score = 100
            
            # Check user profile completeness
            profile_issues = self._check_profile_completeness(user)
            if profile_issues:
                issues.extend(profile_issues)
                score -= len(profile_issues) * 5
            
            # Check state-specific requirements
            state_issues = self._check_state_requirements(user, state_req)
            if state_issues:
                warnings.extend(state_issues)
                score -= len(state_issues) * 3
            
            # Check addendum if provided
            if addendum_id:
                addendum = Addendum.query.get(addendum_id)
                if addendum:
                    addendum_issues = self._check_addendum_compliance(addendum, state_req)
                    if addendum_issues:
                        issues.extend(addendum_issues)
                        score -= len(addendum_issues) * 10
            
            # Check tax compliance
            tax_issues = self._check_tax_compliance(user)
            if tax_issues:
                warnings.extend(tax_issues)
                recommendations.extend([
                    "Consult with a tax professional about cryptocurrency reporting requirements",
                    "Ensure proper record-keeping for all digital asset transactions"
                ])
            
            # Determine status
            if score >= 90:
                status = 'passed'
            elif score >= 70:
                status = 'warning'
            else:
                status = 'failed'
            
            # Generate recommendations
            if state_req['will_notarization_required']:
                required_actions.append("Document must be notarized in your state")
            
            if state_req['will_witness_requirement'] > 0:
                required_actions.append(f"Document must be signed by {state_req['will_witness_requirement']} witnesses")
            
            if not state_req['has_digital_asset_law']:
                warnings.append("Your state does not have specific digital asset inheritance laws")
                recommendations.append("Consider consulting with an estate planning attorney familiar with digital assets")
            
            # Update compliance check
            compliance_check.status = status
            compliance_check.score = max(0, score)
            compliance_check.issues = issues
            compliance_check.warnings = warnings
            compliance_check.recommendations = recommendations
            compliance_check.required_actions = required_actions
            compliance_check.missing_requirements = missing_requirements
            compliance_check.expires_at = datetime.utcnow() + timedelta(days=30)
            
            db.session.add(compliance_check)
            db.session.commit()
            
            return compliance_check.to_dict()
            
        except Exception as e:
            print(f"Error checking compliance: {e}")
            return {'error': f'Compliance check failed: {str(e)}'}
    
    def _check_profile_completeness(self, user: User) -> List[str]:
        """Check if user profile is complete for legal documents"""
        issues = []
        
        if not user.full_name or len(user.full_name.strip()) < 2:
            issues.append("Full legal name is required")
        
        if not user.address:
            issues.append("Complete address is required")
        
        if not user.city:
            issues.append("City is required")
        
        if not user.state:
            issues.append("State is required")
        
        if not user.zip_code:
            issues.append("ZIP code is required")
        
        if not user.date_of_birth:
            issues.append("Date of birth is required")
        
        return issues
    
    def _check_state_requirements(self, user: User, state_req: Dict) -> List[str]:
        """Check state-specific requirements"""
        warnings = []
        
        if not state_req['has_digital_asset_law']:
            warnings.append(f"{state_req['state_name']} does not have specific digital asset inheritance laws")
        
        if state_req['will_notarization_required']:
            warnings.append(f"{state_req['state_name']} requires will notarization")
        
        if not state_req['will_self_proving_allowed']:
            warnings.append(f"{state_req['state_name']} does not allow self-proving wills")
        
        return warnings
    
    def _check_addendum_compliance(self, addendum: Addendum, state_req: Dict) -> List[str]:
        """Check addendum-specific compliance issues"""
        issues = []
        
        if not addendum.assets or len(addendum.assets) == 0:
            issues.append("No digital assets specified in addendum")
        
        if not addendum.beneficiaries or len(addendum.beneficiaries) == 0:
            issues.append("No beneficiaries specified in addendum")
        
        # Check asset details
        for asset in addendum.assets:
            if not asset.get('wallet_address'):
                issues.append(f"Missing wallet address for {asset.get('asset_type', 'unknown')} asset")
            
            if not asset.get('estimated_value'):
                issues.append(f"Missing estimated value for {asset.get('asset_type', 'unknown')} asset")
        
        return issues
    
    def _check_tax_compliance(self, user: User) -> List[str]:
        """Check tax compliance requirements"""
        warnings = []
        
        # Basic tax compliance checks
        warnings.append("Ensure all digital asset transactions are reported on tax returns")
        warnings.append("Form 1041 (Estate and Trust returns) must address digital asset questions")
        warnings.append("Consider estate tax implications for high-value cryptocurrency holdings")
        
        return warnings
    
    def get_legal_resources(self, category: str = None, state_code: str = None, audience: str = None) -> List[Dict]:
        """Get legal resources and educational content"""
        try:
            query = LegalResource.query.filter_by(is_published=True)
            
            if category:
                query = query.filter_by(category=category)
            
            if state_code:
                # Get state-specific resources first, then general ones
                state_resources = query.filter_by(state_specific=state_code.upper()).all()
                general_resources = query.filter_by(state_specific=None).all()
                resources = state_resources + general_resources
            else:
                resources = query.all()
            
            if audience:
                resources = [r for r in resources if r.audience == audience or r.audience is None]
            
            return [resource.to_dict() for resource in resources]
        except Exception as e:
            print(f"Error getting legal resources: {e}")
            return []
    
    def validate_document_content(self, content: str, template_type: str) -> Dict:
        """Validate generated document content"""
        try:
            issues = []
            warnings = []
            
            # Basic content validation
            if len(content.strip()) < 100:
                issues.append("Document content appears too short")
            
            # Check for required elements based on template type
            if template_type == 'will_addendum':
                required_phrases = [
                    'addendum', 'will', 'testament', 'digital asset', 'cryptocurrency'
                ]
                for phrase in required_phrases:
                    if phrase.lower() not in content.lower():
                        warnings.append(f"Document may be missing required element: {phrase}")
            
            # Check for placeholder text
            placeholders = re.findall(r'\{\{.*?\}\}', content)
            if placeholders:
                issues.append(f"Document contains unreplaced placeholders: {', '.join(placeholders)}")
            
            # Check for proper formatting
            if not re.search(r'[A-Z][a-z]+ \d{1,2}, \d{4}', content):
                warnings.append("Document may be missing a proper date")
            
            return {
                'valid': len(issues) == 0,
                'issues': issues,
                'warnings': warnings,
                'score': max(0, 100 - len(issues) * 20 - len(warnings) * 5)
            }
        except Exception as e:
            print(f"Error validating document: {e}")
            return {'valid': False, 'issues': [f'Validation error: {str(e)}']}
    
    def get_notary_requirements(self, state_code: str) -> Dict:
        """Get notarization requirements for a state"""
        try:
            state_req = self.get_state_requirements(state_code)
            if not state_req:
                return {'error': 'State not found'}
            
            return {
                'state': state_req['state_name'],
                'notarization_required': state_req['will_notarization_required'],
                'self_proving_allowed': state_req['will_self_proving_allowed'],
                'witness_requirement': state_req['will_witness_requirement'],
                'special_requirements': state_req.get('special_requirements', {}),
                'recommendations': self._get_notary_recommendations(state_req)
            }
        except Exception as e:
            print(f"Error getting notary requirements: {e}")
            return {'error': f'Failed to get notary requirements: {str(e)}'}
    
    def _get_notary_recommendations(self, state_req: Dict) -> List[str]:
        """Get notarization recommendations for a state"""
        recommendations = []
        
        if state_req['will_notarization_required']:
            recommendations.append("Notarization is required by state law")
            recommendations.append("Find a licensed notary public in your state")
        else:
            recommendations.append("Notarization is not required but recommended for added security")
        
        if state_req['will_self_proving_allowed']:
            recommendations.append("Consider creating a self-proving affidavit to speed up probate")
        
        if state_req['will_witness_requirement'] > 0:
            recommendations.append(f"Ensure {state_req['will_witness_requirement']} witnesses sign the document")
            recommendations.append("Witnesses should be adults who are not beneficiaries")
        
        return recommendations

