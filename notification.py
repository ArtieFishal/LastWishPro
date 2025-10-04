from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

from src.routes.auth import require_auth
from src.models.notification import Notification, NotificationTemplate, NotificationPreference, PostDemiseNotification
from src.models.user import db
from src.services.email_service import EmailService

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/preferences', methods=['GET'])
@require_auth
def get_notification_preferences():
    """Get user's notification preferences"""
    try:
        user = request.current_user
        preferences = NotificationPreference.query.filter_by(user_id=user.id).all()
        
        return jsonify({
            'preferences': [pref.to_dict() for pref in preferences]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notification preferences error: {str(e)}")
        return jsonify({'error': 'Failed to get notification preferences'}), 500

@notification_bp.route('/preferences', methods=['POST'])
@require_auth
def update_notification_preferences():
    """Update notification preferences"""
    try:
        user = request.current_user
        data = request.get_json()
        
        event = data.get('event')
        email_enabled = data.get('email_enabled', True)
        sms_enabled = data.get('sms_enabled', False)
        
        if not event:
            return jsonify({'error': 'Event type required'}), 400
        
        # Find or create preference
        preference = NotificationPreference.query.filter_by(
            user_id=user.id, 
            event=event
        ).first()
        
        if not preference:
            preference = NotificationPreference(
                user_id=user.id,
                event=event
            )
            db.session.add(preference)
        
        preference.email_enabled = email_enabled
        preference.sms_enabled = sms_enabled
        preference.immediate = data.get('immediate', True)
        preference.daily_digest = data.get('daily_digest', False)
        preference.weekly_digest = data.get('weekly_digest', False)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Notification preferences updated',
            'preference': preference.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Update notification preferences error: {str(e)}")
        return jsonify({'error': 'Failed to update notification preferences'}), 500

@notification_bp.route('/history', methods=['GET'])
@require_auth
def get_notification_history():
    """Get user's notification history"""
    try:
        user = request.current_user
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        event_type = request.args.get('event_type')
        
        query = Notification.query.filter_by(user_id=user.id)
        
        if event_type:
            query = query.filter_by(event=event_type)
        
        notifications = query.order_by(Notification.created_at.desc())\
                            .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications.items],
            'total': notifications.total,
            'pages': notifications.pages,
            'current_page': page,
            'per_page': per_page
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notification history error: {str(e)}")
        return jsonify({'error': 'Failed to get notification history'}), 500

@notification_bp.route('/send-test', methods=['POST'])
@require_auth
def send_test_notification():
    """Send test notification"""
    try:
        user = request.current_user
        data = request.get_json()
        
        notification_type = data.get('type', 'email')
        
        if notification_type == 'email':
            email_service = EmailService()
            success = email_service.send_email(
                user.email,
                "Test Notification from Last Wish",
                "This is a test notification to verify your email settings are working correctly."
            )
            
            if success:
                return jsonify({'message': 'Test email sent successfully'}), 200
            else:
                return jsonify({'error': 'Failed to send test email'}), 500
        else:
            return jsonify({'error': 'Notification type not supported'}), 400
            
    except Exception as e:
        current_app.logger.error(f"Send test notification error: {str(e)}")
        return jsonify({'error': 'Failed to send test notification'}), 500

@notification_bp.route('/post-demise', methods=['POST'])
@require_auth
def create_post_demise_notification():
    """Create post-demise notification"""
    try:
        user = request.current_user
        data = request.get_json()
        
        addendum_id = data.get('addendum_id')
        trigger_type = data.get('trigger_type', 'executor_manual')
        beneficiary_emails = data.get('beneficiary_emails', [])
        subject = data.get('subject', '').strip()
        message = data.get('message', '').strip()
        
        if not all([addendum_id, beneficiary_emails, subject, message]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate addendum belongs to user
        from src.models.addendum import Addendum
        addendum = Addendum.query.filter_by(id=addendum_id, user_id=user.id).first()
        if not addendum:
            return jsonify({'error': 'Addendum not found'}), 404
        
        # Create post-demise notification
        notification = PostDemiseNotification(
            user_id=user.id,
            addendum_id=addendum_id,
            trigger_type=trigger_type,
            beneficiary_emails=beneficiary_emails,
            executor_email=user.executor_email or user.email,
            digital_executor_email=user.digital_executor_email,
            subject=subject,
            message=message,
            include_addendum=data.get('include_addendum', True)
        )
        
        if trigger_type == 'timer_based' and data.get('trigger_date'):
            try:
                notification.trigger_date = datetime.fromisoformat(data['trigger_date'])
            except ValueError:
                return jsonify({'error': 'Invalid trigger date format'}), 400
        
        db.session.add(notification)
        db.session.commit()
        
        return jsonify({
            'message': 'Post-demise notification created',
            'notification': notification.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create post-demise notification error: {str(e)}")
        return jsonify({'error': 'Failed to create post-demise notification'}), 500

@notification_bp.route('/post-demise', methods=['GET'])
@require_auth
def get_post_demise_notifications():
    """Get user's post-demise notifications"""
    try:
        user = request.current_user
        notifications = PostDemiseNotification.query.filter_by(user_id=user.id).all()
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get post-demise notifications error: {str(e)}")
        return jsonify({'error': 'Failed to get post-demise notifications'}), 500

@notification_bp.route('/post-demise/<int:notification_id>/trigger', methods=['POST'])
@require_auth
def trigger_post_demise_notification(notification_id):
    """Trigger post-demise notification (for executors)"""
    try:
        user = request.current_user
        notification = PostDemiseNotification.query.filter_by(
            id=notification_id,
            user_id=user.id
        ).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        if notification.triggered:
            return jsonify({'error': 'Notification already triggered'}), 400
        
        # Trigger the notification
        notification.trigger_notification(triggered_by=user.email)
        
        # Send emails to beneficiaries
        email_service = EmailService()
        
        for beneficiary_email in notification.beneficiary_emails:
            try:
                email_service.send_post_demise_notification(
                    beneficiary_email,
                    user.executor_name or f"{user.first_name} {user.last_name}",
                    notification.subject,
                    notification.message
                )
            except Exception as e:
                current_app.logger.error(f"Failed to send post-demise email to {beneficiary_email}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Post-demise notification triggered successfully',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Trigger post-demise notification error: {str(e)}")
        return jsonify({'error': 'Failed to trigger notification'}), 500

@notification_bp.route('/templates', methods=['GET'])
def get_notification_templates():
    """Get available notification templates"""
    try:
        templates = NotificationTemplate.query.filter_by(is_active=True).all()
        
        return jsonify({
            'templates': [template.to_dict() for template in templates]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get notification templates error: {str(e)}")
        return jsonify({'error': 'Failed to get notification templates'}), 500

@notification_bp.route('/events', methods=['GET'])
def get_notification_events():
    """Get available notification events"""
    events = [
        {
            'name': 'user_registered',
            'display_name': 'User Registration',
            'description': 'Sent when a new user registers'
        },
        {
            'name': 'payment_confirmed',
            'display_name': 'Payment Confirmed',
            'description': 'Sent when a payment is confirmed'
        },
        {
            'name': 'addendum_created',
            'display_name': 'Addendum Created',
            'description': 'Sent when an addendum is created'
        },
        {
            'name': 'wallet_connected',
            'display_name': 'Wallet Connected',
            'description': 'Sent when a wallet is connected'
        },
        {
            'name': 'assets_synced',
            'display_name': 'Assets Synced',
            'description': 'Sent when wallet assets are synced'
        }
    ]
    
    return jsonify({'events': events}), 200

