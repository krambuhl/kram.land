import { component$, Slot } from "@builder.io/qwik";
import type {
  BodyTextProps,
  DataTextProps,
  HeadingTextProps,
  TextProps,
} from "./types";
import { css } from "@emotion/css";
import { tokens } from "~/tokens";

const Text = component$<TextProps>(
  ({ as: Tag = "span", variant = "body", size = "md" }) => {
    return (
      <Tag
        class={css`
          font-size: ${tokens.fontSize[variant][size]};
          font-weight: ${tokens.fontWeight[variant]};
          line-height: ${tokens.lineHeight[variant]};

          strong {
            font-weight: 700;
          }
        `}
      >
        <Slot></Slot>
      </Tag>
    );
  }
);

export const HeadingText = component$<HeadingTextProps>(
  ({ as = "h2", size = "md" }) => {
    return (
      <Text variant="heading" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);

export const BodyText = component$<BodyTextProps>(
  ({ as = "span", size = "md" }) => {
    return (
      <Text variant="body" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);

export const DataText = component$<DataTextProps>(
  ({ as = "pre", size = "md" }) => {
    return (
      <Text variant="data" as={as} size={size}>
        <Slot></Slot>
      </Text>
    );
  }
);
