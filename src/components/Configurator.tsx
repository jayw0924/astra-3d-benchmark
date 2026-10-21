import { useEffect, useRef, useState } from 'react';
import {
  defaultConfiguration,
  finishes,
  parseConfiguration,
  resetConfiguration,
  serializeConfiguration,
  trims,
  type Finish,
  type ProductConfiguration,
  type Trim,
} from '../lib/configuration';
import { createThreeViewer } from '../lib/threeViewer';

export type ViewerController = {
  load: (onProgress?: (percent: number) => void) => Promise<void>;
  setFinish: (finish: Finish) => Promise<void>;
  setTrim: (trim: Trim) => void;
  adjustView: (action: 'left' | 'right' | 'in' | 'out') => void;
  resetCamera: () => void;
  dispose: () => void;
};

export type ViewerFactory = (canvas: HTMLCanvasElement) => ViewerController;

type Props = {
  viewerFactory?: ViewerFactory;
};

export default function Configurator({
  viewerFactory = createThreeViewer,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<ViewerController | null>(null);
  const finishQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [configuration, setConfiguration] = useState<ProductConfiguration>(() =>
    typeof window === 'undefined'
      ? { ...defaultConfiguration }
      : parseConfiguration(window.location.search),
  );
  const initialConfigurationRef = useRef(configuration);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [progress, setProgress] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let viewer: ViewerController;
    try {
      viewer = viewerFactory(canvas);
    } catch {
      queueMicrotask(() => setState('error'));
      return;
    }
    viewerRef.current = viewer;
    let cancelled = false;

    viewer
      .load((nextProgress) => {
        if (!cancelled) setProgress(nextProgress);
      })
      .then(async () => {
        if (cancelled) return;
        await viewer.setFinish(initialConfigurationRef.current.finish);
        viewer.setTrim(initialConfigurationRef.current.trim);
        if (!cancelled) setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
      viewer.dispose();
      if (viewerRef.current === viewer) viewerRef.current = null;
    };
  }, [reloadKey, viewerFactory]);

  function updateConfiguration(next: ProductConfiguration) {
    setConfiguration(next);
    window.history.replaceState(null, '', serializeConfiguration(next));
    const viewer = viewerRef.current;
    if (viewer) {
      finishQueueRef.current = finishQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (viewerRef.current === viewer) await viewer.setFinish(next.finish);
        });
      viewer.setTrim(next.trim);
    }
  }

  function reset() {
    const next = resetConfiguration();
    updateConfiguration(next);
    viewerRef.current?.resetCamera();
  }

  return (
    <div className="configurator-shell">
      <div className="viewer-frame">
        <canvas
          ref={canvasRef}
          aria-label="Interactive 3D concept car"
          data-testid="configurator-canvas"
          tabIndex={0}
        >
          Interactive 3D concept car. Use the adjacent buttons for keyboard controls.
        </canvas>
        <p className="viewer-status" role={state === 'error' ? 'alert' : 'status'}>
          {state === 'loading' &&
            `Loading 3D model${progress > 0 ? ` — ${Math.round(progress)}%` : ''}`}
          {state === 'ready' && '3D model ready'}
          {state === 'error' && 'The 3D model could not be loaded.'}
        </p>
        {state === 'error' && (
          <button
            type="button"
            onClick={() => {
              setState('loading');
              setProgress(0);
              setReloadKey((value) => value + 1);
            }}
          >
            Retry model load
          </button>
        )}
      </div>

      <div className="configuration-panel" aria-label="Product configuration">
        <div className="control-group" role="radiogroup" aria-label="Finish">
          <p className="eyebrow">Finish</p>
          {finishes.map((finish) => (
            <label key={finish}>
              <input
                type="radio"
                name="finish"
                value={finish}
                checked={configuration.finish === finish}
                disabled={state !== 'ready'}
                onChange={() =>
                  updateConfiguration({ ...configuration, finish })
                }
              />
              <span className={`swatch swatch-${finish.toLowerCase().replaceAll(' ', '-')}`} />
              {finish}
            </label>
          ))}
        </div>

        <div className="control-group" role="radiogroup" aria-label="Trim">
          <p className="eyebrow">Wheel finish</p>
          {trims.map((trim) => (
            <label key={trim}>
              <input
                type="radio"
                name="trim"
                value={trim}
                checked={configuration.trim === trim}
                disabled={state !== 'ready'}
                onChange={() => updateConfiguration({ ...configuration, trim })}
              />
              {trim === 'bright' ? 'Bright alloy' : 'Dark alloy'}
            </label>
          ))}
        </div>

        <div className="view-controls" aria-label="3D view controls">
          {([
            ['left', 'Rotate left'],
            ['right', 'Rotate right'],
            ['in', 'Zoom in'],
            ['out', 'Zoom out'],
          ] as const).map(([action, label]) => (
            <button
              key={action}
              className="secondary-button"
              type="button"
              disabled={state !== 'ready'}
              onClick={() => viewerRef.current?.adjustView(action)}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          className="secondary-button"
          type="button"
          onClick={reset}
          disabled={state !== 'ready'}
        >
          Reset configuration
        </button>
        <p className="interaction-hint">
          Drag to orbit · scroll or pinch to zoom · buttons support keyboard use
        </p>
      </div>
    </div>
  );
}
