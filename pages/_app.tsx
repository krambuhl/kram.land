import type { AppProps } from 'next/app'

import Head from 'next/head'

import { HtmlTitle } from 'components/shared/HtmlTitle'

import 'the-new-css-reset/css/reset.css'
import 'tokens/tokens.css'
import 'styles/globals.css'
import 'styles/tokens.css'

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <HtmlTitle />

      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

export default CustomApp
