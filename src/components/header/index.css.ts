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
  background-image: linear-gradient(
    165deg,
    ${tokens.content.default},
    ${tokens.content.pressed}
  );
  fill: ${tokens.bg.elevated};
  border-radius: ${tokens.size.x96};
  transition: all 0.5s ease;

  &:hover {
    transform: scale(1.1);
    background-image: linear-gradient(
      165deg,
      ${tokens.content.default},
      ${tokens.content.default}
    );
  }
`;
