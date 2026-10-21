import { describe, expect, it } from 'vitest';
import {
  defaultConfiguration,
  parseConfiguration,
  resetConfiguration,
  serializeConfiguration,
} from './configuration';

describe('product configuration', () => {
  it('uses the supplied Carmine variant by default', () => {
    expect(defaultConfiguration).toEqual({
      finish: 'Carmine Candy',
      trim: 'bright',
    });
  });

  it('returns a fresh default object when reset', () => {
    expect(resetConfiguration()).toEqual(defaultConfiguration);
    expect(resetConfiguration()).not.toBe(defaultConfiguration);
  });

  it('falls back safely when URL options are invalid', () => {
    expect(parseConfiguration('?finish=unknown&trim=neon')).toEqual(
      defaultConfiguration,
    );
  });

  it('round-trips valid options through a query string', () => {
    const configuration = {
      finish: 'Torched Graphite' as const,
      trim: 'dark' as const,
    };
    expect(parseConfiguration(serializeConfiguration(configuration))).toEqual(
      configuration,
    );
  });

  it('round-trips the selected Estuary integration finish', () => {
    const configuration = {
      finish: 'Estuary Enamel' as const,
      trim: 'bright' as const,
    };
    expect(parseConfiguration(serializeConfiguration(configuration))).toEqual(
      configuration,
    );
  });
});
