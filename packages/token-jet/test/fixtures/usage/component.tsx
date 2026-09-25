import { token } from 'generated/tokens';

export function Card() {
  return <div style={{ padding: token('space.x16') }}>{token('content.muted.default')}</div>;
}
