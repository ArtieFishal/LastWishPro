import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wallet, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  Shield, 
  Plus,
  ArrowRight,
  DollarSign,
  Users,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'

export function DashboardPage() {
  const { user } = useAuth()
  const { sessions, totalValue, totalAssets, loadWalletSessions } = useWallet()

  useEffect(() => {
    loadWalletSessions()
  }, [])

  const getProfileCompleteness = () => {
    const fields = [
      user?.first_name,
      user?.last_name,
      user?.address,
      user?.city,
      user?.state,
      user?.executor_name,
      user?.digital_executor_name
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const profileCompleteness = getProfileCompleteness()

  const quickActions = [
    {
      title: 'Connect Wallet',
      description: 'Add your cryptocurrency wallets',
      icon: Wallet,
      href: '/app/wallets',
      color: 'bg-blue-600'
    },
    {
      title: 'Create Addendum',
      description: 'Generate your estate planning document',
      icon: FileText,
      href: '/app/addendum',
      color: 'bg-green-600'
    },
    {
      title: 'Upgrade Plan',
      description: 'Unlock premium features',
      icon: CreditCard,
      href: '/app/payment',
      color: 'bg-purple-600'
    }
  ]

  const stats = [
    {
      title: 'Total Portfolio Value',
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Connected Wallets',
      value: sessions.length.toString(),
      icon: Wallet,
      change: sessions.length > 0 ? 'Active' : 'None',
      changeType: sessions.length > 0 ? 'neutral' : 'negative'
    },
    {
      title: 'Total Assets',
      value: totalAssets.toString(),
      icon: Activity,
      change: totalAssets > 0 ? 'Tracked' : 'None',
      changeType: totalAssets > 0 ? 'neutral' : 'negative'
    },
    {
      title: 'Beneficiaries',
      value: '0', // TODO: Calculate from actual data
      icon: Users,
      change: 'Pending',
      changeType: 'neutral'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.first_name || 'User'}!
        </h1>
        <p className="text-gray-400">
          Here's an overview of your crypto estate planning progress.
        </p>
      </div>

      {/* Profile Completeness Alert */}
      {profileCompleteness < 100 && (
        <Card className="bg-yellow-900/20 border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-yellow-300">
              Your profile is {profileCompleteness}% complete. Complete it to ensure your estate planning documents are accurate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Progress value={profileCompleteness} className="flex-1 mr-4" />
              <Link to="/app/profile">
                <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/30">
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <p className={`text-xs ${
                stat.changeType === 'positive' ? 'text-green-400' :
                stat.changeType === 'negative' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-white">{action.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-400 hover:text-blue-300">
                    <span className="text-sm">Get started</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No wallets connected</h3>
                <p className="text-gray-500 mb-4">
                  Connect your first cryptocurrency wallet to get started with estate planning.
                </p>
                <Link to="/app/wallets">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 3).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {session.blockchain?.charAt(0).toUpperCase() + session.blockchain?.slice(1)} Wallet
                        </p>
                        <p className="text-gray-400 text-sm">
                          {session.wallet_address?.slice(0, 6)}...{session.wallet_address?.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        ${(session.total_value || 0).toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {session.asset_count || 0} assets
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {sessions.length > 3 && (
                  <Link to="/app/wallets">
                    <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                      View all wallets
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

