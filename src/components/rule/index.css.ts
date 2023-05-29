import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.hr`
  margin: ${tokens.size.x12} 0;
  height: 1px;
  width: ${tokens.size.x32};
  background: ${tokens.content.default};
`;
