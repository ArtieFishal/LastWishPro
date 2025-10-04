"""
Performance Optimization Utilities for Last Wish Platform
Provides caching, database optimization, and response compression
"""

import time
import gzip
import json
import hashlib
from functools import wraps
from typing import Dict, Any, Optional, Callable
from flask import request, current_app, g, jsonify
from werkzeug.exceptions import RequestEntityTooLarge
import redis
import pickle
from datetime import datetime, timedelta
import logging

# Configure logging
performance_logger = logging.getLogger('performance')

class CacheManager:
    """Redis-based caching manager"""
    
    def __init__(self, redis_url: str = None, default_timeout: int = 3600):
        """Initialize cache manager"""
        self.redis_url = redis_url or 'redis://localhost:6379/0'
        self.default_timeout = default_timeout
        self.redis_client = None
        self._connect()
    
    def _connect(self):
        """Connect to Redis"""
        try:
            self.redis_client = redis.from_url(self.redis_url, decode_responses=False)
            self.redis_client.ping()
            performance_logger.info("Connected to Redis cache")
        except Exception as e:
            performance_logger.warning(f"Redis connection failed: {e}. Using in-memory cache.")
            self.redis_client = None
    
    def get(self, key: str) -> Any:
        """Get value from cache"""
        try:
            if self.redis_client:
                data = self.redis_client.get(key)
                if data:
                    return pickle.loads(data)
            return None
        except Exception as e:
            performance_logger.error(f"Cache get error: {e}")
            return None
    
    def set(self, key: str, value: Any, timeout: int = None) -> bool:
        """Set value in cache"""
        try:
            if self.redis_client:
                timeout = timeout or self.default_timeout
                data = pickle.dumps(value)
                return self.redis_client.setex(key, timeout, data)
            return False
        except Exception as e:
            performance_logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            if self.redis_client:
                return bool(self.redis_client.delete(key))
            return False
        except Exception as e:
            performance_logger.error(f"Cache delete error: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        try:
            if self.redis_client:
                keys = self.redis_client.keys(pattern)
                if keys:
                    return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            performance_logger.error(f"Cache clear pattern error: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        try:
            if self.redis_client:
                info = self.redis_client.info()
                return {
                    'connected_clients': info.get('connected_clients', 0),
                    'used_memory': info.get('used_memory_human', '0B'),
                    'keyspace_hits': info.get('keyspace_hits', 0),
                    'keyspace_misses': info.get('keyspace_misses', 0),
                    'hit_rate': self._calculate_hit_rate(info)
                }
            return {'status': 'disconnected'}
        except Exception as e:
            performance_logger.error(f"Cache stats error: {e}")
            return {'error': str(e)}
    
    def _calculate_hit_rate(self, info: Dict) -> float:
        """Calculate cache hit rate"""
        hits = info.get('keyspace_hits', 0)
        misses = info.get('keyspace_misses', 0)
        total = hits + misses
        return (hits / total * 100) if total > 0 else 0.0

class DatabaseOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def log_slow_queries(threshold: float = 1.0):
        """Decorator to log slow database queries"""
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                start_time = time.time()
                result = f(*args, **kwargs)
                duration = time.time() - start_time
                
                if duration > threshold:
                    performance_logger.warning(
                        f"Slow query detected: {f.__name__} took {duration:.3f}s"
                    )
                
                return result
            return decorated_function
        return decorator
    
    @staticmethod
    def batch_operations(batch_size: int = 100):
        """Decorator for batch database operations"""
        def decorator(f):
            @wraps(f)
            def decorated_function(items, *args, **kwargs):
                results = []
                for i in range(0, len(items), batch_size):
                    batch = items[i:i + batch_size]
                    batch_result = f(batch, *args, **kwargs)
                    results.extend(batch_result if isinstance(batch_result, list) else [batch_result])
                return results
            return decorated_function
        return decorator
    
    @staticmethod
    def optimize_query_params(query_params: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize query parameters for better performance"""
        optimized = {}
        
        # Limit result size
        if 'limit' not in query_params:
            optimized['limit'] = 100
        else:
            optimized['limit'] = min(query_params['limit'], 1000)
        
        # Add offset for pagination
        if 'page' in query_params:
            page = max(1, query_params['page'])
            optimized['offset'] = (page - 1) * optimized['limit']
        
        # Copy other parameters
        for key, value in query_params.items():
            if key not in ['page', 'limit']:
                optimized[key] = value
        
        return optimized

class ResponseCompressor:
    """Response compression utilities"""
    
    @staticmethod
    def compress_response(data: str, compression_level: int = 6) -> bytes:
        """Compress response data using gzip"""
        try:
            return gzip.compress(data.encode('utf-8'), compresslevel=compression_level)
        except Exception as e:
            performance_logger.error(f"Compression error: {e}")
            return data.encode('utf-8')
    
    @staticmethod
    def should_compress(content_type: str, content_length: int) -> bool:
        """Determine if response should be compressed"""
        # Only compress text-based content
        compressible_types = [
            'application/json',
            'text/html',
            'text/css',
            'text/javascript',
            'application/javascript',
            'text/plain'
        ]
        
        # Only compress if content is large enough
        min_size = 1024  # 1KB
        
        return any(ct in content_type for ct in compressible_types) and content_length > min_size

class PerformanceMonitor:
    """Performance monitoring utilities"""
    
    def __init__(self):
        self.request_times = []
        self.slow_requests = []
        self.error_count = 0
    
    def start_request_timing(self):
        """Start timing a request"""
        g.request_start_time = time.time()
    
    def end_request_timing(self, response):
        """End timing a request and log performance"""
        if hasattr(g, 'request_start_time'):
            duration = time.time() - g.request_start_time
            
            # Log request timing
            self.request_times.append(duration)
            
            # Keep only last 1000 requests
            if len(self.request_times) > 1000:
                self.request_times = self.request_times[-1000:]
            
            # Log slow requests
            if duration > 2.0:  # 2 seconds threshold
                slow_request = {
                    'path': request.path,
                    'method': request.method,
                    'duration': duration,
                    'timestamp': datetime.utcnow().isoformat()
                }
                self.slow_requests.append(slow_request)
                performance_logger.warning(f"Slow request: {request.method} {request.path} took {duration:.3f}s")
            
            # Add performance headers
            response.headers['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
    
    def get_performance_stats(self) -> Dict[str, Any]:
        """Get performance statistics"""
        if not self.request_times:
            return {'status': 'no_data'}
        
        avg_time = sum(self.request_times) / len(self.request_times)
        max_time = max(self.request_times)
        min_time = min(self.request_times)
        
        # Calculate percentiles
        sorted_times = sorted(self.request_times)
        p95_index = int(len(sorted_times) * 0.95)
        p99_index = int(len(sorted_times) * 0.99)
        
        return {
            'total_requests': len(self.request_times),
            'average_response_time': round(avg_time, 3),
            'max_response_time': round(max_time, 3),
            'min_response_time': round(min_time, 3),
            'p95_response_time': round(sorted_times[p95_index], 3),
            'p99_response_time': round(sorted_times[p99_index], 3),
            'slow_requests_count': len(self.slow_requests),
            'error_count': self.error_count
        }

class MemoryOptimizer:
    """Memory optimization utilities"""
    
    @staticmethod
    def optimize_json_response(data: Any) -> str:
        """Optimize JSON response for memory efficiency"""
        try:
            # Use compact JSON encoding
            return json.dumps(data, separators=(',', ':'), ensure_ascii=False)
        except Exception as e:
            performance_logger.error(f"JSON optimization error: {e}")
            return json.dumps(data)
    
    @staticmethod
    def paginate_large_datasets(query, page: int = 1, per_page: int = 50) -> Dict[str, Any]:
        """Paginate large datasets for memory efficiency"""
        try:
            # Limit per_page to prevent memory issues
            per_page = min(per_page, 100)
            
            # Calculate offset
            offset = (page - 1) * per_page
            
            # Get total count (this might be expensive for very large datasets)
            total = query.count()
            
            # Get paginated results
            items = query.offset(offset).limit(per_page).all()
            
            # Calculate pagination info
            total_pages = (total + per_page - 1) // per_page
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'items': [item.to_dict() if hasattr(item, 'to_dict') else item for item in items],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': total,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                }
            }
        except Exception as e:
            performance_logger.error(f"Pagination error: {e}")
            return {'items': [], 'pagination': {}}

# Global instances
cache_manager = None
performance_monitor = None

def init_performance_tools(app):
    """Initialize performance tools"""
    global cache_manager, performance_monitor
    
    # Initialize cache manager
    redis_url = app.config.get('REDIS_URL', 'redis://localhost:6379/0')
    cache_manager = CacheManager(redis_url)
    
    # Initialize performance monitor
    performance_monitor = PerformanceMonitor()
    
    # Add request hooks
    app.before_request(performance_monitor.start_request_timing)
    app.after_request(performance_monitor.end_request_timing)
    
    return cache_manager, performance_monitor

# Decorators for performance optimization
def cache_result(timeout: int = 3600, key_prefix: str = ''):
    """Decorator to cache function results"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not cache_manager:
                return f(*args, **kwargs)
            
            # Generate cache key
            key_parts = [key_prefix, f.__name__]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
            cache_key = hashlib.md5(':'.join(key_parts).encode()).hexdigest()
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = f(*args, **kwargs)
            cache_manager.set(cache_key, result, timeout)
            
            return result
        return decorated_function
    return decorator

def monitor_performance(threshold: float = 1.0):
    """Decorator to monitor function performance"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            try:
                result = f(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                if duration > threshold:
                    performance_logger.warning(
                        f"Performance warning: {f.__name__} took {duration:.3f}s"
                    )
        return decorated_function
    return decorator

def compress_response(f):
    """Decorator to compress response data"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        result = f(*args, **kwargs)
        
        # Check if client accepts gzip
        if 'gzip' in request.headers.get('Accept-Encoding', ''):
            if isinstance(result, tuple) and len(result) >= 2:
                data, status_code = result[0], result[1]
                headers = result[2] if len(result) > 2 else {}
            else:
                data, status_code, headers = result, 200, {}
            
            # Convert to JSON if needed
            if not isinstance(data, str):
                data = MemoryOptimizer.optimize_json_response(data)
            
            # Check if should compress
            content_type = headers.get('Content-Type', 'application/json')
            if ResponseCompressor.should_compress(content_type, len(data)):
                compressed_data = ResponseCompressor.compress_response(data)
                headers.update({
                    'Content-Encoding': 'gzip',
                    'Content-Length': str(len(compressed_data))
                })
                return compressed_data, status_code, headers
        
        return result
    return decorated_function

def optimize_database_query(f):
    """Decorator to optimize database queries"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Add query optimization logic here
        start_time = time.time()
        result = f(*args, **kwargs)
        duration = time.time() - start_time
        
        if duration > 0.5:  # Log queries taking more than 500ms
            performance_logger.info(f"Database query {f.__name__} took {duration:.3f}s")
        
        return result
    return decorated_function

