import { analyzeSource, sourceOffset } from './ts-adapter.mjs';

/** @typedef {import('./config.mjs').Config} Config */
/** @typedef {import('./config.mjs').Rule} Rule */
/** @typedef {import('./config.mjs').Finding} Finding */

/**
 * A real line comment with a reason exempts its line and, when comment-only,
 * the directly following line. File paths select the compiler's script kind.
 * @param {string} text @param {Config} config @param {string} [path] @returns {Finding[]}
 */
export function scanText(text, config, path = 'source.ts') {
  // A leading BOM is an encoding marker, not an editor column.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const { segments, positionAt } = analyzeSource(path, text);
  /** @type {Set<number>} */
  const allowed = new Set();
  for (const segment of segments) {
    if (segment.kind !== 'comment' || !segment.lineComment) continue;
    const directiveAt = segment.text.indexOf(config.allowDirective, 2);
    if (directiveAt === -1 || !segment.text.slice(directiveAt + config.allowDirective.length).trim()) continue;
    const { line, character } = positionAt(segment.start);
    allowed.add(line);
    if (!text.slice(segment.start - character, segment.start).trim()) allowed.add(line + 1);
  }

  /** @type {(Finding & { offset: number, order: number })[]} */
  const findings = [];
  const seen = new Set();
  /** @param {Rule} rule @param {string} match @param {number} offset @param {number} order */
  function report(rule, match, offset, order) {
    const { line, character } = positionAt(offset);
    const key = `${rule.id}:${offset}`;
    if (allowed.has(line) || seen.has(key)) return;
    seen.add(key);
    findings.push({ line: line + 1, col: character + 1, rule: rule.id, match, offset, order });
  }

  for (const segment of segments) {
    const offsetOf = sourceOffset(segment);
    for (const [order, rule] of config.rules.entries()) {
      const { regex, camelWords, knownScript, scope } = rule;
      if (scope === 'code') {
        if (segment.kind !== 'key') continue;
        // Match configured key patterns, then report the syntax of this site.
        const candidate = `${segment.text}:`;
        regex.lastIndex = 0;
        const match = regex.exec(candidate);
        if (match?.index === 0 && match[0].length === candidate.length) report(rule, segment.codeMatch ?? match[0], segment.start, order);
        continue;
      }
      if (segment.kind === 'key') continue;
      if (scope === 'literal') {
        if (segment.kind !== 'literal' && segment.kind !== 'template-head') continue;
        const quote = segment.quote ?? "'";
        const candidate = quote + segment.text + (segment.kind === 'template-head' ? '${' : quote);
        regex.lastIndex = 0;
        const match = regex.exec(candidate);
        if (!match || match.index !== 0 || match[0].length !== candidate.length - (segment.kind === 'template-head' ? 2 : 0)) continue;
        if (knownScript && match.groups?.script && !config.scriptCodes.has(match.groups.script.toLowerCase())) continue;
        report(rule, match[0], segment.start, order);
        continue;
      }

      /** @type {{ value: string, indexOf: (index: number) => number }[]} */
      const attempts = [{ value: segment.text, indexOf: (index) => index }];
      if (camelWords && /[A-Z]/.test(segment.text)) {
        // Store only inserted spaces, preserving UTF-16 offsets without dense maps.
        /** @type {number[]} */
        const insertions = [];
        const value = segment.text.replace(/(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g, (_, at) => {
          insertions.push(at + insertions.length);
          return ' ';
        });
        if (insertions.length) attempts.push({ value, indexOf: (index) => {
          let low = 0;
          let high = insertions.length;
          while (low < high) {
            const mid = (low + high) >>> 1;
            if ((insertions[mid] ?? Infinity) <= index) low = mid + 1;
            else high = mid;
          }
          return index - low;
        } });
      }
      for (const attempt of attempts) {
        regex.lastIndex = 0;
        for (const match of attempt.value.matchAll(regex)) {
          report(rule, match[0], offsetOf(attempt.indexOf(match.index)), order);
        }
      }
    }
  }
  // Preserve the CLI's line/rule/source ordering for existing consumers.
  findings.sort((a, b) => a.line - b.line || a.order - b.order || a.offset - b.offset);
  return findings.map(({ offset, order, ...finding }) => finding);
}
