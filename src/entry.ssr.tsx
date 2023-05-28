/**
 * WHAT IS THIS FILE?
 *
 * SSR entry point, in all cases the application is rendered outside the browser, this
 * entry point will be the common one.
 *
 * - Server (express, cloudflare...)
 * - npm run start
 * - npm run preview
 * - npm run build
 *
 */
import {
  // renderToString,
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
// import { extractCritical } from "@emotion/server";
import { manifest } from "@qwik-client-manifest";
import Root from "./root";

export default async function (opts: RenderToStreamOptions) {
  // const render = await renderToString(<Root />, { manifest, ...opts });
  // const { css } = extractCritical(render.html);

  return renderToStream(
    <Root
    // emotionExtract={{
    //   css,
    // }}
    />,
    {
      manifest,
      ...opts,
      // Use container attributes to set attributes on the html tag.
      containerAttributes: {
        lang: "en-us",
        ...opts.containerAttributes,
      },
    }
  );
}
