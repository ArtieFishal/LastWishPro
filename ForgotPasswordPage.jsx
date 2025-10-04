import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data) => {
    await forgotPassword(data.email)
  }

  if (isSubmitSuccessful) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-white" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-gray-400">
            We've sent a password reset link to your email address.
          </p>
        </div>

        <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4">
          <p className="text-sm text-blue-400">
            Didn't receive the email? Check your spam folder or try again in a few minutes.
          </p>
        </div>

        <Link to="/auth/login">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Forgot your password?</h2>
        <p className="mt-2 text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-white">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
            placeholder="Enter your email"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending reset link...
            </>
          ) : (
            'Send reset link'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to="/auth/login"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

