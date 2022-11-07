import type { PageHeaderProps } from './types'

import { Stack } from 'components/shared/Stack'
import { DataText, HeadingText } from 'components/shared/Text'
import { tokens } from 'tokens'

export function PageHeader({
  title,
  subtitle,
  date,
  ...props
}: PageHeaderProps) {
  return (
    <Stack as="header" gap={tokens.size.x12} {...props}>
      <HeadingText as="h1" size="lg">
        {title}
      </HeadingText>

      {subtitle && (
        <HeadingText as="h2" size="md">
          {subtitle}
        </HeadingText>
      )}

      {date && (
        <DataText as="div" size="xs">
          {new Date(date)?.toLocaleDateString() ?? '—'}
        </DataText>
      )}
    </Stack>
  )
}
