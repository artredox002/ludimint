'use client'

import { Toaster as Sonner } from 'sonner'

const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-bg-700 group-[.toaster]:text-fg-100 group-[.toaster]:border-white/10',
          description: 'group-[.toast]:text-fg-80',
          actionButton: 'group-[.toast]:bg-primary-600 group-[.toast]:text-bg-900',
          cancelButton: 'group-[.toast]:bg-bg-800 group-[.toast]:text-fg-100',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
