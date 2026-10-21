const forbiddenIdentityTokens = [
  'Estuary Enamel',
  'Fjord Enamel',
  'estuary-enamel-candidate',
  'fjord-enamel-candidate',
  'bc82c38a61513010d850d329d0e1e618fc7135bad0ab0bd11e5bd83cffe4834f',
  '1eaba8fe0cbecfcf45a0ec83337979f6db1bb08ad98b6cef8de6d97e9ab790c3',
  '2026-10-20-astra-material-estuary-49b949',
  '2026-10-20-astra-material-fjord-ef457b',
];

export function assertIdentityFreeText(text) {
  const lowered = text.toLowerCase();
  const leak = forbiddenIdentityTokens.find((token) => lowered.includes(token.toLowerCase()));
  if (leak) throw new Error(`Blind identity leak: ${leak}`);
}
