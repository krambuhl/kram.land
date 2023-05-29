import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Container = styled.div`
  max-width: var(--area-width);
  @media (${tokens.breakpoints.lg}) {
    width: 100%;
  }
`;
