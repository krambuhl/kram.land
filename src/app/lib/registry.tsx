'use client';

import React, { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import isPropValid from '@emotion/is-prop-valid';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

// styled-components 6 forwards every prop to the dom. this drops non-html props
// (ratio, gap, backgroundColor) so components keep plain prop names, not `$` props.
function shouldForwardProp(propName: string, target: unknown) {
  return typeof target === 'string' ? isPropValid(propName) : true;
}

export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== 'undefined') {
    return <StyleSheetManager shouldForwardProp={shouldForwardProp}>{children}</StyleSheetManager>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance} shouldForwardProp={shouldForwardProp}>
      {children}
    </StyleSheetManager>
  );
}
