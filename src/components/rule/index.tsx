import { component$, useStyles$ } from "@builder.io/qwik";
import type { RuleProps } from "./types";

import style, { Root } from "./index.css";

export const Rule = component$<RuleProps>(() => {
  useStyles$(style);

  return <Root />;
});
