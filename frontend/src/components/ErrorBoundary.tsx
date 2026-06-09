import React, { Component, ErrorInfo, PropsWithChildren } from 'react'
import { colors } from '../lib/design'

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<PropsWithChildren, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ backgroundColor: colors.bg.primary }}>
          <h1 className="text-6xl mb-4">⚠️</h1>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text.primary }}>Something went wrong</h2>
          <p className="mb-8 max-w-md" style={{ color: colors.text.secondary }}>
            The application encountered an unexpected error. Please try reloading the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{ backgroundColor: colors.accent.gold, color: colors.bg.primary }}
          >
            Reload App
          </button>
          {import.meta.env.DEV && (
            <pre className="mt-8 p-4 rounded bg-black/50 text-left text-xs overflow-auto max-w-2xl" style={{ color: colors.status.error }}>
              {this.state.error?.stack}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
