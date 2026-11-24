export interface Parsed {
  /** Lower-cased command name, so phone keyboards that capitalise still work. */
  name: string;
  args: string[];
  flags: Set<string>;
  raw: string;
}

/** Splits a line into words, keeping quoted parts together. */
export function tokenize(line: string): string[] {
  const words: string[] = [];
  let word = '';
  let quote: '"' | "'" | null = null;
  let inWord = false;

  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else word += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      inWord = true;
    } else if (/\s/.test(ch)) {
      if (inWord) words.push(word);
      word = '';
      inWord = false;
    } else {
      word += ch;
      inWord = true;
    }
  }
  if (inWord) words.push(word);
  return words;
}

export function parse(line: string): Parsed {
  const [first = '', ...rest] = tokenize(line.trim());
  const flags = new Set<string>();
  const args: string[] = [];

  for (const word of rest) {
    if (word.startsWith('--') && word.length > 2) flags.add(word.slice(2));
    else if (word.startsWith('-') && word.length > 1) for (const f of word.slice(1)) flags.add(f);
    else args.push(word);
  }
  return { name: first.toLowerCase(), args, flags, raw: line };
}
