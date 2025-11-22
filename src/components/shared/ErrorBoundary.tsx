import React from 'react';

interface State { hasError: boolean; error?: Error }

class ErrorBoundary extends React.Component<{}, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pt-24 pb-12 text-center text-devil-red">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p>We couldn't load this page; try refreshing or report the issue.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
