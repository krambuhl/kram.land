import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.div`
  display: grid;
  gap: var(--grid-gap);

  @media (${tokens.breakpoints.lg}) {
    grid-template-columns: repeat(var(--grid-columns), 1fr);
    grid-template-rows: auto;
  }
`;
