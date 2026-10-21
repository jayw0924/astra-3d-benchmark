export const finishes = [
  'Carmine Candy',
  'Pearly Swirly',
  'Torched Graphite',
  'Estuary Enamel',
] as const;
export const trims = ['bright', 'dark'] as const;

export type Finish = (typeof finishes)[number];
export type Trim = (typeof trims)[number];

export type ProductConfiguration = {
  finish: Finish;
  trim: Trim;
};

export const defaultConfiguration: ProductConfiguration = {
  finish: 'Carmine Candy',
  trim: 'bright',
};

function isFinish(value: string | null): value is Finish {
  return finishes.includes(value as Finish);
}

function isTrim(value: string | null): value is Trim {
  return trims.includes(value as Trim);
}

export function resetConfiguration(): ProductConfiguration {
  return { ...defaultConfiguration };
}

export function parseConfiguration(search: string): ProductConfiguration {
  const params = new URLSearchParams(search);
  const finish = params.get('finish');
  const trim = params.get('trim');

  return {
    finish: isFinish(finish) ? finish : defaultConfiguration.finish,
    trim: isTrim(trim) ? trim : defaultConfiguration.trim,
  };
}

export function serializeConfiguration(
  configuration: ProductConfiguration,
): string {
  const params = new URLSearchParams({
    finish: configuration.finish,
    trim: configuration.trim,
  });
  return `?${params.toString()}`;
}
