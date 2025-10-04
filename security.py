"""
Security Middleware for Last Wish Platform
Provides CSRF protection, rate limiting, input validation, and security headers
"""

import time
import hashlib
import secrets
from functools import wraps
from collections import defaultdict, deque
from datetime import datetime, timedelta
from flask import request, jsonify, current_app, session, g
from werkzeug.exceptions import TooManyRequests
import re
import ipaddress
from typing import Dict, List, Optional, Callable
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger('security')

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        self.requests = defaultdict(deque)
        self.blocked_ips = {}
    
    def is_allowed(self, identifier: str, limit: int, window: int) -> bool:
        """Check if request is allowed based on rate limit"""
        now = time.time()
        
        # Check if IP is temporarily blocked
        if identifier in self.blocked_ips:
            if now < self.blocked_ips[identifier]:
                return False
            else:
                del self.blocked_ips[identifier]
        
        # Clean old requests
        request_times = self.requests[identifier]
        while request_times and request_times[0] < now - window:
            request_times.popleft()
        
        # Check rate limit
        if len(request_times) >= limit:
            # Block IP for 15 minutes if severely over limit
            if len(request_times) > limit * 2:
                self.blocked_ips[identifier] = now + 900  # 15 minutes
                security_logger.warning(f"IP {identifier} blocked for excessive requests")
            return False
        
        # Add current request
        request_times.append(now)
        return True
    
    def get_client_identifier(self) -> str:
        """Get client identifier for rate limiting"""
        # Try to get real IP from headers (for reverse proxy setups)
        real_ip = request.headers.get('X-Real-IP')
        forwarded_for = request.headers.get('X-Forwarded-For')
        
        if real_ip:
            return real_ip
        elif forwarded_for:
            # Take the first IP in the chain
            return forwarded_for.split(',')[0].strip()
        else:
            return request.remote_addr or 'unknown'

class CSRFProtection:
    """CSRF protection implementation"""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(token: str) -> bool:
        """Validate CSRF token"""
        session_token = session.get('csrf_token')
        if not session_token or not token:
            return False
        
        # Use constant-time comparison to prevent timing attacks
        return secrets.compare_digest(session_token, token)
    
    @staticmethod
    def set_csrf_token():
        """Set CSRF token in session"""
        if 'csrf_token' not in session:
            session['csrf_token'] = CSRFProtection.generate_csrf_token()

class InputValidator:
    """Input validation and sanitization"""
    
    # Dangerous patterns that should be blocked
    DANGEROUS_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # Script tags
        r'javascript:',  # JavaScript URLs
        r'on\w+\s*=',  # Event handlers
        r'<iframe[^>]*>.*?</iframe>',  # Iframes
        r'<object[^>]*>.*?</object>',  # Objects
        r'<embed[^>]*>.*?</embed>',  # Embeds
        r'<link[^>]*>',  # Link tags
        r'<meta[^>]*>',  # Meta tags
        r'<style[^>]*>.*?</style>',  # Style tags
        r'expression\s*\(',  # CSS expressions
        r'url\s*\(',  # CSS URLs
        r'@import',  # CSS imports
    ]
    
    # SQL injection patterns
    SQL_INJECTION_PATTERNS = [
        r'(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)',
        r'(\b(OR|AND)\s+\d+\s*=\s*\d+)',
        r'(\b(OR|AND)\s+[\'"]?\w+[\'"]?\s*=\s*[\'"]?\w+[\'"]?)',
        r'(--|#|/\*|\*/)',
        r'(\bxp_\w+)',
        r'(\bsp_\w+)',
    ]
    
    @classmethod
    def validate_input(cls, data: str, max_length: int = 1000) -> Dict[str, any]:
        """Validate and sanitize input data"""
        if not isinstance(data, str):
            return {'valid': False, 'error': 'Input must be a string'}
        
        # Check length
        if len(data) > max_length:
            return {'valid': False, 'error': f'Input too long (max {max_length} characters)'}
        
        # Check for dangerous patterns
        for pattern in cls.DANGEROUS_PATTERNS:
            if re.search(pattern, data, re.IGNORECASE):
                security_logger.warning(f"Dangerous pattern detected: {pattern}")
                return {'valid': False, 'error': 'Input contains potentially dangerous content'}
        
        # Check for SQL injection
        for pattern in cls.SQL_INJECTION_PATTERNS:
            if re.search(pattern, data, re.IGNORECASE):
                security_logger.warning(f"SQL injection pattern detected: {pattern}")
                return {'valid': False, 'error': 'Input contains potentially malicious SQL'}
        
        # Sanitize the input
        sanitized = cls.sanitize_input(data)
        
        return {'valid': True, 'sanitized': sanitized}
    
    @classmethod
    def sanitize_input(cls, data: str) -> str:
        """Sanitize input data"""
        # Remove null bytes
        data = data.replace('\x00', '')
        
        # Normalize whitespace
        data = re.sub(r'\s+', ' ', data).strip()
        
        # Remove potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&']
        for char in dangerous_chars:
            data = data.replace(char, '')
        
        return data
    
    @classmethod
    def validate_email(cls, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email)) and len(email) <= 254
    
    @classmethod
    def validate_password(cls, password: str) -> Dict[str, any]:
        """Validate password strength"""
        if len(password) < 8:
            return {'valid': False, 'error': 'Password must be at least 8 characters long'}
        
        if len(password) > 128:
            return {'valid': False, 'error': 'Password too long (max 128 characters)'}
        
        # Check for required character types
        has_upper = bool(re.search(r'[A-Z]', password))
        has_lower = bool(re.search(r'[a-z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        
        score = sum([has_upper, has_lower, has_digit, has_special])
        
        if score < 3:
            return {
                'valid': False, 
                'error': 'Password must contain at least 3 of: uppercase, lowercase, numbers, special characters'
            }
        
        return {'valid': True, 'strength': 'strong' if score == 4 else 'medium'}

class SecurityHeaders:
    """Security headers middleware"""
    
    @staticmethod
    def add_security_headers(response):
        """Add security headers to response"""
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https: wss:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response.headers['Content-Security-Policy'] = csp
        
        # Other security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        return response

class SecurityMiddleware:
    """Main security middleware class"""
    
    def __init__(self, app=None):
        self.app = app
        self.rate_limiter = RateLimiter()
        self.failed_login_attempts = defaultdict(list)
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security middleware with Flask app"""
        app.before_request(self.before_request)
        app.after_request(self.after_request)
        
        # Set secure session configuration
        app.config.update(
            SESSION_COOKIE_SECURE=True,
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE='Lax',
            PERMANENT_SESSION_LIFETIME=timedelta(hours=24)
        )
    
    def before_request(self):
        """Process request before handling"""
        # Skip security checks for health endpoint
        if request.endpoint == 'health':
            return
        
        # Set CSRF token for session
        CSRFProtection.set_csrf_token()
        
        # Rate limiting
        client_ip = self.rate_limiter.get_client_identifier()
        
        # Different rate limits for different endpoints
        if request.endpoint and 'auth' in request.endpoint:
            # Stricter limits for auth endpoints
            if not self.rate_limiter.is_allowed(client_ip, limit=5, window=300):  # 5 requests per 5 minutes
                security_logger.warning(f"Rate limit exceeded for auth endpoint by {client_ip}")
                return jsonify({'error': 'Too many authentication attempts'}), 429
        else:
            # General API rate limit
            if not self.rate_limiter.is_allowed(client_ip, limit=100, window=60):  # 100 requests per minute
                security_logger.warning(f"Rate limit exceeded by {client_ip}")
                return jsonify({'error': 'Rate limit exceeded'}), 429
        
        # CSRF protection for state-changing requests
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            # Skip CSRF for API endpoints with proper authentication
            if not request.path.startswith('/api/'):
                csrf_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')
                if not CSRFProtection.validate_csrf_token(csrf_token):
                    security_logger.warning(f"CSRF token validation failed for {client_ip}")
                    return jsonify({'error': 'CSRF token validation failed'}), 403
        
        # Input validation for JSON requests
        if request.is_json and request.get_json():
            try:
                self.validate_json_input(request.get_json())
            except ValueError as e:
                security_logger.warning(f"Input validation failed: {str(e)}")
                return jsonify({'error': 'Invalid input data'}), 400
        
        # Log security events
        g.request_start_time = time.time()
        g.client_ip = client_ip
    
    def after_request(self, response):
        """Process response after handling"""
        # Add security headers
        response = SecurityHeaders.add_security_headers(response)
        
        # Log request
        if hasattr(g, 'request_start_time'):
            duration = time.time() - g.request_start_time
            security_logger.info(
                f"Request: {request.method} {request.path} "
                f"from {g.client_ip} "
                f"took {duration:.3f}s "
                f"status {response.status_code}"
            )
        
        return response
    
    def validate_json_input(self, data, max_depth=5, current_depth=0):
        """Recursively validate JSON input"""
        if current_depth > max_depth:
            raise ValueError("JSON structure too deep")
        
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(key, str):
                    validation = InputValidator.validate_input(key, max_length=100)
                    if not validation['valid']:
                        raise ValueError(f"Invalid key: {validation['error']}")
                
                if isinstance(value, str):
                    validation = InputValidator.validate_input(value, max_length=10000)
                    if not validation['valid']:
                        raise ValueError(f"Invalid value: {validation['error']}")
                elif isinstance(value, (dict, list)):
                    self.validate_json_input(value, max_depth, current_depth + 1)
        
        elif isinstance(data, list):
            if len(data) > 1000:  # Prevent large arrays
                raise ValueError("Array too large")
            
            for item in data:
                if isinstance(item, str):
                    validation = InputValidator.validate_input(item, max_length=10000)
                    if not validation['valid']:
                        raise ValueError(f"Invalid array item: {validation['error']}")
                elif isinstance(item, (dict, list)):
                    self.validate_json_input(item, max_depth, current_depth + 1)
    
    def track_failed_login(self, identifier: str):
        """Track failed login attempts"""
        now = datetime.utcnow()
        attempts = self.failed_login_attempts[identifier]
        
        # Clean old attempts (older than 1 hour)
        attempts[:] = [attempt for attempt in attempts if now - attempt < timedelta(hours=1)]
        
        # Add current attempt
        attempts.append(now)
        
        # Check if account should be locked
        if len(attempts) >= 5:  # 5 failed attempts in 1 hour
            security_logger.warning(f"Account locked due to failed login attempts: {identifier}")
            return True
        
        return False
    
    def is_account_locked(self, identifier: str) -> bool:
        """Check if account is locked due to failed attempts"""
        now = datetime.utcnow()
        attempts = self.failed_login_attempts.get(identifier, [])
        
        # Clean old attempts
        attempts[:] = [attempt for attempt in attempts if now - attempt < timedelta(hours=1)]
        
        return len(attempts) >= 5
    
    def clear_failed_attempts(self, identifier: str):
        """Clear failed login attempts for successful login"""
        if identifier in self.failed_login_attempts:
            del self.failed_login_attempts[identifier]

# Decorators for additional security
def require_csrf(f):
    """Decorator to require CSRF token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        csrf_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')
        if not CSRFProtection.validate_csrf_token(csrf_token):
            return jsonify({'error': 'CSRF token required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(limit: int, window: int):
    """Decorator for custom rate limiting"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            rate_limiter = RateLimiter()
            client_ip = rate_limiter.get_client_identifier()
            
            if not rate_limiter.is_allowed(client_ip, limit, window):
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def validate_input_data(schema: Dict):
    """Decorator to validate input data against schema"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.is_json:
                data = request.get_json()
                for field, rules in schema.items():
                    if field in data:
                        value = data[field]
                        if 'type' in rules and not isinstance(value, rules['type']):
                            return jsonify({'error': f'Invalid type for {field}'}), 400
                        if 'max_length' in rules and isinstance(value, str) and len(value) > rules['max_length']:
                            return jsonify({'error': f'{field} too long'}), 400
                        if 'required' in rules and rules['required'] and not value:
                            return jsonify({'error': f'{field} is required'}), 400
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

