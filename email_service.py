import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content
from flask import current_app
from src.models.notification import NotificationTemplate, Notification
from src.models.user import db

class EmailService:
    def __init__(self):
        self.sg = sendgrid.SendGridAPIClient(api_key=current_app.config.get('SENDGRID_API_KEY'))
        self.from_email = current_app.config.get('FROM_EMAIL', 'noreply@lastwish.com')
    
    def send_email(self, to_email, subject, content, html_content=None):
        """Send email using SendGrid"""
        try:
            from_email = Email(self.from_email)
            to_email = To(to_email)
            
            if html_content:
                mail = Mail(from_email, to_email, subject, Content("text/html", html_content))
            else:
                mail = Mail(from_email, to_email, subject, Content("text/plain", content))
            
            response = self.sg.client.mail.send.post(request_body=mail.get())
            return response.status_code == 202
            
        except Exception as e:
            current_app.logger.error(f"Email sending failed: {str(e)}")
            return False
    
    def send_template_email(self, user, template_name, variables=None):
        """Send email using a template"""
        try:
            template = NotificationTemplate.query.filter_by(
                name=template_name, 
                type='email', 
                is_active=True
            ).first()
            
            if not template:
                current_app.logger.error(f"Email template not found: {template_name}")
                return False
            
            # Prepare variables
            email_variables = {
                'first_name': user.first_name or 'User',
                'last_name': user.last_name or '',
                'email': user.email,
                'full_name': f"{user.first_name} {user.last_name}".strip()
            }
            
            if variables:
                email_variables.update(variables)
            
            # Render template
            rendered = template.render(email_variables)
            
            # Send email
            success = self.send_email(
                user.email,
                rendered['subject'],
                rendered['content'],
                rendered.get('html_content')
            )
            
            # Log notification
            notification = Notification(
                user_id=user.id,
                type='email',
                event=template.event,
                subject=rendered['subject'],
                content=rendered['content'],
                recipient_email=user.email,
                status='sent' if success else 'failed',
                provider='sendgrid'
            )
            
            if success:
                notification.mark_sent()
            else:
                notification.mark_failed("SendGrid API error")
            
            db.session.add(notification)
            db.session.commit()
            
            return success
            
        except Exception as e:
            current_app.logger.error(f"Template email sending failed: {str(e)}")
            return False
    
    def send_welcome_email(self, user):
        """Send welcome email to new user"""
        return self.send_template_email(user, 'welcome_email')
    
    def send_payment_confirmation_email(self, user, payment):
        """Send payment confirmation email"""
        variables = {
            'plan_name': payment.plan.display_name,
            'amount_usd': payment.amount_usd,
            'amount_crypto': payment.amount_crypto,
            'cryptocurrency': payment.cryptocurrency,
            'transaction_hash': payment.transaction_hash
        }
        return self.send_template_email(user, 'payment_confirmed', variables)
    
    def send_addendum_created_email(self, user, addendum):
        """Send addendum creation confirmation email"""
        variables = {
            'addendum_title': addendum.title,
            'asset_count': addendum.get_asset_count(),
            'beneficiary_count': addendum.get_beneficiary_count(),
            'total_value': addendum.get_total_asset_value()
        }
        return self.send_template_email(user, 'addendum_created', variables)
    
    def send_password_reset_email(self, user, reset_token):
        """Send password reset email"""
        reset_url = f"https://lastwish.com/reset-password?token={reset_token}"
        
        subject = "Reset Your Last Wish Password"
        content = f"""Dear {user.first_name},

You requested a password reset for your Last Wish account.

Click the link below to reset your password:
{reset_url}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, please ignore this email.

Best regards,
The Last Wish Team"""
        
        return self.send_email(user.email, subject, content)
    
    def send_post_demise_notification(self, beneficiary_email, executor_name, addendum_title, discovery_instructions):
        """Send post-demise notification to beneficiaries"""
        subject = f"Important Estate Information from {executor_name}"
        
        content = f"""Dear Beneficiary,

This message is being sent on behalf of {executor_name} regarding cryptocurrency assets that may have been left to you.

Estate Document: {addendum_title}

Discovery Instructions:
{discovery_instructions}

IMPORTANT SECURITY NOTICE:
- This email does NOT contain private keys, seed phrases, or passwords
- Credentials are stored separately as indicated in the discovery instructions
- Please contact the executor for assistance accessing the assets
- Be cautious of scams and only trust information from verified sources

If you have questions about this inheritance, please contact the executor directly.

This notification was sent automatically by the Last Wish platform."""
        
        return self.send_email(beneficiary_email, subject, content)

