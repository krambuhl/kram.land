import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Area } from "~/components/area";
import { Card } from "~/components/card";
import { Chip } from "~/components/chip";
import { Grid } from "~/components/grid";
import { Header } from "~/components/header";
import { PageContainer } from "~/components/page-container";
import { Stack } from "~/components/stack";
import { BodyText, HeadingText } from "~/components/text";
import { tokens } from "~/tokens";

export default component$(() => {
  return (
    <>
      <PageContainer>
        <Header q:slot="header" />
        <Area width={tokens.size.x1024}>
          <Stack gap={tokens.size.x64}>
            <Grid columns={2}>
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
              >
                <Stack gap={tokens.size.x16}>
                  <HeadingText as="h1" size="xl">
                    Evan Krambuhl
                  </HeadingText>
                  <BodyText as="div">
                    <ul>
                      <li>
                        <strong>github</strong>
                        <span> &rarr; </span>
                        <a
                          href="https://github.com/krambuhl"
                          target="_blank"
                          rel="nofollow"
                        >
                          krambuhl
                        </a>
                      </li>
                      <li>
                        <strong>linkedin</strong>
                        <span> &rarr; </span>
                        <a
                          href="https://www.linkedin.com/in/evan-krambuhl/"
                          target="_blank"
                          rel="nofollow"
                        >
                          evan-krambuhl
                        </a>
                      </li>
                      <li>
                        <strong>email</strong>
                        <span> &rarr; </span>
                        <a href="mailto:evan.krambuhl@gmail.com">
                          evan.krambuhl@gmail.com
                        </a>
                      </li>
                    </ul>
                  </BodyText>
                </Stack>
              </Card>
              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.alt, tokens.bg.base]}
                backgroundImage="/map@2x.jpg"
                color={tokens.inverted.default}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <Chip>
                      <HeadingText as="h2">Portland Made</HeadingText>
                    </Chip>
                  </Stack>
                </Area>
              </Card>
            </Grid>
            <Grid columns={4}>
              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">
                      Patreon
                      <br />
                      Platform
                    </HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">
                      Patreon
                      <br />
                      Marketing
                    </HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">
                      Patreon
                      <br />
                      Product
                    </HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">Spotify</HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">Tezos</HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">Nike</HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">Intuit</HeadingText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.base]}
                padding="none"
              >
                <Area width={tokens.size.x192}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h2">Old Navy</HeadingText>
                  </Stack>
                </Area>
              </Card>
            </Grid>
          </Stack>
        </Area>
      </PageContainer>
    </>
  );
});

export const head: DocumentHead = {
  title: "portfolio — kram.land",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
