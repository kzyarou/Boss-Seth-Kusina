import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
type Props = {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};
type State = {
  hasError: boolean;
  error: Error | null;
};
/**
 * Error Boundary to catch React rendering errors
 * Logs errors to a global error log that admins can view
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to global error log (stored in localStorage for admin viewing)
    const errorLog = JSON.parse(localStorage.getItem('app_error_log') || '[]');
    errorLog.push({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    // Keep last 50 errors
    if (errorLog.length > 50) errorLog.shift();
    localStorage.setItem('app_error_log', JSON.stringify(errorLog));
    // Call optional callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-stone-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-stone-900 mb-2">
              May Problema
            </h2>
            <p className="text-stone-600 mb-6">
              May nangyaring error. Naka-log na 'to para sa admin.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
              
              Balik sa Home
            </button>
          </div>
        </div>);

    }
    return this.props.children;
  }
}