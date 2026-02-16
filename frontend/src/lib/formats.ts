export function toLines(value: string): string[] {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function toLineBlock(values: string[]): string {
  return values.join('\n');
}
