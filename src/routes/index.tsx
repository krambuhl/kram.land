import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { css } from "@emotion/css";
import { Image } from "@unpic/qwik";
import { Area } from "~/components/area";
import { Card } from "~/components/card";
import { Stack } from "~/components/stack";
import { Strata } from "~/components/strata";
import { BodyText, HeadingText } from "~/components/text";
import { tokens } from "~/tokens";

export default component$(() => {
  return (
    <>
      <Strata>
        <div
          class={css`
            text-align: center;
            padding: ${tokens.size.x24} ${tokens.size.x24};

            @media (${tokens.breakpoints.sm}) {
              padding: ${tokens.size.x48} ${tokens.size.x32};
            }

            @media (${tokens.breakpoints.lg}) {
              padding: ${tokens.size.x96} ${tokens.size.x48};
            }
          `}
        >
          <Area width={tokens.size.x384}>
            <Stack gap={tokens.size.x48} align="center">
              <Card padding="none">
                <Image
                  src="/ikea.png"
                  layout="constrained"
                  width={196}
                  height={196}
                  loading="eager"
                />
              </Card>

              <Stack gap={tokens.size.x24} align="center">
                <HeadingText as="h1" size="lg">
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

                <div
                  class={css`
                    margin: ${tokens.size.x12} 0;
                    height: 1px;
                    width: ${tokens.size.x96};
                    background: ${tokens.content.default};
                  `}
                />

                <BodyText as="p">
                  say hello: <a href="hello@kram.land">email</a>{" "}
                  <a href="./work">portfolio</a>
                </BodyText>

                <BodyText as="p" size="sm">
                  * i’m a busy hotdog, please be nice
                </BodyText>
              </Stack>
            </Stack>
          </Area>
        </div>
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
