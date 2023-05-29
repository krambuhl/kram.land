import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Area } from "~/components/area";
import { PageContainer } from "~/components/page-container";
import { Card } from "~/components/card";
import { Stack } from "~/components/stack";
import { Strata } from "~/components/strata";
import { BodyText, HeadingText } from "~/components/text";
import { Rule } from "~/components/rule";
import { tokens } from "~/tokens";

export default component$(() => {
  return (
    <>
      <Strata>
        <PageContainer>
          <Area width={tokens.size.x384}>
            <Stack gap={tokens.size.x48} align="center">
              <Card padding="none">
                <img
                  src="/ikea@1x.jpg"
                  srcSet="/ikea@1x.jpg 1x, /ikea@2x.jpg 2x"
                  alt=""
                  width={196}
                  height={196}
                  loading="eager"
                />
              </Card>

              <Stack gap={tokens.size.x24} align="center">
                <HeadingText as="h1" size="xl">
                  oh hi. hello!
                </HeadingText>

                <BodyText as="p">
                  i’m <strong>evan krambuhl</strong> and i make{" "}
                  <strong>internet</strong> with real nice people at{" "}
                  <strong>patreon</strong>
                </BodyText>

                <BodyText as="p">
                  i specialize in <strong>high quality ui</strong> and{" "}
                  <strong>thoughtful patterns</strong> to help developers to be
                  more productive
                </BodyText>

                <BodyText as="p">
                  an oregon native, you'll find me outdoorsing and swimming in
                  the rivers when they're not mountain runoff
                </BodyText>

                <BodyText as="p">
                  i love making{" "}
                  <a href="https://www.instagram.com/ev.aart">generative art</a>{" "}
                  and playing drums and have an endless appetite for live music
                  and absurdity
                </BodyText>

                <Rule />

                <BodyText as="p" size="sm">
                  say hello: <a href="mailto:evan.krambuhl@gmail.com">email</a>{" "}
                  <a href="./work">portfolio</a>
                </BodyText>

                <BodyText as="p" size="xs">
                  * i’m a busy hotdog,
                  <br />
                  please be nice
                </BodyText>
              </Stack>
            </Stack>
          </Area>
        </PageContainer>
      </Strata>
    </>
  );
});

export const head: DocumentHead = {
  title: "kram.land",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
