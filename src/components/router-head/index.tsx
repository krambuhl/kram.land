import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

/**
 * The RouterHead component is placed inside of the document `<head>` element.
 */
export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();

  return (
    <>
      <title>{head.title}</title>

      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      <meta name="author" content="evan krambuhl" />
      <meta
        name="description"
        content="making internet with the nice people who live there"
      />

      <meta property="og:url" content="https://kram.land" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="kram.land" />
      <meta
        property="og:description"
        content="making internet with the nice people who live there"
      />
      <meta property="og:image" content="https://kram.land/ikea.png" />

      <meta name="twitter:card" content="summary" />
      <meta property="twitter:domain" content="kram.land" />
      <meta property="twitter:url" content="https://kram.land" />
      <meta name="twitter:title" content="kram.land" />
      <meta
        name="twitter:description"
        content="making internet with the nice people who live there"
      />
      <meta name="twitter:image" content="https://kram.land/ikea.png" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style key={s.key} {...s.props} dangerouslySetInnerHTML={s.style} />
      ))}
    </>
  );
});
