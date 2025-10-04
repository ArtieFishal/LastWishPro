/**
 * Accessibility Utilities for Last Wish Platform
 * Provides WCAG 2.1 compliance features and accessibility helpers
 */

// Screen reader utilities
export class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level (polite, assertive, off)
   */
  static announce(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Create screen reader only text
   * @param {string} text - Text for screen readers only
   * @returns {HTMLElement} - Hidden element with text
   */
  static createSROnlyText(text) {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }

  /**
   * Update page title for screen readers
   * @param {string} title - New page title
   */
  static updatePageTitle(title) {
    document.title = `${title} - Last Wish Platform`;
    this.announce(`Navigated to ${title}`);
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  /**
   * Initialize keyboard navigation for a container
   * @param {HTMLElement} container - Container element
   * @param {string} selector - Selector for focusable elements
   */
  static initializeContainer(container, selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') {
    const focusableElements = container.querySelectorAll(selector);
    let currentIndex = 0;

    container.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          currentIndex = (currentIndex + 1) % focusableElements.length;
          focusableElements[currentIndex].focus();
          break;
        
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          currentIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[currentIndex].focus();
          break;
        
        case 'Home':
          e.preventDefault();
          currentIndex = 0;
          focusableElements[currentIndex].focus();
          break;
        
        case 'End':
          e.preventDefault();
          currentIndex = focusableElements.length - 1;
          focusableElements[currentIndex].focus();
          break;
      }
    });

    return {
      focusFirst: () => {
        currentIndex = 0;
        focusableElements[currentIndex]?.focus();
      },
      focusLast: () => {
        currentIndex = focusableElements.length - 1;
        focusableElements[currentIndex]?.focus();
      }
    };
  }

  /**
   * Trap focus within a modal or dialog
   * @param {HTMLElement} element - Element to trap focus within
   */
  static trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Handle escape key to close modals
   * @param {Function} closeCallback - Function to call when escape is pressed
   */
  static handleEscapeKey(closeCallback) {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeCallback();
      }
    };

    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }
}

// Color contrast utilities
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   * @param {string} color - Hex color code
   * @returns {number} - Relative luminance
   */
  static getRelativeLuminance(color) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} - Contrast ratio
   */
  static getContrastRatio(color1, color2) {
    const lum1 = this.getRelativeLuminance(color1);
    const lum2 = this.getRelativeLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if color combination meets WCAG contrast requirements
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} level - WCAG level (AA or AAA)
   * @param {string} size - Text size (normal or large)
   * @returns {boolean} - Whether combination meets requirements
   */
  static meetsWCAGRequirements(foreground, background, level = 'AA', size = 'normal') {
    const ratio = this.getContrastRatio(foreground, background);
    
    const requirements = {
      'AA': { normal: 4.5, large: 3 },
      'AAA': { normal: 7, large: 4.5 }
    };
    
    return ratio >= requirements[level][size];
  }

  /**
   * Convert hex color to RGB
   * @param {string} hex - Hex color code
   * @returns {Object|null} - RGB object or null if invalid
   */
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

// Form accessibility utilities
export class FormAccessibility {
  /**
   * Associate labels with form controls
   * @param {HTMLElement} form - Form element
   */
  static associateLabels(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (!input.id) {
        input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Find associated label
      let label = form.querySelector(`label[for="${input.id}"]`);
      if (!label) {
        label = input.closest('label');
      }
      
      if (label && !label.getAttribute('for')) {
        label.setAttribute('for', input.id);
      }
    });
  }

  /**
   * Add ARIA attributes for form validation
   * @param {HTMLElement} input - Input element
   * @param {string} errorMessage - Error message
   */
  static addValidationAttributes(input, errorMessage = '') {
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (errorMessage) {
      // Add error state
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        input.parentNode.insertBefore(errorElement, input.nextSibling);
      }
      
      errorElement.textContent = errorMessage;
      ScreenReaderUtils.announce(`Error: ${errorMessage}`, 'assertive');
    } else {
      // Remove error state
      input.setAttribute('aria-invalid', 'false');
      input.removeAttribute('aria-describedby');
      
      if (errorElement) {
        errorElement.remove();
      }
    }
  }

  /**
   * Add progress indicators for multi-step forms
   * @param {number} currentStep - Current step number
   * @param {number} totalSteps - Total number of steps
   * @param {HTMLElement} container - Container for progress indicator
   */
  static addProgressIndicator(currentStep, totalSteps, container) {
    const progressText = `Step ${currentStep} of ${totalSteps}`;
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    
    container.innerHTML = `
      <div role="progressbar" 
           aria-valuenow="${currentStep}" 
           aria-valuemin="1" 
           aria-valuemax="${totalSteps}"
           aria-valuetext="${progressText}">
        <div class="progress-bar" style="width: ${progressPercent}%"></div>
        <span class="sr-only">${progressText}</span>
      </div>
    `;
    
    ScreenReaderUtils.announce(progressText);
  }
}

// Modal accessibility utilities
export class ModalAccessibility {
  /**
   * Make a modal accessible
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} trigger - Element that triggered the modal
   */
  static makeAccessible(modal, trigger) {
    // Set ARIA attributes
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Find title element
    const title = modal.querySelector('h1, h2, h3, h4, h5, h6, [data-modal-title]');
    if (title) {
      if (!title.id) {
        title.id = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
      }
      modal.setAttribute('aria-labelledby', title.id);
    }
    
    // Find description element
    const description = modal.querySelector('[data-modal-description]');
    if (description) {
      if (!description.id) {
        description.id = `modal-desc-${Math.random().toString(36).substr(2, 9)}`;
      }
      modal.setAttribute('aria-describedby', description.id);
    }
    
    // Trap focus
    const removeFocusTrap = KeyboardNavigation.trapFocus(modal);
    
    // Handle escape key
    const removeEscapeHandler = KeyboardNavigation.handleEscapeKey(() => {
      this.close(modal, trigger);
    });
    
    // Store cleanup functions
    modal._accessibilityCleanup = () => {
      removeFocusTrap();
      removeEscapeHandler();
    };
    
    // Announce modal opening
    ScreenReaderUtils.announce('Dialog opened', 'assertive');
  }

  /**
   * Close modal and restore focus
   * @param {HTMLElement} modal - Modal element
   * @param {HTMLElement} trigger - Original trigger element
   */
  static close(modal, trigger) {
    // Clean up accessibility handlers
    if (modal._accessibilityCleanup) {
      modal._accessibilityCleanup();
      delete modal._accessibilityCleanup;
    }
    
    // Hide modal
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    
    // Restore focus to trigger
    if (trigger) {
      trigger.focus();
    }
    
    // Announce modal closing
    ScreenReaderUtils.announce('Dialog closed');
  }
}

// Skip links utility
export class SkipLinks {
  /**
   * Add skip links to page
   * @param {Array} links - Array of skip link objects {href, text}
   */
  static addSkipLinks(links = []) {
    const defaultLinks = [
      { href: '#main-content', text: 'Skip to main content' },
      { href: '#navigation', text: 'Skip to navigation' },
      { href: '#footer', text: 'Skip to footer' }
    ];
    
    const allLinks = [...defaultLinks, ...links];
    
    const skipContainer = document.createElement('div');
    skipContainer.className = 'skip-links';
    skipContainer.innerHTML = allLinks.map(link => 
      `<a href="${link.href}" class="skip-link">${link.text}</a>`
    ).join('');
    
    document.body.insertBefore(skipContainer, document.body.firstChild);
  }
}

// High contrast mode detection
export class HighContrastMode {
  /**
   * Detect if user prefers high contrast
   * @returns {boolean} - Whether high contrast is preferred
   */
  static isEnabled() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Listen for high contrast mode changes
   * @param {Function} callback - Callback function
   */
  static onChange(callback) {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }

  /**
   * Apply high contrast styles
   */
  static applyStyles() {
    document.body.classList.add('high-contrast');
  }

  /**
   * Remove high contrast styles
   */
  static removeStyles() {
    document.body.classList.remove('high-contrast');
  }
}

// Reduced motion detection
export class ReducedMotion {
  /**
   * Detect if user prefers reduced motion
   * @returns {boolean} - Whether reduced motion is preferred
   */
  static isEnabled() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Listen for reduced motion preference changes
   * @param {Function} callback - Callback function
   */
  static onChange(callback) {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addListener(callback);
    return () => mediaQuery.removeListener(callback);
  }

  /**
   * Disable animations if reduced motion is preferred
   */
  static respectPreference() {
    if (this.isEnabled()) {
      document.body.classList.add('reduce-motion');
    }
  }
}

// Accessibility checker
export class AccessibilityChecker {
  /**
   * Run basic accessibility checks on page
   * @returns {Array} - Array of accessibility issues
   */
  static checkPage() {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        issues.push({
          type: 'missing-alt-text',
          element: img,
          message: `Image ${index + 1} is missing alt text`
        });
      }
    });
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const label = document.querySelector(`label[for="${input.id}"]`) || input.closest('label');
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push({
          type: 'missing-label',
          element: input,
          message: `Form control ${index + 1} is missing a label`
        });
      }
    });
    
    // Check for missing headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push({
        type: 'missing-headings',
        message: 'Page has no heading elements'
      });
    }
    
    // Check heading hierarchy
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          element: heading,
          message: `Heading ${index + 1} skips levels (h${lastLevel} to h${level})`
        });
      }
      lastLevel = level;
    });
    
    // Check for color contrast (basic check)
    const textElements = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // This is a simplified check - in practice, you'd need more sophisticated color parsing
      if (color === backgroundColor) {
        issues.push({
          type: 'color-contrast',
          element: element,
          message: `Element ${index + 1} may have insufficient color contrast`
        });
      }
    });
    
    return issues;
  }

  /**
   * Log accessibility issues to console
   * @param {Array} issues - Array of accessibility issues
   */
  static logIssues(issues) {
    if (issues.length === 0) {
      console.log('✅ No accessibility issues found');
      return;
    }
    
    console.group('🚨 Accessibility Issues Found');
    issues.forEach(issue => {
      console.warn(`${issue.type}: ${issue.message}`, issue.element);
    });
    console.groupEnd();
  }
}

// Initialize accessibility features
export function initializeAccessibility() {
  // Add skip links
  SkipLinks.addSkipLinks();
  
  // Respect user preferences
  ReducedMotion.respectPreference();
  
  // Apply high contrast if needed
  if (HighContrastMode.isEnabled()) {
    HighContrastMode.applyStyles();
  }
  
  // Listen for preference changes
  HighContrastMode.onChange((e) => {
    if (e.matches) {
      HighContrastMode.applyStyles();
    } else {
      HighContrastMode.removeStyles();
    }
  });
  
  ReducedMotion.onChange((e) => {
    if (e.matches) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  });
  
  // Run accessibility check in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      const issues = AccessibilityChecker.checkPage();
      AccessibilityChecker.logIssues(issues);
    }, 1000);
  }
}

// Export all utilities
export default {
  ScreenReaderUtils,
  KeyboardNavigation,
  ColorContrast,
  FormAccessibility,
  ModalAccessibility,
  SkipLinks,
  HighContrastMode,
  ReducedMotion,
  AccessibilityChecker,
  initializeAccessibility
};

