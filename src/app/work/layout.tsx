import { PageHeader } from 'components/page-header';

interface WorkLayoutProps {
  children: React.ReactNode;
}

export default function WorkLayout({ children }: WorkLayoutProps) {
  return (
    <>
      <PageHeader />
      {children}
    </>
  );
}
