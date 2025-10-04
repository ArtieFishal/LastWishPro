"""
Legal Data Seeding Script for Last Wish Platform
Populates database with legal templates, state requirements, and resources
"""

from datetime import datetime
from src.models.database import db
from src.models.legal_template import LegalTemplate, StateRequirement, LegalResource

def seed_legal_templates():
    """Seed legal document templates"""
    
    # Basic Cryptocurrency Will Addendum Template
    basic_template = LegalTemplate(
        name="Basic Cryptocurrency Will Addendum",
        template_type="will_addendum",
        state_code=None,  # General template
        title="ADDENDUM TO LAST WILL AND TESTAMENT REGARDING DIGITAL ASSETS",
        content_template="""
ADDENDUM TO LAST WILL AND TESTAMENT
REGARDING DIGITAL ASSETS

I, {{ user.full_name }}, of {{ user.address }}, {{ user.city }}, {{ user.state }} {{ user.zip_code }}, being of sound mind and disposing memory, do hereby make this Addendum to my Last Will and Testament dated _____________, to specifically address my digital assets, including cryptocurrency and other blockchain-based assets.

ARTICLE I - DIGITAL ASSET INVENTORY

I own or may own the following digital assets at the time of my death:

{% for asset in addendum.assets %}
{{ loop.index }}. {{ asset.asset_type }} ({{ asset.symbol }})
   Wallet Address: {{ asset.wallet_address }}
   Estimated Value: ${{ asset.estimated_value }}
   Exchange/Platform: {{ asset.platform or 'Self-custody' }}
   Additional Notes: {{ asset.notes or 'None' }}

{% endfor %}

ARTICLE II - DIGITAL EXECUTOR

I hereby designate {{ addendum.digital_executor_name or '[TO BE DESIGNATED]' }} as my Digital Executor to manage and distribute my digital assets according to the terms of this Addendum and my Last Will and Testament.

ARTICLE III - ACCESS INSTRUCTIONS

The credentials, private keys, seed phrases, and passwords necessary to access my digital assets are stored separately from this document in the following location(s):

{{ addendum.credential_location or '[TO BE SPECIFIED]' }}

My Digital Executor is authorized to access these credentials for the sole purpose of carrying out the distribution of my digital assets as specified herein.

ARTICLE IV - DISTRIBUTION OF DIGITAL ASSETS

I direct that my digital assets be distributed as follows:

{% for beneficiary in addendum.beneficiaries %}
{{ loop.index }}. {{ beneficiary.name }} ({{ beneficiary.relationship }})
   Percentage: {{ beneficiary.percentage }}%
   Address: {{ beneficiary.address }}
   
{% endfor %}

ARTICLE V - GENERAL PROVISIONS

1. This Addendum supplements and does not replace my Last Will and Testament.

2. In the event of any conflict between this Addendum and my Last Will and Testament, this Addendum shall control with respect to digital assets specifically mentioned herein.

3. I authorize my Digital Executor to convert digital assets to fiat currency if necessary for distribution, taking into account tax implications and beneficiary preferences.

4. This Addendum shall be governed by the laws of {{ user.state }}.

IN WITNESS WHEREOF, I have executed this Addendum on {{ date }}.

_________________________________
{{ user.full_name }}
Testator

WITNESSES:

_________________________________    _________________________________
Witness 1 Signature                  Witness 2 Signature

_________________________________    _________________________________
Witness 1 Name (Print)               Witness 2 Name (Print)

_________________________________    _________________________________
Witness 1 Address                    Witness 2 Address

_________________________________    _________________________________
Date                                 Date

NOTARIZATION

State of {{ user.state }}
County of _______________

On {{ date }}, before me personally appeared {{ user.full_name }}, who proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument and acknowledged to me that he/she executed the same in his/her authorized capacity, and that by his/her signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.

I certify under PENALTY OF PERJURY under the laws of the State of {{ user.state }} that the foregoing paragraph is true and correct.

WITNESS my hand and official seal.

_________________________________
Notary Public Signature

[Notary Seal]
""",
        legal_requirements={
            "witness_count": 2,
            "notarization_recommended": True,
            "state_specific_variations": True
        },
        version="1.0",
        requires_notarization=False,  # Recommended but not required in most states
        requires_witnesses=True,
        witness_count=2,
        witness_requirements={
            "age_requirement": 18,
            "competency_required": True,
            "beneficiary_restriction": "Witnesses should not be beneficiaries"
        },
        compliance_notes="This template follows general estate planning principles. State-specific requirements may apply.",
        legal_disclaimers="This document is for informational purposes only and does not constitute legal advice. Consult with a qualified estate planning attorney in your jurisdiction.",
        attorney_review_required=True,
        created_by="System"
    )
    
    # Louisiana-specific template (requires notarization)
    louisiana_template = LegalTemplate(
        name="Louisiana Cryptocurrency Will Addendum",
        template_type="will_addendum",
        state_code="LA",
        title="ADDENDUM TO LAST WILL AND TESTAMENT REGARDING DIGITAL ASSETS (LOUISIANA)",
        content_template=basic_template.content_template + "\n\nNOTE: This document MUST be notarized to be valid under Louisiana law.",
        legal_requirements={
            "notarization_required": True,
            "witness_count": 2,
            "louisiana_specific": True
        },
        version="1.0",
        requires_notarization=True,  # Required in Louisiana
        requires_witnesses=True,
        witness_count=2,
        compliance_notes="Louisiana requires notarization for all wills and codicils.",
        legal_disclaimers="This document is for informational purposes only and does not constitute legal advice. Consult with a qualified Louisiana estate planning attorney.",
        attorney_review_required=True,
        created_by="System"
    )
    
    db.session.add(basic_template)
    db.session.add(louisiana_template)

def seed_state_requirements():
    """Seed state-specific legal requirements"""
    
    states_data = [
        {
            'state_code': 'AL', 'state_name': 'Alabama',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'HB 138 Revised Uniform Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2018, 1, 1),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA'
        },
        {
            'state_code': 'AK', 'state_name': 'Alaska',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'HB 108 Revised Uniform Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2017, 10, 31),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA'
        },
        {
            'state_code': 'AZ', 'state_name': 'Arizona',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'SB 1413 Revised Uniform Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2016, 5, 11),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA'
        },
        {
            'state_code': 'CA', 'state_name': 'California',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'AB-691 Revised Uniform Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2016, 9, 24),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'holographic_will_allowed': True,
            'fiduciary_access_law': 'RUFADAA',
            'state_bar_url': 'https://www.calbar.ca.gov/'
        },
        {
            'state_code': 'CO', 'state_name': 'Colorado',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'SB 16-088 Revised Uniform Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2016, 4, 7),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA',
            'special_requirements': {
                'notarization_alternative': 'Colorado allows notarization in place of witness signatures'
            }
        },
        {
            'state_code': 'FL', 'state_name': 'Florida',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'SB 494, Chapter 740 Florida Fiduciary Access to Digital Assets Act',
            'digital_asset_law_effective_date': datetime(2016, 7, 1),
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA'
        },
        {
            'state_code': 'LA', 'state_name': 'Louisiana',
            'has_digital_asset_law': False,
            'will_witness_requirement': 2,
            'will_notarization_required': True,  # ONLY state that requires notarization
            'will_self_proving_allowed': False,
            'special_requirements': {
                'notarization_mandatory': 'Louisiana is the only state that requires will notarization',
                'civil_law_system': 'Louisiana follows civil law rather than common law'
            }
        },
        {
            'state_code': 'NY', 'state_name': 'New York',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'New York Digital Assets Law',
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA',
            'state_bar_url': 'https://www.nysba.org/'
        },
        {
            'state_code': 'TX', 'state_name': 'Texas',
            'has_digital_asset_law': True,
            'digital_asset_law_name': 'Texas Digital Assets Law',
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'holographic_will_allowed': True,
            'fiduciary_access_law': 'RUFADAA'
        },
        {
            'state_code': 'ND', 'state_name': 'North Dakota',
            'has_digital_asset_law': True,
            'will_witness_requirement': 2,
            'will_notarization_required': False,
            'will_self_proving_allowed': True,
            'fiduciary_access_law': 'RUFADAA',
            'special_requirements': {
                'notarization_alternative': 'North Dakota allows notarization in place of witness signatures'
            }
        }
    ]
    
    for state_data in states_data:
        state_req = StateRequirement(**state_data)
        db.session.add(state_req)

def seed_legal_resources():
    """Seed legal resources and educational content"""
    
    resources = [
        {
            'title': 'Understanding Cryptocurrency Estate Planning',
            'resource_type': 'guide',
            'category': 'estate_planning',
            'content': '''
# Understanding Cryptocurrency Estate Planning

## What is Cryptocurrency Estate Planning?

Cryptocurrency estate planning involves creating legal documents and procedures to ensure your digital assets are properly transferred to your beneficiaries after your death. Unlike traditional assets, cryptocurrencies require special handling due to their digital nature and the need for private keys or seed phrases.

## Why is it Important?

1. **Irreversible Loss**: Without proper planning, cryptocurrency can be permanently lost if private keys are not accessible
2. **Legal Clarity**: Provides clear instructions for executors and beneficiaries
3. **Tax Compliance**: Ensures proper reporting and valuation for estate tax purposes
4. **Family Protection**: Prevents disputes and confusion among family members

## Key Components

### 1. Asset Inventory
- List all cryptocurrency holdings
- Include wallet addresses (public keys only)
- Document exchange accounts
- Note estimated values

### 2. Access Instructions
- Store private keys/seed phrases securely
- Provide clear location instructions
- Consider multi-signature arrangements
- Plan for technology changes

### 3. Legal Documentation
- Will addendum or codicil
- Digital asset power of attorney
- Beneficiary designations
- Executor instructions

### 4. Professional Guidance
- Estate planning attorney
- Tax professional
- Digital asset specialist
- Financial advisor

## Best Practices

1. **Regular Updates**: Review and update your plan annually
2. **Security First**: Never include private keys in legal documents
3. **Clear Instructions**: Provide step-by-step access procedures
4. **Professional Review**: Have documents reviewed by qualified attorneys
5. **Family Education**: Ensure beneficiaries understand the process
            ''',
            'summary': 'Comprehensive guide to cryptocurrency estate planning fundamentals',
            'tags': ['cryptocurrency', 'estate planning', 'digital assets', 'inheritance'],
            'audience': 'general',
            'difficulty_level': 'beginner'
        },
        {
            'title': 'IRS Digital Asset Reporting Requirements',
            'resource_type': 'article',
            'category': 'tax_compliance',
            'content': '''
# IRS Digital Asset Reporting Requirements

## Overview

The IRS treats digital assets as property, not currency, for tax purposes. This classification has significant implications for estate planning and inheritance.

## Key Requirements

### Annual Tax Returns
- Form 1040: Individual returns must answer digital asset question
- Form 1041: Estate and trust returns must address digital assets
- Form 709: Gift tax returns for large transfers

### Estate Planning Implications
- Digital assets are included in gross estate
- Fair market value at death determines basis
- Beneficiaries receive "stepped-up basis"
- Estate tax applies if total estate exceeds exemption

### Record Keeping
- Maintain detailed transaction records
- Document acquisition dates and costs
- Track all sales, exchanges, and transfers
- Keep records of wallet addresses and transactions

## Compliance Tips

1. **Professional Help**: Consult tax professionals familiar with digital assets
2. **Accurate Valuation**: Use reputable sources for fair market value
3. **Detailed Records**: Maintain comprehensive transaction logs
4. **Regular Updates**: Stay informed about changing regulations
            ''',
            'summary': 'Essential information about IRS requirements for digital asset reporting',
            'tags': ['IRS', 'tax compliance', 'digital assets', 'reporting'],
            'audience': 'general',
            'difficulty_level': 'intermediate'
        },
        {
            'title': 'State-by-State Digital Asset Laws',
            'resource_type': 'article',
            'category': 'state_laws',
            'content': '''
# State-by-State Digital Asset Laws

## Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA)

Most states have adopted some version of RUFADAA, which provides a legal framework for fiduciary access to digital assets.

## Key State Variations

### Louisiana
- **Unique Requirement**: Only state requiring will notarization
- **Civil Law System**: Different legal framework than other states
- **Special Considerations**: Forced heirship rules may apply

### California
- **Strong Digital Asset Laws**: Comprehensive RUFADAA implementation
- **Holographic Wills**: Handwritten wills are valid
- **Community Property**: Special rules for married couples

### Texas
- **Business-Friendly**: Strong property rights protections
- **Holographic Wills**: Handwritten wills allowed
- **No State Income Tax**: Simplified tax planning

### New York
- **Complex Probate**: Detailed court procedures
- **Strong Consumer Protections**: Enhanced beneficiary rights
- **High Estate Taxes**: State estate tax considerations

## General Principles

1. **Fiduciary Authorization**: Executors need proper legal authority
2. **Terms of Service**: Platform policies may override state law
3. **Privacy Protections**: Balance between access and privacy
4. **Court Oversight**: Probate courts provide supervision
            ''',
            'summary': 'Overview of state-specific laws affecting digital asset inheritance',
            'tags': ['state laws', 'RUFADAA', 'digital assets', 'fiduciary access'],
            'audience': 'general',
            'difficulty_level': 'intermediate'
        }
    ]
    
    for resource_data in resources:
        resource = LegalResource(**resource_data)
        db.session.add(resource)

def seed_all_legal_data():
    """Seed all legal data"""
    try:
        print("Seeding legal templates...")
        seed_legal_templates()
        
        print("Seeding state requirements...")
        seed_state_requirements()
        
        print("Seeding legal resources...")
        seed_legal_resources()
        
        db.session.commit()
        print("Legal data seeding completed successfully!")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error seeding legal data: {e}")
        raise

if __name__ == "__main__":
    from src.main import app
    with app.app_context():
        seed_all_legal_data()

