import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
vi.mock('./components/Configurator', () => ({ default: () => <div>Viewer placeholder</div> }));
describe('completed imagery follow-ons', () => {
  it('leads with the visually approved location and its actual side input without replacing the viewer', () => {
    render(<App />);
    const hero = screen.getByRole('group', { name: 'Location interpretation and original source' });
    expect(within(hero).getAllByRole('img')).toHaveLength(2);
    expect(within(hero).getByRole('img', { name: 'Location interpretation · Qwen seed 42' })).toHaveAttribute('src', '/assets/study/ai-imagery/followons/location.png');
    expect(within(hero).getByRole('img', { name: 'Location original side source' })).toHaveAttribute('src', '/assets/study/ai-imagery/after-Carmine-side.png');
    expect(hero).toHaveTextContent('visual approval, not technical fidelity');
    expect(screen.getByRole('img', { name: 'Pre-ground-correction refined viewer: Estuary Enamel' })).toBeInTheDocument();
    const protectedPair = screen.getByRole('group', { name: 'Protected product comparison' });
    expect(protectedPair.querySelectorAll('.protected-comparison img')).toHaveLength(3);
    expect(protectedPair).toHaveTextContent('107,603');
    expect(protectedPair).toHaveTextContent('1,151');
    expect(protectedPair).toHaveTextContent('original glass and mirror reflections');
    const flux = screen.getByRole('group', { name: 'Second model comparison' });
    expect(within(flux).getAllByRole('img')).toHaveLength(2);
    expect(flux).toHaveTextContent('invented hood emblem');
    const repeat = screen.getByRole('group', { name: 'Original-seed repeatability' });
    expect(within(repeat).getAllByRole('img')).toHaveLength(2);
    expect(repeat).toHaveTextContent('cache');
    expect(repeat).toHaveTextContent('0 changed RGB pixels');
    expect(screen.getByText('Four follow-ons completed')).toBeVisible();
  });
});
