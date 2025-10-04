import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  User, 
  Wallet, 
  FileText, 
  CreditCard, 
  Scale, 
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import NotificationCenter from '../notifications/NotificationCenter'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Wallets', href: '/app/wallets', icon: Wallet },
  { name: 'Addendum', href: '/app/addendum', icon: FileText },
  { name: 'Payment', href: '/app/payment', icon: CreditCard },
  { name: 'Legal', href: '/app/legal', icon: Scale },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { sessions, totalValue, totalAssets } = useWallet()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const getUserInitials = () => {
    if (!user) return 'U'
    const firstName = user.first_name || ''
    const lastName = user.last_name || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-gray-800">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Last Wish</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-6 px-3">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black border-r border-gray-800 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center border-b border-gray-800">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-white">Last Wish</span>
            </Link>
          </div>
          
          {/* User Stats */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Connected Wallets</span>
                <Badge variant="secondary">{sessions.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Assets</span>
                <Badge variant="secondary">{totalAssets}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Total Value</span>
                <Badge variant="secondary">${totalValue.toLocaleString()}</Badge>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-800 bg-black px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-white">
                {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <NotificationCenter />

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar_url} alt={user?.email} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.first_name && user?.last_name 
                          ? `${user.first_name} ${user.last_name}`
                          : 'User'
                        }
                      </p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => navigate('/app/profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                    onClick={() => navigate('/app/profile')}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

