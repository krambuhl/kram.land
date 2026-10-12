import { schemaToConfig } from '../../src/index.ts';
import css from './emit.css.ts';
import tokens from './emit.tokens.ts';

export default schemaToConfig(tokens, css);
