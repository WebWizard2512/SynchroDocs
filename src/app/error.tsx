"use client";

import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import React from 'react'
import Link from 'next/link';

const ErrorPage = ({
    error, reset
} : {error: Error & {digest?: string};
reset: () => void}) => {

  return (
    <div className='flex flex-col items-center justify-center min-h-screen space-y-6'>
        <div className='text-center space-y-4'>
            <div className='flex justify-center'>
                <div className='bg-rose-100 p-3 rounded-full'>
                    <AlertTriangle className='text-rose-600 size-10'/>
                </div>
            </div>
            <div className='space-y-2'>
                <h2 className='text-xl font-semibold text-gray-900'>
                    Something went wrong
                </h2>
                <p>
                    {error.message}
                </p>
            </div>
        </div>
        <div className='flex space-x-4'>
            <Button onClick={reset}
            className='font-medium px-6'>
                Try Again
            </Button>
            <Button asChild
            variant="ghost"
            className="font-medium">
                <Link href='/'>
                Go back
                </Link>
            </Button>
        </div>
    </div>
  )
}

export default ErrorPage
