import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
        <div className="mx-auto max-w-md">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <Shield className="h-12 w-12 text-blue-500" />
            <span className="text-3xl font-bold text-white">Last Wish</span>
          </Link>
          
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Secure Your Crypto Legacy
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Create legally binding addendums for your cryptocurrency assets. 
              Ensure your digital wealth reaches your loved ones.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Bank-level security</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Legally compliant documents</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Multi-blockchain support</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Notarization ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center justify-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-2xl font-bold text-white">Last Wish</span>
            </Link>
          </div>

          {/* Auth form content */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <Outlet />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              By continuing, you agree to our{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

