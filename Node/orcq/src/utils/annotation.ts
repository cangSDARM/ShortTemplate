export default function annotation(...annotations: string[]): string {
  return `\n---------------\n${annotations
    .filter(v => v.trim() !== '')
    .join('\n')}`;
}
