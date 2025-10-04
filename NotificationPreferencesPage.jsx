import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Shield, CreditCard, FileText, Users, Save, Check } from 'lucide-react';

const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true,
    payment_confirmations: true,
    document_updates: true,
    post_demise_notifications: true
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mock API calls - replace with actual API integration
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Preferences would be fetched from API
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationTypes = [
    {
      key: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail className="w-5 h-5" />,
      category: 'general'
    },
    {
      key: 'sms_notifications',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: <MessageSquare className="w-5 h-5" />,
      category: 'general'
    },
    {
      key: 'push_notifications',
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: <Bell className="w-5 h-5" />,
      category: 'general'
    },
    {
      key: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      icon: <Shield className="w-5 h-5" />,
      category: 'security',
      required: true
    },
    {
      key: 'payment_confirmations',
      title: 'Payment Confirmations',
      description: 'Notifications about payment processing and confirmations',
      icon: <CreditCard className="w-5 h-5" />,
      category: 'transactional'
    },
    {
      key: 'document_updates',
      title: 'Document Updates',
      description: 'Notifications when your documents are ready or updated',
      icon: <FileText className="w-5 h-5" />,
      category: 'transactional'
    },
    {
      key: 'post_demise_notifications',
      title: 'Post-Demise Notifications',
      description: 'Enable notifications to beneficiaries after demise verification',
      icon: <Users className="w-5 h-5" />,
      category: 'estate'
    },
    {
      key: 'marketing_emails',
      title: 'Marketing Emails',
      description: 'Product updates, tips, and promotional content',
      icon: <Mail className="w-5 h-5" />,
      category: 'marketing'
    }
  ];

  const categories = {
    general: 'General Notifications',
    security: 'Security & Account',
    transactional: 'Transactional',
    estate: 'Estate Planning',
    marketing: 'Marketing & Updates'
  };

  const groupedNotifications = notificationTypes.reduce((acc, notification) => {
    if (!acc[notification.category]) {
      acc[notification.category] = [];
    }
    acc[notification.category].push(notification);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-gray-400">
            Manage how and when you receive notifications from Last Wish.
          </p>
        </div>

        {/* Preferences Form */}
        <div className="space-y-8">
          {Object.entries(groupedNotifications).map(([category, notifications]) => (
            <div key={category} className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                {categories[category]}
              </h2>
              
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.key}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-blue-400">
                        {notification.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">
                          {notification.title}
                          {notification.required && (
                            <span className="ml-2 text-xs bg-red-600 text-white px-2 py-1 rounded">
                              Required
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => !notification.required && handleToggle(notification.key)}
                        disabled={notification.required}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences[notification.key]
                            ? 'bg-blue-600'
                            : 'bg-gray-600'
                        } ${
                          notification.required
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[notification.key] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={savePreferences}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-medium text-white mb-2">Important Notes</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Security alerts cannot be disabled for account protection</li>
            <li>• Post-demise notifications are critical for estate planning functionality</li>
            <li>• You can update these preferences at any time</li>
            <li>• Some notifications may still be sent for legal or security reasons</li>
          </ul>
        </div>

        {/* Test Notification */}
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <h3 className="font-medium text-white mb-2">Test Notifications</h3>
          <p className="text-sm text-gray-400 mb-4">
            Send a test notification to verify your settings are working correctly.
          </p>
          <button
            onClick={() => {
              // Simulate sending test notification
              alert('Test notification sent! Check your email and notification center.');
            }}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Send Test Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;

