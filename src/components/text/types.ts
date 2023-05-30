import type { FontVariant, Size } from 'types/common';

export interface TextProps {
  as?: 'div' | 'p' | 'span' | 'pre' | 'code' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: FontVariant;
  size?: Size;
  children: React.ReactNode;
}

export interface HeadingTextProps extends Omit<TextProps, 'as' | 'variant'> {
  as?: Extract<TextProps['as'], 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
}

export interface BodyTextProps extends Omit<TextProps, 'as' | 'variant'> {
  as?: Extract<TextProps['as'], 'div' | 'p' | 'span'>;
}

export interface DataTextProps extends Omit<TextProps, 'as' | 'variant'> {
  as?: Extract<TextProps['as'], 'div' | 'pre' | 'code'>;
}
