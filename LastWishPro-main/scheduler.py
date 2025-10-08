import schedule
import time
import threading
import logging
from datetime import datetime, timedelta
from src.services.notification_service import notification_service
from src.models.notification import Notification
from src.models.user import db
from flask import current_app

logger = logging.getLogger(__name__)

class NotificationScheduler:
    def __init__(self, app=None):
        self.app = app
        self.scheduler_thread = None
        self.running = False
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize scheduler with Flask app"""
        self.app = app
        
        # Schedule notification processing jobs
        schedule.every(5).minutes.do(self._process_scheduled_notifications)
        schedule.every(1).hours.do(self._cleanup_old_notifications)
        schedule.every().day.at("09:00").do(self._send_daily_digest)
        schedule.every().monday.at("10:00").do(self._send_weekly_summary)
        
        logger.info("Notification scheduler initialized")
    
    def start(self):
        """Start the scheduler in a background thread"""
        if self.running:
            logger.warning("Scheduler is already running")
            return
        
        self.running = True
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        logger.info("Notification scheduler started")
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        if self.scheduler_thread:
            self.scheduler_thread.join(timeout=5)
        logger.info("Notification scheduler stopped")
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.running:
            try:
                schedule.run_pending()
                time.sleep(30)  # Check every 30 seconds
            except Exception as e:
                logger.error(f"Scheduler error: {str(e)}")
                time.sleep(60)  # Wait longer on error
    
    def _process_scheduled_notifications(self):
        """Process notifications scheduled for current time"""
        try:
            with self.app.app_context():
                processed_count = notification_service.process_scheduled_notifications()
                if processed_count > 0:
                    logger.info(f"Processed {processed_count} scheduled notifications")
        except Exception as e:
            logger.error(f"Failed to process scheduled notifications: {str(e)}")
    
    def _cleanup_old_notifications(self):
        """Clean up old notifications to prevent database bloat"""
        try:
            with self.app.app_context():
                # Delete notifications older than 90 days
                cutoff_date = datetime.utcnow() - timedelta(days=90)
                
                deleted_count = Notification.query.filter(
                    Notification.created_at < cutoff_date,
                    Notification.status.in_(['sent', 'failed'])
                ).delete()
                
                db.session.commit()
                
                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} old notifications")
                    
        except Exception as e:
            logger.error(f"Failed to cleanup old notifications: {str(e)}")
            db.session.rollback()
    
    def _send_daily_digest(self):
        """Send daily digest notifications to users who opted in"""
        try:
            with self.app.app_context():
                # This would send daily digest emails to users
                # Implementation depends on specific requirements
                logger.info("Daily digest processing completed")
        except Exception as e:
            logger.error(f"Failed to send daily digest: {str(e)}")
    
    def _send_weekly_summary(self):
        """Send weekly summary notifications"""
        try:
            with self.app.app_context():
                # This would send weekly summary emails
                # Implementation depends on specific requirements
                logger.info("Weekly summary processing completed")
        except Exception as e:
            logger.error(f"Failed to send weekly summary: {str(e)}")

# Global scheduler instance
notification_scheduler = NotificationScheduler()

class PostDemiseScheduler:
    """Specialized scheduler for post-demise notifications"""
    
    @staticmethod
    def schedule_post_demise_check(user_id, check_date):
        """Schedule a post-demise check for a specific date"""
        try:
            # This would integrate with external services to detect demise
            # For now, we'll create a placeholder notification
            
            notification_service.create_notification(
                user_id=user_id,
                notification_type='system',
                event='post_demise_check',
                subject='Post-Demise Check Scheduled',
                content=f'Post-demise check scheduled for {check_date}',
                scheduled_for=check_date,
                metadata={
                    'type': 'post_demise_check',
                    'check_date': check_date.isoformat()
                }
            )
            
            logger.info(f"Scheduled post-demise check for user {user_id} on {check_date}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to schedule post-demise check: {str(e)}")
            return False
    
    @staticmethod
    def trigger_post_demise_notifications(user_id, verification_data=None):
        """Trigger post-demise notifications for a user's beneficiaries"""
        try:
            from src.models.user import User
            from src.models.addendum import Addendum
            
            user = User.query.get(user_id)
            if not user:
                logger.error(f"User not found: {user_id}")
                return False
            
            # Get all addendums for the user
            addendums = Addendum.query.filter_by(user_id=user_id, is_active=True).all()
            
            for addendum in addendums:
                # Schedule notifications for each addendum's beneficiaries
                notification_service.schedule_post_demise_notifications(
                    addendum.id,
                    datetime.utcnow()
                )
            
            # Log the event
            notification_service.create_notification(
                user_id=user_id,
                notification_type='system',
                event='post_demise_triggered',
                subject='Post-Demise Notifications Triggered',
                content=f'Post-demise notifications triggered for {len(addendums)} addendums',
                metadata={
                    'type': 'post_demise_triggered',
                    'addendum_count': len(addendums),
                    'verification_data': verification_data
                }
            )
            
            logger.info(f"Triggered post-demise notifications for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to trigger post-demise notifications: {str(e)}")
            return False

class NotificationQueue:
    """Queue system for high-priority notifications"""
    
    def __init__(self):
        self.high_priority_queue = []
        self.normal_priority_queue = []
        self.processing = False
    
    def add_notification(self, notification_id, priority='normal'):
        """Add notification to appropriate queue"""
        if priority == 'high':
            self.high_priority_queue.append(notification_id)
        else:
            self.normal_priority_queue.append(notification_id)
        
        # Start processing if not already running
        if not self.processing:
            self._process_queue()
    
    def _process_queue(self):
        """Process notifications in priority order"""
        self.processing = True
        
        try:
            # Process high priority notifications first
            while self.high_priority_queue:
                notification_id = self.high_priority_queue.pop(0)
                notification_service.send_notification(notification_id)
            
            # Then process normal priority notifications
            while self.normal_priority_queue:
                notification_id = self.normal_priority_queue.pop(0)
                notification_service.send_notification(notification_id)
                
        except Exception as e:
            logger.error(f"Error processing notification queue: {str(e)}")
        finally:
            self.processing = False

# Global notification queue
notification_queue = NotificationQueue()

def init_notification_system(app):
    """Initialize the complete notification system"""
    try:
        # Initialize services
        notification_service.init_app(app)
        notification_scheduler.init_app(app)
        
        # Start scheduler in production
        if not app.config.get('TESTING', False):
            notification_scheduler.start()
        
        logger.info("Notification system initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize notification system: {str(e)}")
        raise

