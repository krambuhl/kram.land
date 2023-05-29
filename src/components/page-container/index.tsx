import { Component, component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { PageContainerProps } from "./types";
import style, { Root } from "./index.css";

export const PageContainer = component$<PageContainerProps>(() => {
  useStyles$(style);

  return (
    <Root>
      <Slot name="header"></Slot>
      <Slot></Slot>
    </Root>
  );
});
