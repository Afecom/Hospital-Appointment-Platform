export function hexToRgb(hex: string) {
  const result = hex.replace("#", "");
  const r = parseInt(result.substring(0, 2), 16);
  const g = parseInt(result.substring(2, 4), 16);
  const b = parseInt(result.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}
