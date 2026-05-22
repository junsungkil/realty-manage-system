// 공통 입력 필드 컴포넌트
import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, suffix, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-slate-500 text-sm pointer-events-none">{prefix}</span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full h-11 rounded-xl border border-slate-300 bg-white text-slate-900',
              'px-3 text-sm placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'disabled:bg-slate-50 disabled:text-slate-500',
              error && 'border-red-400 focus:ring-red-400',
              prefix && 'pl-8',
              suffix && 'pr-12',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 text-slate-500 text-sm pointer-events-none">{suffix}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
