import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Area } from "~/components/area";
import { Card } from "~/components/card";
import { Chip } from "~/components/chip";
import { Grid } from "~/components/grid";
import { PageContainer } from "~/components/page-container";
import { Stack } from "~/components/stack";
import { BodyText, HeadingText } from "~/components/text";
import { tokens } from "~/tokens";

export default component$(() => {
  return (
    <>
      <PageContainer>
        <Stack gap={tokens.size.x64}>
          <Area width={tokens.size.x192}>
            <a href="/">
              <svg
                width="96"
                height="96"
                viewBox="0 0 512 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_203_2)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M109.5 402.5C190.41 483.41 321.59 483.41 402.5 402.5C475.75 329.25 512.375 292.625 512.375 256C512.375 219.375 475.75 182.75 402.5 109.5C321.59 28.5903 190.41 28.5903 109.5 109.5C36.25 182.75 -0.375 219.375 -0.375 256C-0.375 292.625 36.25 329.25 109.5 402.5ZM151.429 360.568C209.18 418.32 302.814 418.32 360.566 360.568C441.634 279.5 443 233.866 360.566 151.432C302.814 93.6801 209.18 93.6801 151.429 151.432C69.5 233.361 69.5 278.639 151.429 360.568Z"
                    fill="white"
                  />
                  <path
                    d="M319.52 319.523C284.437 354.606 227.557 354.606 192.474 319.523C157.392 284.44 157.392 227.56 192.474 192.477C227.557 157.394 284.437 157.394 319.52 192.477C354.603 227.56 354.603 284.44 319.52 319.523Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_203_2">
                    <rect width="512" height="512" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </a>
          </Area>
          <Area width={tokens.size.x1024}>
            <Grid columns={2}>
              <Card
                backgroundColor={tokens.bg.elevated}
                backgroundGradient={[tokens.bg.elevated, tokens.bg.alt]}
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
                backgroundImage="/map.png"
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
        </Stack>
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
