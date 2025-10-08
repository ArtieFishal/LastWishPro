import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function LegalPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Legal Guidance</h1>
        <p className="text-gray-400">Access legal templates and guidance for estate planning.</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Legal Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Legal guidance features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

