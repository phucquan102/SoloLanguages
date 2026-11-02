// Keep compiler API details here so a compiler migration has one boundary.
import ts from 'typescript';
import { extname } from 'node:path';

/** @typedef {{ kind: 'identifier' | 'literal' | 'template-head' | 'text' | 'key' | 'comment', text: string, start: number, end: number, contentStart?: number, raw?: string, quote?: string, lineComment?: boolean, codeMatch?: string }} Segment */

/** @param {string} path @param {string} text */
function parseSource(path, text) {
  const extension = extname(path).toLowerCase();
  const kind = extension === '.tsx' ? ts.ScriptKind.TSX : extension === '.jsx' ? ts.ScriptKind.JSX :
    ['.js', '.mjs', '.cjs'].includes(extension) ? ts.ScriptKind.JS : ts.ScriptKind.TS;
  // Parent links are unnecessary here; their compiler setup can recurse deeply.
  return ts.createSourceFile(path, text, ts.ScriptTarget.Latest, false, kind);
}

/** @param {ts.SourceFile} source @returns {Segment[]} */
function sourceSegments(source) {
  const text = source.text;
  /** @type {Segment[]} */
  const segments = [];
  /** @type {{ start: number, end: number }[]} */
  const protectedRanges = [];
  /** @type {ts.Node[]} */
  const stack = [source];
  while (stack.length) {
    const node = /** @type {ts.Node} */ (stack.pop());
    const end = node.end;
    if (ts.isIdentifier(node)) {
      const start = node.getStart(source);
      // Only literals are escape-decoded; keep identifier source spelling.
      segments.push({ kind: 'identifier', text: text.slice(start, end), start, end });
    } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ||
        ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const start = node.getStart(source);
      const head = ts.isTemplateHead(node);
      const middle = ts.isTemplateMiddle(node);
      const tail = ts.isTemplateTail(node);
      const suffix = head || middle ? 2 : 1;
      segments.push({ kind: head ? 'template-head' : middle || tail ? 'text' : 'literal',
        text: node.text, start, end, contentStart: start + 1,
        raw: text.slice(start + 1, end - suffix), quote: text[start] ?? '' });
      protectedRanges.push({ start, end });
    } else if (ts.isJsxText(node)) {
      segments.push({ kind: 'text', text: text.slice(node.pos, end), start: node.pos, end });
      protectedRanges.push({ start: node.pos, end });
    } else if (ts.isRegularExpressionLiteral(node)) {
      protectedRanges.push({ start: node.getStart(source), end });
    }

    const names = ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node) ||
      ts.isPropertySignature(node) || ts.isPropertyDeclaration(node) ||
      ts.isMethodDeclaration(node) || ts.isMethodSignature(node) ||
      ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node) ||
      ts.isEnumMember(node) || ts.isPropertyAccessExpression(node) ? [node.name] :
      ts.isImportSpecifier(node) ? [node.propertyName ?? node.name] :
      ts.isExportSpecifier(node) ? [node.name] :
      // Only object bindings expose property names; array bindings are variables.
      ts.isObjectBindingPattern(node) ? node.elements.filter((element) => !element.dotDotDotToken)
        .map((element) => element.propertyName ?? element.name) : [];
    for (const name of names) {
      if (!name) continue;
      const key = ts.isComputedPropertyName(name) ? name.expression : name;
      // A dynamic computed identifier is an expression, not a static key.
      if ((ts.isIdentifier(key) && !ts.isComputedPropertyName(name)) ||
          ts.isStringLiteral(key) || ts.isNoSubstitutionTemplateLiteral(key)) {
        const keyStart = key.getStart(source);
        const actualKey = ts.isPropertyAssignment(node) || ts.isShorthandPropertyAssignment(node) ||
          ts.isPropertySignature(node) || ts.isPropertyDeclaration(node) || ts.isObjectBindingPattern(node);
        const codeMatch = ts.isPropertyAccessExpression(node) ? `.${key.text}` :
          actualKey ? `${key.text}:` : key.text;
        segments.push({ kind: 'key', text: key.text, start: keyStart, end: key.end, codeMatch });
      }
    }
    // Do not recurse, or call getStart on internal expression nodes: the latter
    // can itself recursively walk the left side of a long binary/comma chain.
    const children = /** @type {ts.Node[]} */ ([]);
    ts.forEachChild(node, (child) => { children.push(child); });
    for (let index = children.length - 1; index >= 0; index--) {
      stack.push(/** @type {ts.Node} */ (children[index]));
    }
  }

  // Let the TS scanner identify real comment trivia. AST ranges prevent a
  // context-free scan from interpreting regex, JSX or template text as comments.
  protectedRanges.sort((a, b) => a.start - b.start);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, source.languageVariant, text);
  let rangeIndex = 0;
  while (scanner.getTextPos() < text.length) {
    const range = protectedRanges[rangeIndex];
    if (range && scanner.getTextPos() >= range.start) {
      scanner.setTextPos(range.end);
      rangeIndex++;
      continue;
    }
    const token = scanner.scan();
    if (token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia) {
      const start = scanner.getTokenPos();
      const end = scanner.getTextPos();
      segments.push({ kind: 'comment', text: text.slice(start, end), start, end,
        lineComment: token === ts.SyntaxKind.SingleLineCommentTrivia });
    }
  }
  return segments;
}

/** @param {string} path @param {string} text */
export function analyzeSource(path, text) {
  const source = parseSource(path, text);
  return {
    segments: sourceSegments(source),
    /** @param {number} offset */
    positionAt: (offset) => source.getLineAndCharacterOfPosition(offset),
  };
}

/**
 * Build a sparse source map for escapes/newline normalization, not per-character
 * arrays. Decoded values always come from the compiler, including escape lengths.
 * @param {Segment} segment @returns {(index: number) => number}
 */
export function sourceOffset(segment) {
  const contentStart = segment.contentStart ?? segment.start;
  if (segment.raw === undefined) return (index) => contentStart + index;
  /** @type {{ decoded: number, raw: number, width: number, consumed: number }[]} */
  const changes = [];
  let delta = 0;
  for (const match of segment.raw.matchAll(/\\(?:u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[0-3][0-7]{0,2}|[4-7][0-7]?|\r\n|[\s\S])|\r\n?/g)) {
    const raw = match.index;
    const value = match[0];
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard,
      value.startsWith('\\') ? `"${value}"` : '`\n`');
    scanner.scan();
    const width = scanner.getTokenValue().length;
    changes.push({ decoded: raw - delta, raw, width, consumed: value.length });
    delta += value.length - width;
  }
  return (index) => {
    let low = 0;
    let high = changes.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if ((changes[mid]?.decoded ?? Infinity) <= index) low = mid + 1;
      else high = mid;
    }
    const change = changes[low - 1];
    if (!change) return contentStart + index;
    if (index < change.decoded + change.width) return contentStart + change.raw;
    return contentStart + change.raw + change.consumed + index - change.decoded - change.width;
  };
}
