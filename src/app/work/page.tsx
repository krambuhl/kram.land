import Image from 'next/image';

import { Area } from 'components/area';
import { Card } from 'components/card';
import { Stack } from 'components/stack';
import { tokens } from 'tokens';
import { BodyText, HeadingText } from 'components/text';
import { Grid } from 'components/grid';
import { Chip } from 'components/chip';

export default function Work() {
  return (
    <Area width={tokens.size.x1024}>
      <Stack gap={tokens.size.x64} align="center">
        <Grid columns={2}>
          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.base]}>
            <Stack gap={tokens.size.x16} align="center">
              <HeadingText as="h1" size="xl">
                Evan Krambuhl
              </HeadingText>
              <BodyText as="div">
                <ul>
                  <li>
                    <strong>github</strong>
                    <span> &rarr; </span>
                    <a href="https://github.com/krambuhl" target="_blank" rel="nofollow">
                      krambuhl
                    </a>
                  </li>
                  <li>
                    <strong>linkedin</strong>
                    <span> &rarr; </span>
                    <a href="https://www.linkedin.com/in/evan-krambuhl/" target="_blank" rel="nofollow">
                      evan-krambuhl
                    </a>
                  </li>
                  <li>
                    <strong>email</strong>
                    <span> &rarr; </span>
                    <a href="mailto:evan.krambuhl@gmail.com">evan.krambuhl@gmail.com</a>
                  </li>
                </ul>
              </BodyText>
            </Stack>
          </Card>
          <Card
            backgroundColor={tokens.bg.mid}
            backgroundGradient={[tokens.bg.mid, tokens.bg.base]}
            backgroundImage={
              <Image
                src="/map.png"
                alt="Map"
                height={480}
                width={480}
                sizes="(max-width: 768px) 100vw, 25vw"
                priority
              />
            }
            color={tokens.inverted.default}
            padding="none"
          >
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <Chip>
                  <HeadingText as="h2">Portland Made</HeadingText>
                </Chip>
              </Stack>
            </Area>
          </Card>
        </Grid>

        <Grid columns={4}>
          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">
                  Patreon
                  <br />
                  Platform
                </HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">
                  Patreon
                  <br />
                  Marketing
                </HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">
                  Patreon
                  <br />
                  Product
                </HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">Spotify</HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">Tezos</HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">Nike</HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">Intuit</HeadingText>
              </Stack>
            </Area>
          </Card>

          <Card backgroundColor={tokens.bg.mid} backgroundGradient={[tokens.bg.mid, tokens.bg.low]}>
            <Area width={tokens.size.x192}>
              <Stack gap={tokens.size.x16} align="center">
                <HeadingText as="h2">Old Navy</HeadingText>
              </Stack>
            </Area>
          </Card>
        </Grid>
      </Stack>
    </Area>
  );
}
