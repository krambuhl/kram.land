import Head from 'next/head'
import type { HtmlTitleProps } from './types'

import { useDataContext } from 'components/DataContext'

export function HtmlTitle({ title }: HtmlTitleProps) {
  const {
    constants: { SITE_NAME },
  } = useDataContext()

  const pageTitle = title ? ` — ${title}` : ''
  const fullTitle = `${SITE_NAME}${pageTitle}`

  return (
    <Head>
      <title>{fullTitle}</title>
    </Head>
  )
}
