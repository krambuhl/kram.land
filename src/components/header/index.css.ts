import { styled } from "styled-vanilla-extract/qwik";
import { tokens } from "~/tokens";

export default "";

export const Link = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${tokens.size.x96};
  height: ${tokens.size.x96};
  background-color: ${tokens.content.default};
  fill: ${tokens.bg.mid};
  border-radius: ${tokens.size.x96};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    background-color: ${tokens.content.hover};
  }

  &:active {
    transform: scale(1.2);
    background-color: ${tokens.content.pressed};
  }
`;
