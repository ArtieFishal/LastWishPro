import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfilePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your account information and preferences.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Profile Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Profile management features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

