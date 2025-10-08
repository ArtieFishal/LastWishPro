import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Shield, 
  Wallet, 
  FileText, 
  Lock, 
  CheckCircle, 
  ArrowRight,
  Star,
  Users,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Wallet,
    title: 'Multi-Blockchain Support',
    description: 'Connect wallets from Ethereum, Solana, Bitcoin, and more. Comprehensive asset tracking across all major blockchains.'
  },
  {
    icon: FileText,
    title: 'Legal Addendum Generation',
    description: 'Generate legally compliant addendums to your will or trust. State-specific templates ensure proper legal standing.'
  },
  {
    icon: Lock,
    title: 'Bank-Level Security',
    description: 'Your private keys never touch our servers. We only store public wallet addresses and beneficiary information.'
  },
  {
    icon: CheckCircle,
    title: 'Notarization Ready',
    description: 'Documents are formatted for easy notarization in your state. Includes all required legal language and formatting.'
  }
]

const stats = [
  { label: 'Assets Protected', value: '$2.1B+', icon: DollarSign },
  { label: 'Families Served', value: '10,000+', icon: Users },
  { label: 'Trust Rating', value: '4.9/5', icon: Star }
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Crypto Investor',
    content: 'Finally, a solution that understands both crypto and estate planning. The legal documents are comprehensive and my attorney approved them immediately.',
    avatar: 'SC'
  },
  {
    name: 'Michael Rodriguez',
    role: 'DeFi Trader',
    content: 'I have assets across 15 different wallets. Last Wish made it simple to organize everything for my family. The peace of mind is invaluable.',
    avatar: 'MR'
  },
  {
    name: 'Jennifer Kim',
    role: 'Estate Attorney',
    content: 'I recommend Last Wish to all my clients with crypto assets. The documents are legally sound and save hours of drafting time.',
    avatar: 'JK'
  }
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold">Last Wish</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
              <Link to="/auth/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/auth/register">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-blue-600/10 text-blue-400 border-blue-600/20">
            Trusted by 10,000+ crypto holders
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Secure Your Crypto Legacy
            <br />
            <span className="text-blue-500">For Your Loved Ones</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Create legally binding addendums to your will for cryptocurrency assets. 
            Ensure your digital wealth reaches your beneficiaries with bank-level security 
            and state-compliant legal documents.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/auth/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-gray-600 text-white hover:bg-gray-800">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <stat.icon className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-3xl font-bold">{stat.value}</span>
                </div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Crypto Estate Planning
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools to protect your digital assets and ensure they reach your beneficiaries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-black border-gray-800 hover:border-gray-700 transition-colors">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-blue-500 mb-4" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-gray-300">
              Get your crypto estate plan ready in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallets', description: 'Securely connect your cryptocurrency wallets from any blockchain' },
              { step: '02', title: 'Assign Beneficiaries', description: 'Designate who should receive each of your digital assets' },
              { step: '03', title: 'Generate Documents', description: 'Create legally compliant addendums to your will or trust' },
              { step: '04', title: 'Notarize & Store', description: 'Get documents notarized and store them with your estate plan' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by Crypto Holders Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-black border-gray-800">
                <CardContent className="pt-6">
                  <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your Crypto Legacy?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of crypto holders who have protected their digital assets for their families
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-bold">Last Wish</span>
              </Link>
              <p className="text-gray-400">
                Secure cryptocurrency estate planning for the digital age.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Features</Link></li>
                <li><Link to="#" className="hover:text-white">Pricing</Link></li>
                <li><Link to="#" className="hover:text-white">Security</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="hover:text-white">Legal Disclaimer</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white">Documentation</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Last Wish. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

