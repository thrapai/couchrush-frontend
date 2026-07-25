import { Alert, Button, Typography } from '@mui/material';
import { Component, type ReactNode } from 'react';
import { CenteredMessage } from './CenteredMessage';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }
  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <CenteredMessage>
          <Typography variant="h4" component="h1">
            Application error
          </Typography>
          <Alert severity="error">Something went wrong while loading the admin portal.</Alert>
          <Button variant="contained" onClick={this.handleReload}>
            Reload
          </Button>
        </CenteredMessage>
      );
    }

    return this.props.children;
  }
}
