import { describe, expect, it } from 'vitest';
import { isNativeText } from './native-text.ts';

describe('isNativeText', () => {
  it.each(['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Một quyển sách', 'tên', 'ca\u0300o'])('detects Vietnamese in %j', (value) => {
    expect(isNativeText(value)).toBe(true);
  });
  it.each(['hello', 'Hello! Nice to meet you.', 'café', 'Tom’s sister', '/həˈləʊ/', '5 p.m.', ''])('accepts English text %j', (value) => {
    expect(isNativeText(value)).toBe(false);
  });
});
