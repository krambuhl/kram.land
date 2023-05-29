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

            {/* 
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.alt]}
              >
                <Area width={tokens.size.x384}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h1">Hello World</HeadingText>
                    <BodyText as="p">
                      Qui exercitation Lorem id velit magna velit et. Sit
                      exercitation excepteur nostrud cupidatat enim
                      reprehenderit. Nisi sit eu id adipisicing excepteur
                      laboris anim. Sit consectetur ipsum tempor qui irure
                      fugiat aliquip nostrud.
                    </BodyText>
                  </Stack>
                </Area>
              </Card>
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.alt]}
              >
                <Area width={tokens.size.x384}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h1">Hello World</HeadingText>
                    <BodyText as="p">
                      Laboris fugiat tempor culpa magna ipsum fugiat nulla magna
                      duis labore. Aliqua nulla est sit sunt est consequat
                      nostrud ea laborum dolore excepteur velit. Magna velit
                      irure ut anim irure velit eiusmod elit ex veniam eu
                      consequat. Reprehenderit aliquip laboris labore ea
                      proident veniam labore.
                    </BodyText>
                  </Stack>
                </Area>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.alt, tokens.bg.base]}
                color={tokens.muted.default}
              >
                <Area width={tokens.size.x384}>
                  <Stack gap={tokens.size.x16} align="center">
                    <HeadingText as="h1">Hello World</HeadingText>
                    <BodyText as="p">
                      Officia veniam est nostrud Lorem fugiat eu fugiat tempor
                      consectetur in mollit. Non excepteur tempor dolor enim
                      sint do ad. Sint deserunt sint id sint ipsum proident
                      nulla est cillum. Id voluptate sunt et laborum. Laborum do
                      excepteur irure excepteur in sit in ullamco eiusmod
                      adipisicing ad. Cupidatat elit commodo exercitation qui
                      qui veniam sunt culpa sint voluptate sunt. Laboris irure
                      aliqua qui et labore elit non commodo eiusmod ullamco
                      aliqua cillum.
                    </BodyText>
                  </Stack>
                </Area>
              </Card>
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.alt]}
              >
                <Area width={tokens.size.x384}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h1">Hello World</HeadingText>
                    <BodyText as="p">
                      Cupidatat eiusmod consectetur nulla qui velit pariatur
                      ipsum. Esse commodo laborum dolore in ullamco veniam
                      mollit. Eu consectetur elit aliqua anim cupidatat.
                    </BodyText>
                  </Stack>
                </Area>
              </Card>
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.alt]}
              >
                <Area width={tokens.size.x384}>
                  <Stack gap={tokens.size.x16}>
                    <HeadingText as="h1">Hello World</HeadingText>
                    <BodyText as="p">
                      Dolore nostrud laborum aliqua quis proident culpa culpa
                      pariatur enim reprehenderit mollit. Nulla eu fugiat
                      voluptate velit minim aliquip. Cupidatat ad dolor in
                      consequat aliquip. Sit culpa ipsum quis ex. Adipisicing
                      sint consectetur aliqua aute ex quis non id. Exercitation
                      ut et mollit pariatur exercitation minim proident proident
                      officia magna sunt voluptate. Commodo minim eu velit culpa
                      laboris pariatur voluptate culpa eu sint fugiat sit.
                    </BodyText>
                  </Stack>
                </Area>
              </Card> */}
          </Grid>
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
