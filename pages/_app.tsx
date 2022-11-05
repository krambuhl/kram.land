import Head from 'next/head'
import type { AppProps } from 'next/app'

import { DataContext } from 'components/DataContext'
import { HtmlTitle } from 'components/HtmlTitle'
import { AppLayout } from 'components/AppLayout'
import { constants } from 'data'

import 'the-new-css-reset/css/reset.css'
import 'tokens/tokens.css'
import 'styles/globals.css'
import 'styles/tokens.css'

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <DataContext.Provider value={{ constants }}>
      <AppLayout>
        <HtmlTitle />

        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Component {...pageProps} />
      </AppLayout>
    </DataContext.Provider>
  )
}

export default CustomApp
