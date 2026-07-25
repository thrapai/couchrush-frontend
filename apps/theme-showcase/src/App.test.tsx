import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CouchRushThemeProvider } from '@couchrush/theme';
import { App } from './App';

function renderApp() {
  return render(
    <CouchRushThemeProvider defaultMode="dark">
      <App />
    </CouchRushThemeProvider>,
  );
}

describe('theme showcase', () => {
  it('renders the showcase shell', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: /couchrush theme showcase/i })).toBeInTheDocument();
  });

  it('renders the color mode toggle', () => {
    renderApp();
    expect(screen.getAllByRole('button', { name: /switch to light mode/i }).length).toBeGreaterThan(0);
  });

  it('renders the custom display typography variant', () => {
    renderApp();
    expect(screen.getByText(/electric arcade display/i)).toBeInTheDocument();
  });

  it('opens a menu example', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /open action menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens a dialog example', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /open standard dialog/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders the game preview section', () => {
    renderApp();
    expect(screen.getByTestId('game-preview-section')).toBeInTheDocument();
  });

  it('opens and closes the drawer preview', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /open drawer/i }));
    expect(screen.getByRole('button', { name: /close drawer panel/i })).toBeInTheDocument();
    expect(screen.getByText(/shifts to make room for the drawer/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close drawer panel/i }));
    expect(screen.getByText(/open the drawer to preview bounded navigation behavior/i)).toBeInTheDocument();
  });
});
