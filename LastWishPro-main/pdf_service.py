import boto3
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from flask import current_app
from datetime import datetime
import io
import os
import tempfile

class PDFService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY'),
            region_name=current_app.config.get('AWS_REGION')
        )
        self.bucket_name = current_app.config.get('S3_BUCKET_NAME')
    
    def generate_addendum_pdf(self, addendum, user):
        """Generate PDF for addendum"""
        try:
            # Create temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                # Generate PDF content
                self._create_addendum_pdf(tmp_file.name, addendum, user)
                
                # Upload to S3
                s3_key = f"addendums/{user.id}/{addendum.id}/addendum_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                
                with open(tmp_file.name, 'rb') as pdf_file:
                    self.s3_client.upload_fileobj(
                        pdf_file,
                        self.bucket_name,
                        s3_key,
                        ExtraArgs={'ContentType': 'application/pdf'}
                    )
                
                # Generate signed URL
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': s3_key},
                    ExpiresIn=3600 * 24 * 7  # 7 days
                )
                
                # Clean up temporary file
                os.unlink(tmp_file.name)
                
                return {
                    's3_key': s3_key,
                    'url': url
                }
                
        except Exception as e:
            current_app.logger.error(f"PDF generation error: {str(e)}")
            return None
    
    def _create_addendum_pdf(self, filename, addendum, user):
        """Create the actual PDF document"""
        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build story
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Times-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            spaceBefore=20,
            fontName='Times-Bold'
        )
        
        body_style = ParagraphStyle(
            'CustomBody',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            fontName='Times-Roman'
        )
        
        # Title
        story.append(Paragraph("ADDENDUM TO LAST WILL AND TESTAMENT", title_style))
        story.append(Paragraph("CRYPTOCURRENCY AND DIGITAL ASSETS", title_style))
        story.append(Spacer(1, 20))
        
        # Introduction
        intro_text = f"""I, {user.first_name} {user.last_name}, being of sound mind and disposing memory, 
        do hereby make this Addendum to my Last Will and Testament, or if no will exists, this document 
        shall serve as a memorandum regarding my cryptocurrency and digital assets."""
        
        story.append(Paragraph(intro_text, body_style))
        story.append(Spacer(1, 20))
        
        # Personal Information
        story.append(Paragraph("PERSONAL INFORMATION", heading_style))
        
        personal_info = [
            ['Full Name:', f"{user.first_name} {user.last_name}"],
            ['Email:', user.email],
            ['Address:', f"{user.address or ''}, {user.city or ''}, {user.state or ''} {user.zip_code or ''}".strip(', ')],
            ['Date of Birth:', user.date_of_birth.strftime('%B %d, %Y') if user.date_of_birth else 'Not provided']
        ]
        
        personal_table = Table(personal_info, colWidths=[2*inch, 4*inch])
        personal_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Times-Roman'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        story.append(personal_table)
        story.append(Spacer(1, 20))
        
        # Digital Executor
        if user.digital_executor_name:
            story.append(Paragraph("DIGITAL EXECUTOR", heading_style))
            executor_text = f"""I hereby designate {user.digital_executor_name} 
            ({user.digital_executor_email or 'Email not provided'}) as my Digital Executor to manage 
            my cryptocurrency and digital assets upon my death or incapacity."""
            story.append(Paragraph(executor_text, body_style))
            story.append(Spacer(1, 20))
        
        # Cryptocurrency Assets
        story.append(Paragraph("CRYPTOCURRENCY ASSETS", heading_style))
        
        if addendum.assets:
            story.append(Paragraph("The following cryptocurrency assets are held in wallets under my control:", body_style))
            story.append(Spacer(1, 12))
            
            # Assets table
            asset_data = [['Asset', 'Blockchain', 'Wallet Address', 'Balance', 'Est. Value (USD)']]
            
            for asset in addendum.assets:
                asset_data.append([
                    f"{asset.asset_symbol} ({asset.asset_name})",
                    asset.blockchain.title(),
                    f"{asset.wallet_address[:10]}...{asset.wallet_address[-6:]}",
                    asset.balance,
                    f"${asset.value_usd:,.2f}" if asset.value_usd else "N/A"
                ])
            
            asset_table = Table(asset_data, colWidths=[1.5*inch, 1*inch, 1.5*inch, 1*inch, 1*inch])
            asset_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Times-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('FONTNAME', (0, 1), (-1, -1), 'Times-Roman'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            
            story.append(asset_table)
            story.append(Spacer(1, 20))
            
            # Total value
            total_value = sum(asset.value_usd or 0 for asset in addendum.assets)
            story.append(Paragraph(f"<b>Total Estimated Value: ${total_value:,.2f} USD</b>", body_style))
            story.append(Spacer(1, 20))
        else:
            story.append(Paragraph("No cryptocurrency assets have been added to this addendum.", body_style))
            story.append(Spacer(1, 20))
        
        # Beneficiary Designations
        story.append(Paragraph("BENEFICIARY DESIGNATIONS", heading_style))
        
        if addendum.beneficiaries:
            story.append(Paragraph("I direct that my cryptocurrency assets be distributed as follows:", body_style))
            story.append(Spacer(1, 12))
            
            # Group beneficiaries by asset
            asset_beneficiaries = {}
            for beneficiary in addendum.beneficiaries:
                asset_symbol = beneficiary.asset.asset_symbol
                if asset_symbol not in asset_beneficiaries:
                    asset_beneficiaries[asset_symbol] = []
                asset_beneficiaries[asset_symbol].append(beneficiary)
            
            for asset_symbol, beneficiaries in asset_beneficiaries.items():
                story.append(Paragraph(f"<b>{asset_symbol}:</b>", body_style))
                
                for beneficiary in beneficiaries:
                    beneficiary_text = f"• {beneficiary.percentage}% to {beneficiary.beneficiary_name} ({beneficiary.beneficiary_email}), {beneficiary.relationship}"
                    story.append(Paragraph(beneficiary_text, body_style))
                
                story.append(Spacer(1, 12))
        else:
            story.append(Paragraph("No beneficiaries have been designated for the cryptocurrency assets.", body_style))
            story.append(Spacer(1, 20))
        
        # Discovery Instructions
        story.append(Paragraph("DISCOVERY INSTRUCTIONS", heading_style))
        
        if addendum.discovery_instructions:
            story.append(Paragraph(addendum.discovery_instructions, body_style))
        else:
            story.append(Paragraph("Credentials are stored in a secure location separate from this document.", body_style))
        
        story.append(Spacer(1, 20))
        
        # Additional Notes
        if addendum.additional_notes:
            story.append(Paragraph("ADDITIONAL NOTES", heading_style))
            story.append(Paragraph(addendum.additional_notes, body_style))
            story.append(Spacer(1, 20))
        
        # Important Disclaimers
        story.append(Paragraph("IMPORTANT DISCLAIMERS", heading_style))
        
        disclaimers = [
            "• This document does NOT contain private keys, seed phrases, or passwords",
            "• Credentials are stored separately in a secure location as indicated above",
            "• Cryptocurrencies are considered property by the IRS and subject to estate tax",
            "• This document is for informational purposes and does not constitute legal advice",
            "• Consult with an estate planning attorney for legal guidance"
        ]
        
        for disclaimer in disclaimers:
            story.append(Paragraph(disclaimer, body_style))
        
        story.append(Spacer(1, 30))
        
        # Signature Section
        current_date = datetime.now()
        signature_text = f"""Signed this {current_date.day} day of {current_date.strftime('%B')}, {current_date.year}.
        
        
        _________________________________
        {user.first_name} {user.last_name}"""
        
        story.append(Paragraph(signature_text, body_style))
        story.append(Spacer(1, 30))
        
        # Notary Section
        story.append(Paragraph("NOTARY ACKNOWLEDGMENT", heading_style))
        
        notary_text = f"""STATE OF _______________
        COUNTY OF _______________
        
        On this _____ day of _____________, {current_date.year}, before me personally appeared 
        {user.first_name} {user.last_name}, who proved to me on the basis of satisfactory evidence 
        to be the person whose name is subscribed to the within instrument and acknowledged to me 
        that he/she executed the same in his/her authorized capacity, and that by his/her signature 
        on the instrument the person, or the entity upon behalf of which the person acted, executed 
        the instrument.
        
        I certify under PENALTY OF PERJURY under the laws of the State of _______________ that 
        the foregoing paragraph is true and correct.
        
        WITNESS my hand and official seal.
        
        
        _________________________________
        Notary Public"""
        
        story.append(Paragraph(notary_text, body_style))
        
        # Build PDF
        doc.build(story)
    
    def generate_memorandum_template(self):
        """Generate memorandum template for credential storage guidance"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                self._create_memorandum_template(tmp_file.name)
                
                # Upload to S3
                s3_key = f"templates/memorandum_template_{datetime.now().strftime('%Y%m%d')}.pdf"
                
                with open(tmp_file.name, 'rb') as pdf_file:
                    self.s3_client.upload_fileobj(
                        pdf_file,
                        self.bucket_name,
                        s3_key,
                        ExtraArgs={'ContentType': 'application/pdf'}
                    )
                
                # Generate signed URL
                url = self.s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': self.bucket_name, 'Key': s3_key},
                    ExpiresIn=3600 * 24 * 30  # 30 days
                )
                
                # Clean up temporary file
                os.unlink(tmp_file.name)
                
                return {
                    's3_key': s3_key,
                    'url': url
                }
                
        except Exception as e:
            current_app.logger.error(f"Memorandum template generation error: {str(e)}")
            return None
    
    def _create_memorandum_template(self, filename):
        """Create memorandum template PDF"""
        doc = SimpleDocTemplate(filename, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Times-Bold'
        )
        
        story.append(Paragraph("CRYPTOCURRENCY CREDENTIAL STORAGE MEMORANDUM", title_style))
        story.append(Spacer(1, 20))
        
        # Content
        content = """
        This memorandum provides guidance for securely storing cryptocurrency credentials 
        separate from your estate planning addendum.
        
        SECURITY PRINCIPLES:
        • Never store private keys or seed phrases in your will or addendum
        • Use multiple secure storage locations
        • Provide clear instructions for your digital executor
        • Test access procedures periodically
        
        RECOMMENDED STORAGE METHODS:
        1. Safe Deposit Box: Store written copies in a bank safe deposit box
        2. Fireproof Safe: Use a home fireproof safe for backup copies
        3. Hardware Wallets: Store devices in secure locations
        4. Encrypted Digital Storage: Use encrypted USB drives or cloud storage
        
        CREDENTIAL CHECKLIST:
        □ Seed phrases (12-24 words)
        □ Private keys
        □ Hardware wallet PINs
        □ Exchange account passwords
        □ Two-factor authentication backup codes
        □ Wallet software installation instructions
        
        INSTRUCTIONS FOR DIGITAL EXECUTOR:
        [Provide specific step-by-step instructions here]
        
        Remember: This document should be stored separately from your addendum and will.
        """
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=12,
            spaceAfter=12,
            fontName='Times-Roman'
        )
        
        story.append(Paragraph(content, body_style))
        
        doc.build(story)

