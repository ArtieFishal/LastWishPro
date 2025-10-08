import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { useEffect } from 'react'

// Layout Components
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/layout/AuthLayout'

// Pages
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { WalletsPage } from './pages/wallets/WalletsPage'
import { AddendumPage } from './pages/addendum/AddendumPage'
import { PaymentPage } from './pages/payment/PaymentPage'
import LegalPage from './pages/legal/LegalPage';
import LegalGuidancePage from './pages/legal/LegalGuidancePage';
import { NotFoundPage } from './pages/NotFoundPage'
import { WalletTestPage } from './pages/WalletTestPage'
import AddendumTestSimple from './pages/AddendumTestSimple'
import NotificationPreferencesPage from './pages/notifications/NotificationPreferencesPage'

// Context Providers
import { AuthProvider } from './contexts/AuthContext'
import { WalletProvider } from './contexts/WalletContext'
import { Web3Provider } from './contexts/Web3Context'
import { PaymentProvider } from './contexts/PaymentContext'

// Protected Route Component
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Utilities
import { initializeAccessibility } from './utils/accessibility'
import { initializePerformance } from './utils/performance'

// Global Styles
import './globals.css'
import './styles/accessibility.css'

function App() {
  useEffect(() => {
    // Initialize accessibility features
    initializeAccessibility();
    
    // Initialize performance monitoring
    initializePerformance();
    
    // Set page title and meta information
    document.title = 'Last Wish - Secure Your Crypto Legacy';
    
    // Add meta description if not present
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      metaDescription.content = 'Last Wish helps you create notarizable addendums to your will for cryptocurrency assets. Secure your digital legacy for your loved ones.';
      document.head.appendChild(metaDescription);
    }
    
    // Add lang attribute to html element
    document.documentElement.lang = 'en';
    
    // Add main landmark if not present
    const main = document.getElementById('main-content');
    if (!main) {
      const mainElement = document.createElement('main');
      mainElement.id = 'main-content';
      mainElement.setAttribute('role', 'main');
      document.body.appendChild(mainElement);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Web3Provider>
        <AuthProvider>
          <WalletProvider>
            <PaymentProvider>
              <Router>
                <div className="min-h-screen bg-black text-white">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/wallet-test" element={<WalletTestPage />} />
                    <Route path="/addendum-test" element={<AddendumTestSimple />} />
                    <Route path="/payment-test" element={<PaymentPage />} />

                    {/* Authentication Routes */}
                    <Route path="/auth" element={<AuthLayout />}>
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="reset-password" element={<ResetPasswordPage />} />
                    </Route>

                    {/* Protected App Routes */}
                    <Route path="/app" element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="/app/dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="wallets" element={<WalletsPage />} />
                      <Route path="addendum" element={<AddendumPage />} />
                      <Route path="payment" element={<PaymentPage />} />
                      <Route path="legal" element={<LegalPage />} />
                      <Route path="legal-guidance" element={<LegalGuidancePage />} />
                      <Route path="notifications" element={<NotificationPreferencesPage />} />
                    </Route>

                    {/* Catch all route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  
                  {/* Global Toast Notifications */}
                  <Toaster
                    theme="dark"
                    position="top-right"
                    toastOptions={{
                      style: {
                        background: '#1a1a1a',
                        border: '1px solid #333',
                        color: '#fff',
                      },
                    }}
                  />
                </div>
              </Router>
            </PaymentProvider>
          </WalletProvider>
        </AuthProvider>
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App

