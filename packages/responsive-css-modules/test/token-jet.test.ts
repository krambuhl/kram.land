import { defineSchema, loadTokens, pattern, schemaToConfig, slots } from 'token-jet';
import { describe, expect, test } from 'vitest';

import { breakpointsFromTokens } from '../src/token-jet.ts';

describe('breakpointsFromTokens', () => {
  test('takes the tagged tokens in order, named by their last segment, with resolved widths', () => {
    const breakpoint = pattern({ type: 'dimension', tags: ['media-breakpoint'] });
    const schema = defineSchema({ modes: {}, shape: { bp: slots(['base', 'sm', 'md'], breakpoint) } });
    const tokens = schema.defineTokens({
      bp: { base: { value: '0px' }, sm: { value: '32rem' }, md: { value: '{bp.sm}' } },
    });
    expect(breakpointsFromTokens(loadTokens(schemaToConfig(tokens)))).toEqual([
      { name: 'base', width: '0px' },
      { name: 'sm', width: '32rem' },
      { name: 'md', width: '32rem' },
    ]);
  });

  test('no tagged tokens is an error naming the tag', () => {
    const schema = defineSchema({ modes: {}, shape: { a: pattern({ type: 'dimension' }) } });
    const resolved = loadTokens(schemaToConfig(schema.defineTokens({ a: { value: '1px' } })));
    expect(() => breakpointsFromTokens(resolved, 'screen')).toThrow('No tokens carry the tag "screen"');
  });
});
