import { Component, type ErrorInfo, type ReactNode } from 'react';
import { getPublicErrorContent } from '@/utils/publicError';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error.', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { heading, message, details } = getPublicErrorContent(
        this.state.error
      );
      const showDetails =
        import.meta.env.DEV && import.meta.env.VITE_SHOW_ERROR_DETAILS === 'true';
      return (
        <div className="container-lg" role="alert" aria-live="assertive">
          <h1>{heading}</h1>
          <p>{message}</p>
          {showDetails && details ? (
            <details>
              <summary>Details</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{details}</pre>
            </details>
          ) : null}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={this.handleReload}>
              Reload
            </button>
            <a href="/">Return home</a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
