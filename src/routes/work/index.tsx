import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Area } from "~/components/area";
import { Card } from "~/components/card";
import { Grid } from "~/components/grid";
import { PageContainer } from "~/components/page-container";
import { Stack } from "~/components/stack";
import { Strata } from "~/components/strata";
import { BodyText, HeadingText } from "~/components/text";
import { tokens } from "~/tokens";

export default component$(() => {
  return (
    <>
      <Strata>
        <PageContainer>
          <Area width={tokens.size.x1024}>
            <Grid columns={2}>
              <Card>
                <Stack gap={tokens.size.x16}>
                  <HeadingText as="h1">Hello World</HeadingText>
                  <BodyText as="p">
                    Duis cillum proident ad do velit minim est in incididunt
                    elit laborum. Et ea esse nulla aliqua incididunt qui. Duis
                    id commodo sint et voluptate ullamco sint irure excepteur
                    nisi id incididunt dolore amet. Ea veniam magna sint veniam
                    ullamco duis deserunt amet enim occaecat do excepteur.
                    Cupidatat aliquip qui enim eiusmod irure voluptate irure
                    mollit ex deserunt est sunt. Officia ad anim esse sint. Duis
                    occaecat nostrud ea dolor cillum ipsum.
                  </BodyText>
                </Stack>
              </Card>

              <Card
                backgroundColor={tokens.bg.alt}
                backgroundGradient={[tokens.bg.alt, tokens.bg.base]}
                color={tokens.muted.default}
              >
                <Stack gap={tokens.size.x16} align="center">
                  <HeadingText as="h1">Hello World</HeadingText>
                  <BodyText as="p">
                    Id anim duis tempor proident qui Lorem velit consectetur.
                    Consequat esse fugiat duis incididunt nulla. Excepteur
                    labore aliqua reprehenderit tempor exercitation. Anim aute
                    proident deserunt nulla aute aliquip ex tempor cillum fugiat
                    dolor magna. Occaecat sunt minim incididunt dolor occaecat
                    voluptate.
                  </BodyText>
                </Stack>
              </Card>
            </Grid>
          </Area>
        </PageContainer>
      </Strata>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
