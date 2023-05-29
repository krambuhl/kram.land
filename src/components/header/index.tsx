import { component$, useStyles$ } from "@builder.io/qwik";
import type { HeaderProps } from "./types";
import { tokens } from "~/tokens";
import { Area } from "../area";
import { IconEye } from "../icon";
import style, { Link } from "./index.css";
import { Stack } from "../stack";

export const Header = component$<HeaderProps>(() => {
  useStyles$(style);
  return (
    <Area width={tokens.size.x192}>
      <Stack align="center">
        <Link href="/">
          <IconEye />
        </Link>
      </Stack>
    </Area>
  );
});
