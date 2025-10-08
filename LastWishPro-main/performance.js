/**
 * Performance Optimization Utilities for Last Wish Platform Frontend
 * Provides lazy loading, caching, code splitting, and performance monitoring
 */

import { lazy, Suspense, createElement } from 'react';

// Lazy loading utilities
export class LazyLoader {
  /**
   * Create a lazy-loaded component with error boundary
   * @param {Function} importFunc - Dynamic import function
   * @param {Object} fallback - Fallback component while loading
   * @returns {React.Component} - Lazy component with suspense
   */
  static createLazyComponent(importFunc, fallback = null) {
    const LazyComponent = lazy(importFunc);
    
    return function LazyWrapper(props) {
      return createElement(
        Suspense,
        { 
          fallback: fallback || createElement('div', { 
            className: 'loading-spinner' 
          }, 'Loading...') 
        },
        createElement(LazyComponent, props)
      );
    };
  }

  /**
   * Preload a component for better performance
   * @param {Function} importFunc - Dynamic import function
   */
  static preloadComponent(importFunc) {
    const componentImport = importFunc();
    return componentImport;
  }

  /**
   * Create intersection observer for lazy loading images
   * @param {Object} options - Intersection observer options
   * @returns {IntersectionObserver} - Observer instance
   */
  static createImageObserver(options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
            this.unobserve(img);
          }
        }
      });
    }, defaultOptions);
  }
}

// Caching utilities
export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  /**
   * Set item in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = this.ttl) {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Clear expired items from cache
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hitRate || 0
    };
  }
}

// API caching with fetch wrapper
export class APICache {
  constructor() {
    this.cache = new CacheManager();
    this.pendingRequests = new Map();
  }

  /**
   * Cached fetch wrapper
   * @param {string} url - Request URL
   * @param {Object} options - Fetch options
   * @param {number} cacheTTL - Cache TTL in milliseconds
   * @returns {Promise} - Fetch promise
   */
  async fetch(url, options = {}, cacheTTL = 5 * 60 * 1000) {
    const cacheKey = this.generateCacheKey(url, options);
    
    // Check cache first
    const cachedResponse = this.cache.get(cacheKey);
    if (cachedResponse) {
      return Promise.resolve(cachedResponse);
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Make new request
    const requestPromise = fetch(url, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Cache successful response
        this.cache.set(cacheKey, data, cacheTTL);
        this.pendingRequests.delete(cacheKey);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(cacheKey);
        throw error;
      });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  /**
   * Generate cache key from URL and options
   * @param {string} url - Request URL
   * @param {Object} options - Request options
   * @returns {string} - Cache key
   */
  generateCacheKey(url, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Invalidate cache for specific pattern
   * @param {string} pattern - URL pattern to invalidate
   */
  invalidate(pattern) {
    for (const key of this.cache.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.cache.delete(key);
      }
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    
    this.observers = [];
    this.initializeObservers();
  }

  /**
   * Initialize performance observers
   */
  initializeObservers() {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
        
        // First Contentful Paint
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.firstContentfulPaint = fcpEntry.startTime;
        }
      }, 0);
    });
  }

  /**
   * Get current performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Log performance metrics to console
   */
  logMetrics() {
    console.group('🚀 Performance Metrics');
    console.log('Page Load Time:', `${this.metrics.pageLoadTime.toFixed(2)}ms`);
    console.log('First Contentful Paint:', `${this.metrics.firstContentfulPaint.toFixed(2)}ms`);
    console.log('Largest Contentful Paint:', `${this.metrics.largestContentfulPaint.toFixed(2)}ms`);
    console.log('Cumulative Layout Shift:', this.metrics.cumulativeLayoutShift.toFixed(4));
    console.log('First Input Delay:', `${this.metrics.firstInputDelay.toFixed(2)}ms`);
    console.groupEnd();
  }

  /**
   * Send metrics to analytics service
   * @param {string} endpoint - Analytics endpoint
   */
  async sendMetrics(endpoint) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.metrics,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          url: window.location.href
        })
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }

  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Image optimization utilities
export class ImageOptimizer {
  /**
   * Create responsive image with lazy loading
   * @param {Object} props - Image properties
   * @returns {JSX.Element} - Optimized image component
   */
  static createResponsiveImage({ src, alt, className, sizes, loading = 'lazy' }) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        sizes={sizes}
        loading={loading}
        decoding="async"
        onLoad={(e) => {
          e.target.classList.add('loaded');
        }}
        onError={(e) => {
          e.target.classList.add('error');
          console.error('Image failed to load:', src);
        }}
      />
    );
  }

  /**
   * Preload critical images
   * @param {Array} imageSources - Array of image URLs
   */
  static preloadImages(imageSources) {
    imageSources.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  /**
   * Convert image to WebP if supported
   * @param {string} src - Original image source
   * @returns {string} - WebP source if supported, original otherwise
   */
  static getOptimizedSrc(src) {
    const supportsWebP = this.supportsWebP();
    if (supportsWebP && !src.includes('.webp')) {
      return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return src;
  }

  /**
   * Check if browser supports WebP
   * @returns {boolean} - WebP support status
   */
  static supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  /**
   * Dynamically import modules based on conditions
   * @param {Object} modules - Module import functions
   * @param {string} condition - Condition to determine which module to load
   * @returns {Promise} - Module import promise
   */
  static async conditionalImport(modules, condition) {
    const moduleKey = Object.keys(modules).find(key => key === condition);
    if (moduleKey && modules[moduleKey]) {
      return await modules[moduleKey]();
    }
    throw new Error(`Module not found for condition: ${condition}`);
  }

  /**
   * Preload route components
   * @param {Array} routes - Array of route import functions
   */
  static preloadRoutes(routes) {
    // Preload routes on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        routes.forEach(routeImport => {
          routeImport();
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        routes.forEach(routeImport => {
          routeImport();
        });
      }, 2000);
    }
  }
}

// Memory management utilities
export class MemoryManager {
  constructor() {
    this.cleanupTasks = [];
    this.memoryThreshold = 50 * 1024 * 1024; // 50MB
  }

  /**
   * Register cleanup task
   * @param {Function} cleanupFn - Cleanup function
   */
  registerCleanup(cleanupFn) {
    this.cleanupTasks.push(cleanupFn);
  }

  /**
   * Run all cleanup tasks
   */
  cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  /**
   * Monitor memory usage
   */
  monitorMemory() {
    if ('memory' in performance) {
      const memInfo = performance.memory;
      const usedMemory = memInfo.usedJSHeapSize;
      
      if (usedMemory > this.memoryThreshold) {
        console.warn('High memory usage detected:', usedMemory);
        this.cleanup();
        
        // Force garbage collection if available
        if (window.gc) {
          window.gc();
        }
      }
    }
  }

  /**
   * Get memory usage information
   * @returns {Object} - Memory usage stats
   */
  getMemoryInfo() {
    if ('memory' in performance) {
      const memInfo = performance.memory;
      return {
        used: memInfo.usedJSHeapSize,
        total: memInfo.totalJSHeapSize,
        limit: memInfo.jsHeapSizeLimit,
        usedMB: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(memInfo.totalJSHeapSize / 1024 / 1024)
      };
    }
    return null;
  }
}

// Global instances
export const globalCache = new CacheManager();
export const apiCache = new APICache();
export const performanceMonitor = new PerformanceMonitor();
export const memoryManager = new MemoryManager();

// Initialize performance optimizations
export function initializePerformance() {
  // Start performance monitoring
  performanceMonitor.initializeObservers();
  
  // Start memory monitoring
  setInterval(() => {
    memoryManager.monitorMemory();
  }, 30000); // Check every 30 seconds
  
  // Cleanup cache periodically
  setInterval(() => {
    globalCache.cleanup();
    apiCache.cache.cleanup();
  }, 60000); // Cleanup every minute
  
  // Log performance metrics in development
  if (process.env.NODE_ENV === 'development') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitor.logMetrics();
      }, 2000);
    });
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    memoryManager.cleanup();
    performanceMonitor.cleanup();
  });
}

// Export all utilities
export default {
  LazyLoader,
  CacheManager,
  APICache,
  PerformanceMonitor,
  ImageOptimizer,
  BundleOptimizer,
  MemoryManager,
  globalCache,
  apiCache,
  performanceMonitor,
  memoryManager,
  initializePerformance
};

