const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function esc(text: string | number): string {
  return String(text).replace(/[&<>"']/g, (ch) => entities[ch] ?? ch);
}
