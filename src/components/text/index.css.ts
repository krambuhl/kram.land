import { globalStyle } from "@vanilla-extract/css";
import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.span`
  font-size: var(--text-font-size);
  font-weight: var(--text-font-weight);
  line-height: var(--text-line-height);
`;

globalStyle(`${Root} strong`, {
  fontWeight: 700,
});

globalStyle(`${Root} ul`, {
  display: "flex",
  flexDirection: "column",
  gap: tokens.size.x4,
});
