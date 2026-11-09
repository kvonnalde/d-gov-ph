import type { ReactNode } from 'react';
import { Badge, Body1, Title2 } from '@fluentui/react-components';

interface ComingSoonPageProps {
  title: string;
  icon: ReactNode;
}

export function ComingSoonPage({ title, icon }: ComingSoonPageProps) {
  return (
    <div className="page-content coming-soon-page">
      <section className="coming-soon-shell" aria-labelledby="feature-title">
        <div className="page-title-icon coming-soon-icon" aria-hidden="true">{icon}</div>
        <div className="coming-soon-copy">
          <Badge appearance="tint" color="brand">Coming soon</Badge>
          <Title2 id="feature-title">{title}</Title2>
          <Body1>This feature is being prepared for a future release.</Body1>
        </div>
      </section>
    </div>
  );
}