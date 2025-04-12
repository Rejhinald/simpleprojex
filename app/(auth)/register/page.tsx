import { RegisterForm } from '@/components/features/auth/register/register-form'
import React from 'react'

export default function RegisterPage() {
  return (
  <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
        <RegisterForm />
    </div>
  )
}
