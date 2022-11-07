import type { HtmlTitleProps } from './types'

import { SITE_NAME } from 'data/constants'

export function HtmlTitle({ title }: HtmlTitleProps) {
  const pageTitle = title ? ` — ${title}` : ''
  const fullTitle = `${SITE_NAME}${pageTitle}`

  return (
    <title>{fullTitle}</title>
  )
}
