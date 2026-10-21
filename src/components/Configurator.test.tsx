import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Configurator, { type ViewerController } from './Configurator';

function fakeViewer(overrides: Partial<ViewerController> = {}): ViewerController {
  return {
    load: vi.fn().mockResolvedValue(undefined),
    setFinish: vi.fn().mockResolvedValue(undefined),
    setTrim: vi.fn(),
    adjustView: vi.fn(),
    resetCamera: vi.fn(),
    dispose: vi.fn(),
    ...overrides,
  };
}

describe('Configurator', () => {
  it('keeps configuration controls disabled until the model is ready', async () => {
    let finishLoading: (() => void) | undefined;
    const viewer = fakeViewer({
      load: vi.fn(() => new Promise<void>((resolve) => {
        finishLoading = resolve;
      })),
    });
    render(<Configurator viewerFactory={() => viewer} />);

    expect(screen.getByRole('radio', { name: 'Carmine Candy' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reset configuration/i })).toBeDisabled();
    finishLoading?.();
    await screen.findByText('3D model ready');
    expect(screen.getByRole('radio', { name: 'Carmine Candy' })).toBeEnabled();
  });

  it('loads the model and exposes accessible product options', async () => {
    const viewer = fakeViewer();
    render(<Configurator viewerFactory={() => viewer} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading 3D model');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('3D model ready'),
    );
    expect(screen.getByRole('radiogroup', { name: /finish/i })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Carmine Candy' })).toBeChecked();
  });

  it('applies a finish and resets to defaults', async () => {
    const user = userEvent.setup();
    const viewer = fakeViewer();
    render(<Configurator viewerFactory={() => viewer} />);
    await screen.findByText('3D model ready');

    await user.click(screen.getByRole('radio', { name: 'Torched Graphite' }));
    expect(viewer.setFinish).toHaveBeenLastCalledWith('Torched Graphite');

    await user.click(screen.getByRole('button', { name: /reset configuration/i }));
    expect(viewer.setFinish).toHaveBeenLastCalledWith('Carmine Candy');
    expect(viewer.setTrim).toHaveBeenLastCalledWith('bright');
    expect(viewer.resetCamera).toHaveBeenCalled();
  });

  it('exposes and applies the selected Estuary finish', async () => {
    const user = userEvent.setup();
    const viewer = fakeViewer();
    render(<Configurator viewerFactory={() => viewer} />);
    await screen.findByText('3D model ready');

    await user.click(screen.getByRole('radio', { name: 'Estuary Enamel' }));
    expect(viewer.setFinish).toHaveBeenLastCalledWith('Estuary Enamel');
  });

  it('shows an actionable load failure', async () => {
    const viewer = fakeViewer({
      load: vi.fn().mockRejectedValue(new Error('network failed')),
    });
    render(<Configurator viewerFactory={() => viewer} />);

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'The 3D model could not be loaded',
      ),
    );
    expect(screen.getByRole('button', { name: /retry/i })).toBeVisible();
  });

  it('provides keyboard-operable orbit and zoom controls', async () => {
    const user = userEvent.setup();
    const viewer = fakeViewer();
    render(<Configurator viewerFactory={() => viewer} />);
    await screen.findByText('3D model ready');

    await user.click(screen.getByRole('button', { name: 'Rotate left' }));
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(viewer.adjustView).toHaveBeenNthCalledWith(1, 'left');
    expect(viewer.adjustView).toHaveBeenNthCalledWith(2, 'in');
  });

  it('serializes finish changes so an older request cannot win the race', async () => {
    const user = userEvent.setup();
    let finishFirstChange: (() => void) | undefined;
    const setFinish = vi.fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>((resolve) => {
        finishFirstChange = resolve;
      }))
      .mockResolvedValueOnce(undefined);
    const viewer = fakeViewer({ setFinish });
    render(<Configurator viewerFactory={() => viewer} />);
    await screen.findByText('3D model ready');
    setFinish.mockClear();

    await user.click(screen.getByRole('radio', { name: 'Pearly Swirly' }));
    await user.click(screen.getByRole('radio', { name: 'Torched Graphite' }));
    expect(setFinish).toHaveBeenCalledTimes(1);
    expect(setFinish).toHaveBeenLastCalledWith('Pearly Swirly');

    finishFirstChange?.();
    await waitFor(() => expect(setFinish).toHaveBeenCalledTimes(2));
    expect(setFinish).toHaveBeenLastCalledWith('Torched Graphite');
  });
});
