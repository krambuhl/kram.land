import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.div`
  text-align: center;
  padding: ${tokens.size.x24} ${tokens.size.x24};

  @media (${tokens.breakpoints.sm}) {
    padding: ${tokens.size.x48} ${tokens.size.x32};
  }

  @media (${tokens.breakpoints.md}) {
    padding: ${tokens.size.x64} ${tokens.size.x48};
  }

  @media (${tokens.breakpoints.lg}) {
    padding: ${tokens.size.x80} ${tokens.size.x48};
  }
`;