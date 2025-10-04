import logging
from datetime import datetime, timedelta
from flask import current_app
from src.models.notification import Notification, NotificationTemplate
from src.models.user import User, db
from src.services.email_service import EmailService
import json

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, app=None):
        self.app = app
        self.email_service = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize notification service with Flask app"""
        self.email_service = EmailService()
    
    def create_notification(self, user_id, notification_type, event, subject, content, 
                          recipient_email=None, metadata=None, scheduled_for=None):
        """Create a new notification record"""
        try:
            notification = Notification(
                user_id=user_id,
                type=notification_type,
                event=event,
                subject=subject,
                content=content,
                recipient_email=recipient_email or User.query.get(user_id).email,
                metadata=metadata or {},
                scheduled_for=scheduled_for,
                status='pending'
            )
            
            db.session.add(notification)
            db.session.commit()
            
            # If not scheduled, send immediately
            if not scheduled_for:
                self.send_notification(notification.id)
            
            return notification
            
        except Exception as e:
            logger.error(f"Failed to create notification: {str(e)}")
            db.session.rollback()
            return None
    
    def send_notification(self, notification_id):
        """Send a specific notification"""
        try:
            notification = Notification.query.get(notification_id)
            if not notification:
                logger.error(f"Notification not found: {notification_id}")
                return False
            
            if notification.status != 'pending':
                logger.warning(f"Notification {notification_id} already processed")
                return False
            
            success = False
            
            if notification.type == 'email':
                success = self.email_service.send_email(
                    notification.recipient_email,
                    notification.subject,
                    notification.content,
                    notification.content  # Assuming content is HTML
                )
            elif notification.type == 'sms':
                # SMS implementation would go here
                logger.info(f"SMS notification not implemented: {notification_id}")
                success = True  # Mock success for now
            elif notification.type == 'push':
                # Push notification implementation would go here
                logger.info(f"Push notification not implemented: {notification_id}")
                success = True  # Mock success for now
            
            # Update notification status
            if success:
                notification.mark_sent()
                logger.info(f"Notification {notification_id} sent successfully")
            else:
                notification.mark_failed("Delivery failed")
                logger.error(f"Failed to send notification {notification_id}")
            
            db.session.commit()
            return success
            
        except Exception as e:
            logger.error(f"Failed to send notification {notification_id}: {str(e)}")
            db.session.rollback()
            return False
    
    def send_welcome_notification(self, user_id):
        """Send welcome notification to new user"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        subject = "Welcome to Last Wish - Your Cryptocurrency Estate Planning Platform"
        content = self._render_welcome_email(user)
        
        return self.create_notification(
            user_id=user_id,
            notification_type='email',
            event='user_registered',
            subject=subject,
            content=content,
            metadata={'template': 'welcome_email'}
        )
    
    def send_payment_confirmation(self, user_id, payment_data):
        """Send payment confirmation notification"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        subject = f"Payment Confirmed - {payment_data['plan_name']} Activated"
        content = self._render_payment_confirmation_email(user, payment_data)
        
        return self.create_notification(
            user_id=user_id,
            notification_type='email',
            event='payment_confirmed',
            subject=subject,
            content=content,
            metadata={'template': 'payment_confirmation', 'payment_data': payment_data}
        )
    
    def send_document_ready_notification(self, user_id, document_data):
        """Send document ready notification"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        subject = "Your Cryptocurrency Addendum is Ready for Download"
        content = self._render_document_ready_email(user, document_data)
        
        return self.create_notification(
            user_id=user_id,
            notification_type='email',
            event='document_ready',
            subject=subject,
            content=content,
            metadata={'template': 'document_ready', 'document_data': document_data}
        )
    
    def send_password_reset_notification(self, user_id, reset_token):
        """Send password reset notification"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        subject = "Reset Your Last Wish Password"
        content = self._render_password_reset_email(user, reset_token)
        
        return self.create_notification(
            user_id=user_id,
            notification_type='email',
            event='password_reset',
            subject=subject,
            content=content,
            metadata={'template': 'password_reset', 'reset_token': reset_token}
        )
    
    def send_account_verification_notification(self, user_id, verification_token):
        """Send account verification notification"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        subject = "Verify Your Last Wish Account"
        content = self._render_account_verification_email(user, verification_token)
        
        return self.create_notification(
            user_id=user_id,
            notification_type='email',
            event='account_verification',
            subject=subject,
            content=content,
            metadata={'template': 'account_verification', 'verification_token': verification_token}
        )
    
    def schedule_post_demise_notifications(self, addendum_id, trigger_date):
        """Schedule post-demise notifications for beneficiaries"""
        try:
            from src.models.addendum import Addendum
            
            addendum = Addendum.query.get(addendum_id)
            if not addendum:
                logger.error(f"Addendum not found: {addendum_id}")
                return False
            
            # Get beneficiaries from addendum
            beneficiaries = addendum.get_beneficiaries()
            
            for beneficiary in beneficiaries:
                if beneficiary.get('email'):
                    subject = f"Important Estate Information from {addendum.user.get_full_name()}"
                    content = self._render_post_demise_email(addendum, beneficiary)
                    
                    self.create_notification(
                        user_id=addendum.user_id,
                        notification_type='email',
                        event='post_demise_notification',
                        subject=subject,
                        content=content,
                        recipient_email=beneficiary['email'],
                        scheduled_for=trigger_date,
                        metadata={
                            'template': 'post_demise_notification',
                            'addendum_id': addendum_id,
                            'beneficiary_data': beneficiary
                        }
                    )
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to schedule post-demise notifications: {str(e)}")
            return False
    
    def process_scheduled_notifications(self):
        """Process notifications scheduled for current time"""
        try:
            current_time = datetime.utcnow()
            
            # Get pending scheduled notifications
            scheduled_notifications = Notification.query.filter(
                Notification.status == 'pending',
                Notification.scheduled_for <= current_time
            ).all()
            
            processed_count = 0
            for notification in scheduled_notifications:
                if self.send_notification(notification.id):
                    processed_count += 1
            
            logger.info(f"Processed {processed_count} scheduled notifications")
            return processed_count
            
        except Exception as e:
            logger.error(f"Failed to process scheduled notifications: {str(e)}")
            return 0
    
    def get_user_notifications(self, user_id, limit=50, offset=0):
        """Get notifications for a user"""
        try:
            notifications = Notification.query.filter_by(user_id=user_id)\
                .order_by(Notification.created_at.desc())\
                .limit(limit)\
                .offset(offset)\
                .all()
            
            return [notification.to_dict() for notification in notifications]
            
        except Exception as e:
            logger.error(f"Failed to get user notifications: {str(e)}")
            return []
    
    def mark_notification_read(self, notification_id, user_id):
        """Mark a notification as read"""
        try:
            notification = Notification.query.filter_by(
                id=notification_id,
                user_id=user_id
            ).first()
            
            if notification:
                notification.mark_read()
                db.session.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to mark notification as read: {str(e)}")
            db.session.rollback()
            return False
    
    def _render_welcome_email(self, user):
        """Render welcome email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Last Wish</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .feature {{ margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #3b82f6; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Last Wish</h1>
                    <p>Your Cryptocurrency Estate Planning Platform</p>
                </div>
                <div class="content">
                    <h2>Hello {user.first_name or 'User'}!</h2>
                    <p>Thank you for joining Last Wish, the premier platform for cryptocurrency estate planning. We're excited to help you secure your digital assets for your loved ones.</p>
                    
                    <h3>What You Can Do:</h3>
                    <div class="feature">
                        <strong>🔗 Connect Your Wallets</strong><br>
                        Securely connect your cryptocurrency wallets using WalletConnect technology.
                    </div>
                    <div class="feature">
                        <strong>📄 Create Legal Addendums</strong><br>
                        Generate notarizable addendums to your will for cryptocurrency assets.
                    </div>
                    <div class="feature">
                        <strong>🔒 Bank-Level Security</strong><br>
                        Your information is protected with AES-256 encryption and secure storage.
                    </div>
                    <div class="feature">
                        <strong>⚡ Fast Processing</strong><br>
                        Get your legal documents ready for notarization within hours.
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://lastwish.app/app/dashboard" class="button">Get Started Now</a>
                    </div>
                    
                    <h3>Need Help?</h3>
                    <p>Our support team is here to help you every step of the way. Contact us at <a href="mailto:support@lastwish.app">support@lastwish.app</a> or visit our help center.</p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish. All rights reserved.</p>
                    <p>This email was sent to {user.email}. If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _render_payment_confirmation_email(self, user, payment_data):
        """Render payment confirmation email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmation</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .payment-details {{ background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }}
                .detail-row {{ display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .success-icon {{ font-size: 48px; text-align: center; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="success-icon">✅</div>
                    <h1>Payment Successful!</h1>
                    <p>Your {payment_data.get('plan_name', 'plan')} is now active</p>
                </div>
                <div class="content">
                    <h2>Hello {user.first_name or 'User'}!</h2>
                    <p>We've successfully processed your payment. Your {payment_data.get('plan_name', 'plan')} is now active and ready to use.</p>
                    
                    <div class="payment-details">
                        <h3>Payment Details</h3>
                        <div class="detail-row">
                            <span><strong>Plan:</strong></span>
                            <span>{payment_data.get('plan_name', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Amount Paid:</strong></span>
                            <span>{payment_data.get('amount', 'N/A')} {payment_data.get('currency', '')}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Transaction Hash:</strong></span>
                            <span style="font-family: monospace; font-size: 12px;">{payment_data.get('tx_hash', 'N/A')}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Payment Date:</strong></span>
                            <span>{datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</span>
                        </div>
                        <div class="detail-row">
                            <span><strong>Status:</strong></span>
                            <span style="color: #059669; font-weight: bold;">Confirmed</span>
                        </div>
                    </div>
                    
                    <h3>What's Next?</h3>
                    <p>Now that your payment is confirmed, you can:</p>
                    <ul>
                        <li>Create your cryptocurrency addendum</li>
                        <li>Connect your crypto wallets</li>
                        <li>Generate legal documents</li>
                        <li>Access premium features</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="https://lastwish.app/app/addendum" class="button">Create Your Addendum</a>
                    </div>
                    
                    <p><strong>Need help?</strong> Contact our support team at <a href="mailto:support@lastwish.app">support@lastwish.app</a></p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish. All rights reserved.</p>
                    <p>Keep this email for your records.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _render_document_ready_email(self, user, document_data):
        """Render document ready email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document Ready</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .document-info {{ background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #7c3aed; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .next-steps {{ background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📄 Document Ready!</h1>
                    <p>Your cryptocurrency addendum has been generated</p>
                </div>
                <div class="content">
                    <h2>Hello {user.first_name or 'User'}!</h2>
                    <p>Great news! Your cryptocurrency addendum has been successfully generated and is ready for download.</p>
                    
                    <div class="document-info">
                        <h3>Document Information</h3>
                        <p><strong>Document Type:</strong> {document_data.get('type', 'Cryptocurrency Addendum')}</p>
                        <p><strong>Generated:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
                        <p><strong>Assets Included:</strong> {document_data.get('asset_count', 0)} cryptocurrency assets</p>
                        <p><strong>File Format:</strong> PDF (Notarization Ready)</p>
                    </div>
                    
                    <div class="next-steps">
                        <h3>⚠️ Important Next Steps</h3>
                        <ol>
                            <li><strong>Download your document</strong> using the button below</li>
                            <li><strong>Print the document</strong> on standard 8.5" x 11" paper</li>
                            <li><strong>Sign the document</strong> in the presence of a notary</li>
                            <li><strong>Store the notarized document</strong> with your original will</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{document_data.get('download_url', '#')}" class="button">Download Document</a>
                    </div>
                    
                    <h3>Notarization Requirements</h3>
                    <p>For your addendum to be legally valid, it must be:</p>
                    <ul>
                        <li>Signed in the presence of a licensed notary public</li>
                        <li>Witnessed according to your state's requirements</li>
                        <li>Stored with your original will and testament</li>
                    </ul>
                    
                    <p><strong>Questions?</strong> Our legal support team is available at <a href="mailto:legal@lastwish.app">legal@lastwish.app</a></p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish. All rights reserved.</p>
                    <p>This document link will expire in 30 days for security purposes.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _render_password_reset_email(self, user, reset_token):
        """Render password reset email template"""
        reset_url = f"https://lastwish.app/auth/reset-password?token={reset_token}"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .security-notice {{ background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔒 Password Reset</h1>
                    <p>Reset your Last Wish account password</p>
                </div>
                <div class="content">
                    <h2>Hello {user.first_name or 'User'}!</h2>
                    <p>We received a request to reset the password for your Last Wish account. If you made this request, click the button below to reset your password.</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="button">Reset Password</a>
                    </div>
                    
                    <div class="security-notice">
                        <h3>🛡️ Security Information</h3>
                        <ul>
                            <li>This link will expire in 1 hour for security</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Your password will not change unless you click the link above</li>
                            <li>For security, we recommend using a strong, unique password</li>
                        </ul>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;">{reset_url}</p>
                    
                    <p><strong>Need help?</strong> Contact our support team at <a href="mailto:support@lastwish.app">support@lastwish.app</a></p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish. All rights reserved.</p>
                    <p>This email was sent to {user.email}</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _render_account_verification_email(self, user, verification_token):
        """Render account verification email template"""
        verification_url = f"https://lastwish.app/auth/verify?token={verification_token}"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Account</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✉️ Verify Your Account</h1>
                    <p>Complete your Last Wish registration</p>
                </div>
                <div class="content">
                    <h2>Hello {user.first_name or 'User'}!</h2>
                    <p>Thank you for creating your Last Wish account. To complete your registration and start securing your cryptocurrency assets, please verify your email address.</p>
                    
                    <div style="text-align: center;">
                        <a href="{verification_url}" class="button">Verify Email Address</a>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;">{verification_url}</p>
                    
                    <p><strong>Why verify?</strong> Email verification helps us:</p>
                    <ul>
                        <li>Ensure account security</li>
                        <li>Send important notifications about your documents</li>
                        <li>Provide support when needed</li>
                        <li>Protect against unauthorized access</li>
                    </ul>
                    
                    <p>This verification link will expire in 24 hours. If you need a new link, please contact support.</p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish. All rights reserved.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """
    
    def _render_post_demise_email(self, addendum, beneficiary):
        """Render post-demise notification email template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Estate Notification</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #6b7280, #9ca3af); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .important-notice {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 20px 0; }}
                .asset-info {{ background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6b7280; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Estate Notification</h1>
                    <p>Cryptocurrency Asset Information</p>
                </div>
                <div class="content">
                    <h2>Dear {beneficiary.get('name', 'Beneficiary')},</h2>
                    <p>We are writing to inform you that {addendum.user.get_full_name()} has designated you as a beneficiary for cryptocurrency assets in their estate planning documents.</p>
                    
                    <div class="important-notice">
                        <h3>⚠️ Important Legal Notice</h3>
                        <p>This notification is being sent as part of an automated estate planning system. Please consult with the estate's legal representative or executor before taking any action regarding these assets.</p>
                    </div>
                    
                    <div class="asset-info">
                        <h3>Asset Information</h3>
                        <p><strong>Document Type:</strong> Cryptocurrency Addendum</p>
                        <p><strong>Date Created:</strong> {addendum.created_at.strftime('%Y-%m-%d') if addendum.created_at else 'N/A'}</p>
                        <p><strong>Assets Listed:</strong> {addendum.get_asset_count() if hasattr(addendum, 'get_asset_count') else 'Multiple'} cryptocurrency holdings</p>
                        <p><strong>Your Allocation:</strong> {beneficiary.get('percentage', 'N/A')}%</p>
                    </div>
                    
                    <h3>Next Steps</h3>
                    <ol>
                        <li><strong>Contact the Estate Executor:</strong> Reach out to the designated executor of the estate</li>
                        <li><strong>Legal Consultation:</strong> Consider consulting with an estate attorney</li>
                        <li><strong>Document Review:</strong> Review the complete estate planning documents</li>
                        <li><strong>Asset Recovery:</strong> Work with legal counsel to access designated assets</li>
                    </ol>
                    
                    <p><strong>Questions or Concerns?</strong> Please contact our estate services team at <a href="mailto:estate@lastwish.app">estate@lastwish.app</a> or call our 24/7 support line.</p>
                    
                    <p>Our thoughts are with you during this difficult time.</p>
                </div>
                <div class="footer">
                    <p>© 2024 Last Wish Estate Services. All rights reserved.</p>
                    <p>This is an automated notification sent on behalf of the estate.</p>
                </div>
            </div>
        </body>
        </html>
        """

# Global notification service instance
notification_service = NotificationService()

