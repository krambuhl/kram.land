import { component$, useStyles$, Slot } from "@builder.io/qwik";
import type { AreaProps } from "./types";
import { tokens } from "~/tokens";
import style, { Container, Root } from "./index.css";

export const Area = component$<AreaProps>(({ width = tokens.size.x1280 }) => {
  useStyles$(style);

  return (
    <Root style={{ "--area-width": width }}>
      <Container>
        <Slot></Slot>
      </Container>
    </Root>
  );
});
