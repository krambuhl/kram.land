import { createContext, useContext } from 'react';

export type ModeValue = 'light' | 'dark' | 'auto' | 'inverted';

const ModeContext = createContext<ModeValue>('auto');

// light and dark are absolute. auto and inverted are relative to the os
// scheme, so inverting one gives the other and css resolves the rest.
export function resolveMode(value: ModeValue, parent: ModeValue): ModeValue {
  if (value !== 'inverted') return value;
  switch (parent) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'light';
    case 'auto':
      return 'inverted';
    case 'inverted':
      return 'auto';
  }
}

interface ModeProps {
  value: ModeValue;
  children: React.ReactNode;
}

export function Mode({ value, children }: ModeProps) {
  const mode = resolveMode(value, useContext(ModeContext));
  return (
    <ModeContext value={mode}>
      <div data-mode={mode}>{children}</div>
    </ModeContext>
  );
}
