import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.div`
  display: grid;
  width: 100%;
  gap: var(--grid-gap);

  @media (${tokens.breakpoints.lg}) {
    grid-template-columns: repeat(var(--grid-columns), minmax(200px, 1fr));
    grid-template-rows: auto;
  }
`;
