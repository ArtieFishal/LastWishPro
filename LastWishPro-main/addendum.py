from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Addendum(db.Model):
    __tablename__ = 'addendums'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Document Information
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    
    # Content Data (JSON structure)
    content = db.Column(db.JSON, nullable=False)  # Structured addendum data
    
    # Document Status
    status = db.Column(db.String(20), nullable=False, default='draft')  # draft, generated, notarized, archived
    
    # File Storage
    pdf_s3_key = db.Column(db.String(255), nullable=True)  # S3 key for generated PDF
    pdf_url = db.Column(db.String(500), nullable=True)  # Signed URL for PDF access
    pdf_generated_at = db.Column(db.DateTime, nullable=True)
    
    # Legal Information
    notarized_at = db.Column(db.DateTime, nullable=True)
    notary_name = db.Column(db.String(200), nullable=True)
    notary_commission = db.Column(db.String(100), nullable=True)
    notary_state = db.Column(db.String(50), nullable=True)
    
    # Discovery Instructions
    discovery_instructions = db.Column(db.Text, nullable=True)  # Where credentials are stored
    additional_notes = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    assets = db.relationship('AddendumAsset', backref='addendum', lazy=True, cascade='all, delete-orphan')
    beneficiaries = db.relationship('AddendumBeneficiary', backref='addendum', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Addendum {self.id} - {self.title}>'

    def get_total_asset_value(self):
        """Calculate total USD value of all assets"""
        return sum(asset.value_usd or 0 for asset in self.assets)

    def get_asset_count(self):
        """Get total number of assets"""
        return len(self.assets)

    def get_beneficiary_count(self):
        """Get total number of beneficiaries"""
        return len(set(b.beneficiary_email for b in self.beneficiaries))

    def to_dict(self, include_content=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'pdf_s3_key': self.pdf_s3_key,
            'pdf_url': self.pdf_url,
            'pdf_generated_at': self.pdf_generated_at.isoformat() if self.pdf_generated_at else None,
            'notarized_at': self.notarized_at.isoformat() if self.notarized_at else None,
            'notary_name': self.notary_name,
            'notary_commission': self.notary_commission,
            'notary_state': self.notary_state,
            'discovery_instructions': self.discovery_instructions,
            'additional_notes': self.additional_notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'total_asset_value': self.get_total_asset_value(),
            'asset_count': self.get_asset_count(),
            'beneficiary_count': self.get_beneficiary_count()
        }
        
        if include_content:
            data['content'] = self.content
            data['assets'] = [asset.to_dict() for asset in self.assets]
            data['beneficiaries'] = [beneficiary.to_dict() for beneficiary in self.beneficiaries]
        
        return data

class AddendumAsset(db.Model):
    __tablename__ = 'addendum_assets'
    
    id = db.Column(db.Integer, primary_key=True)
    addendum_id = db.Column(db.Integer, db.ForeignKey('addendums.id'), nullable=False)
    
    # Asset Information
    wallet_address = db.Column(db.String(255), nullable=False)
    blockchain = db.Column(db.String(50), nullable=False)  # ethereum, solana, bitcoin
    asset_symbol = db.Column(db.String(20), nullable=False)
    asset_name = db.Column(db.String(100), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)  # native, erc20, nft, spl-token
    contract_address = db.Column(db.String(255), nullable=True)
    
    # Balance and Value
    balance = db.Column(db.String(50), nullable=False)  # String to handle large numbers
    value_usd = db.Column(db.Numeric(20, 2), nullable=True)
    price_per_unit = db.Column(db.Numeric(20, 8), nullable=True)
    
    # Metadata
    token_id = db.Column(db.String(100), nullable=True)  # For NFTs
    asset_metadata = db.Column(db.JSON, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<AddendumAsset {self.asset_symbol} - {self.balance}>'

    def to_dict(self):
        return {
            'id': self.id,
            'addendum_id': self.addendum_id,
            'wallet_address': self.wallet_address,
            'blockchain': self.blockchain,
            'asset_symbol': self.asset_symbol,
            'asset_name': self.asset_name,
            'asset_type': self.asset_type,
            'contract_address': self.contract_address,
            'balance': self.balance,
            'value_usd': float(self.value_usd) if self.value_usd else None,
            'price_per_unit': float(self.price_per_unit) if self.price_per_unit else None,
            'token_id': self.token_id,
            'metadata': self.asset_metadata,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class AddendumBeneficiary(db.Model):
    __tablename__ = 'addendum_beneficiaries'
    
    id = db.Column(db.Integer, primary_key=True)
    addendum_id = db.Column(db.Integer, db.ForeignKey('addendums.id'), nullable=False)
    asset_id = db.Column(db.Integer, db.ForeignKey('addendum_assets.id'), nullable=False)
    
    # Beneficiary Information
    beneficiary_name = db.Column(db.String(200), nullable=False)
    beneficiary_email = db.Column(db.String(255), nullable=False)
    relationship = db.Column(db.String(100), nullable=False)  # spouse, child, parent, sibling, friend, charity, etc.
    
    # Allocation
    percentage = db.Column(db.Numeric(5, 2), nullable=False)  # 0.00 to 100.00
    specific_amount = db.Column(db.String(50), nullable=True)  # For specific token amounts
    
    # Contact Information
    phone_number = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    
    # Special Instructions
    special_instructions = db.Column(db.Text, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    asset = db.relationship('AddendumAsset', backref='beneficiaries')

    def __repr__(self):
        return f'<AddendumBeneficiary {self.beneficiary_name} - {self.percentage}%>'

    def to_dict(self):
        return {
            'id': self.id,
            'addendum_id': self.addendum_id,
            'asset_id': self.asset_id,
            'beneficiary_name': self.beneficiary_name,
            'beneficiary_email': self.beneficiary_email,
            'relationship': self.relationship,
            'percentage': float(self.percentage),
            'specific_amount': self.specific_amount,
            'phone_number': self.phone_number,
            'address': self.address,
            'special_instructions': self.special_instructions,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# LegalTemplate moved to legal_template.py to avoid duplication

