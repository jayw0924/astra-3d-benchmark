import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('presents outputs, methods, evidence, and deferred streaming honestly', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { level: 1, name: /Astra 3D benchmark/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /real-time configurator/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /methods/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /what failed/i })).toBeInTheDocument();
    expect(screen.getByText(/Deferred — not implemented/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: /credits/i })).toBeInTheDocument();
  });

  it('presents the completed Estuary integration instead of pending placeholders', () => {
    render(<App />);

    expect(screen.getByText('Phase 1 complete')).toBeVisible();
    expect(screen.getByText(/3 verified Astra runs · Estuary integrated/i)).toBeVisible();
    expect(screen.getByText(/30 controlled browser renders/i)).toBeVisible();
    expect(screen.getByText(/three supplied finishes plus Estuary Enamel/i)).toBeVisible();
    expect(screen.getByText(/standalone geometry authoring was not performed/i)).toBeVisible();
    expect(screen.queryByText(/production runs pending/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/awaiting verified run/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no Astra production run has been conducted/i)).not.toBeInTheDocument();
  });
});
