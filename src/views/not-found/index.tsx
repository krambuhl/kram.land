import { PageContainer } from 'components/page-container';
import { Stack } from 'components/stack';
import { tokens } from 'tokens';
import { BodyText, HeadingText } from 'components/text';

export function NotFound() {
  return (
    <PageContainer>
      <Stack gap={tokens.size.x16} align="center">
        <HeadingText as="h1" size="xl">
          404
        </HeadingText>
        <BodyText as="p">
          this page could not be found. <a href="/">go home</a>
        </BodyText>
      </Stack>
    </PageContainer>
  );
}
