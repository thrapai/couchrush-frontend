import { Button } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSnackbarProvider } from './GlobalSnackbarProvider';
import { useGlobalSnackbar } from './globalSnackbarContext';

function SnackbarTrigger() {
  const { showSnackbar } = useGlobalSnackbar();

  return (
    <Button
      onClick={() =>
        showSnackbar({
          severity: 'error',
          message: 'Application error',
        })
      }
    >
      Trigger
    </Button>
  );
}

describe('GlobalSnackbarProvider', () => {
  it('can display an error snackbar', async () => {
    render(
      <GlobalSnackbarProvider>
        <SnackbarTrigger />
      </GlobalSnackbarProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Trigger' }));

    expect(await screen.findByText('Application error')).toBeInTheDocument();
  });
});
