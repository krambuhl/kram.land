import Image from 'next/image';
import Link from 'next/link';

import { Area } from 'components/area';
import { Card } from 'components/card';
import { Stack } from 'components/stack';
import { tokens } from 'tokens';
import { BodyText, HeadingText } from 'components/text';
import { Rule } from 'components/rule';

export default function Home() {
  return (
    <Area width={tokens.size.x384}>
      <Stack gap={tokens.size.x48} align="center">
        <Card padding="none">
          <Image src="/ikea.png" alt="" width={192} height={192} sizes="(max-width: 384px) 100vw, 25vw" priority />
        </Card>

        <Stack gap={tokens.size.x24} align="center">
          <HeadingText as="h1" size="xl">
            oh hi. hello!
          </HeadingText>

          <BodyText as="p">
            i’m <strong>evan krambuhl</strong> and i make <strong>internet</strong> with real nice people at{' '}
            <strong>patreon</strong>
          </BodyText>

          <BodyText as="p">
            i specialize in <strong>high quality ui</strong> and <strong>thoughtful patterns</strong> to help developers
            to be more productive
          </BodyText>

          <BodyText as="p">
            an <abbr title="read: never owned an unbrella">oregon</abbr> native, you&apos;ll find me outdoorsing and
            swimming in the rivers when they&apos;re not mountain runoff
          </BodyText>

          <BodyText as="p">
            i love making <a href="https://www.instagram.com/ev.aart">generative art</a> and playing drums and have an
            endless appetite for live music and <abbr title="one must imagine sisyphus happy">absurdity</abbr>
          </BodyText>

          <Rule />

          <BodyText as="p" size="sm">
            say hello: <a href="mailto:evan.krambuhl@gmail.com">email</a> <Link href="/work">portfolio</Link>
          </BodyText>

          <BodyText as="p" size="xs">
            * i’m a busy hotdog,
            <br />
            please be nice
          </BodyText>
        </Stack>
      </Stack>
    </Area>
  );
}
