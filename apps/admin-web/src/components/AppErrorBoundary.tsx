import { Alert, Button, Typography } from '@mui/material';
import { i18n } from '@couchrush/i18n';
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
            {i18n.t('common:common.errors.applicationTitle')}
          </Typography>
          <Alert severity="error">{i18n.t('admin:admin.errors.portalLoadFailed')}</Alert>
          <Button variant="contained" onClick={this.handleReload}>
            {i18n.t('common:common.actions.reload')}
          </Button>
        </CenteredMessage>
      );
    }

    return this.props.children;
  }
}
