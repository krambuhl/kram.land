import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Root = styled.div`
  --smooth-corners: 6;

  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: ${tokens.radius.container};
  overflow: hidden;
  padding: var(--card-padding);
  color: var(--card-color);
  background-color: var(--card-background-color);
  background-image: var(--card-background-image),
    var(--card-background-gradient);
  background-size: cover;
  mask-image: paint(smooth-corners);
  -webkit-mask-image: paint(smooth-corners);
  min-height: 80vw;

  @media (${tokens.breakpoints.sm}) {
    --smooth-corners: 5;
    min-height: 0vh;
    aspect-ratio: 1 / 1;
  }

  @media (${tokens.breakpoints.lg}) {
    --smooth-corners: 4;
  }
`;
