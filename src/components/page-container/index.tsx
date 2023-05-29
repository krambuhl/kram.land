import { Component, component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { PageContainerProps } from "./types";
import style, { Root } from "./index.css";

export const PageContainer = component$<PageContainerProps>(({ Header }) => {
  useStyles$(style);

  return (
    <Root>
      {Header && <Header />}
      <Slot></Slot>
    </Root>
  );
});
