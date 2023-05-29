import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: ${tokens.radius.md};
  overflow: hidden;
  padding: var(--card-padding);
  color: var(--card-color);
  background-color: var(--card-background-color);
  background-image: var(--card-background-image) var(--card-background-gradient);
`;
