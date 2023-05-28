import type { FontVariant, Size } from "~/types/common";

export interface TextProps {
  as?:
    | "div"
    | "p"
    | "span"
    | "pre"
    | "code"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6";
  variant?: FontVariant;
  size?: Size;
}

export interface HeadingTextProps extends Pick<TextProps, "size"> {
  as?: Extract<TextProps["as"], "h1" | "h2" | "h3" | "h4" | "h5" | "h6">;
}

export interface BodyTextProps extends Pick<TextProps, "size"> {
  as?: Extract<TextProps["as"], "div" | "p" | "span">;
}

export interface DataTextProps extends Pick<TextProps, "size"> {
  as?: Extract<TextProps["as"], "div" | "pre" | "code">;
}
