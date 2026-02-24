'use client';

import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class WorkoutErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('WorkoutErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-[100dvh] bg-background p-6 gap-6">
          <AlertTriangle className="w-12 h-12 text-orange-500" />
          <h1 className="text-xl font-bold text-center">Something went wrong</h1>
          <p className="text-sm text-muted-foreground text-center">
            An error occurred during your workout.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-3 rounded-full bg-foreground text-background font-medium active:scale-95 transition-transform"
          >
            Tap to reset
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
