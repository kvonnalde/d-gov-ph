import { Badge, Body1, Card, Title1 } from '@fluentui/react-components';
import { ArrowRightRegular, ChartMultipleRegular, DocumentRegular, SearchRegular, ShieldTaskRegular } from '@fluentui/react-icons';
import { Link } from 'react-router-dom';

const features = [
  { title: 'Budget Lens', description: 'Explore government datasets, sources, and verified budget records.', to: '/budget-lens/overview', status: 'Available', icon: <ChartMultipleRegular /> },
  { title: 'Ready PH', description: 'Prepare and review public-service readiness information.', to: '/ready-ph', status: 'Coming soon', icon: <ShieldTaskRegular /> },
  { title: 'GovAssist', description: 'Find guidance across public government information.', to: '/govassist', status: 'Coming soon', icon: <SearchRegular /> },
  { title: 'Local Pulse', description: 'Explore local community indicators and public records.', to: '/local-pulse', status: 'Coming soon', icon: <DocumentRegular /> },
  { title: 'Open Stats', description: 'Browse public statistics and open-data summaries.', to: '/open-stats', status: 'Coming soon', icon: <ArrowRightRegular /> },
];

export function OverviewPage() {
  return (
    <div className="page-content workspace-home">
      <section className="workspace-welcome" aria-labelledby="page-title">
        <p className="hero-eyebrow"><span aria-hidden="true" />Public information workspace</p>
        <Title1 id="page-title" className="workspace-title">D-Gov PH</Title1>
        <Body1 className="workspace-description">Explore public data through a growing set of focused government tools.</Body1>
      </section>
      <section aria-labelledby="features-title">
        <div className="section-heading">
          <div>
            <h2 id="features-title" className="section-title">Features</h2>
            <p className="section-hint">Choose a workspace to continue.</p>
          </div>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <Link className="feature-card-link" key={feature.title} to={feature.to}>
              <Card className="feature-card" appearance="outline">
                <div className="feature-card-top">
                  <span className="feature-icon" aria-hidden="true">{feature.icon}</span>
                  <Badge appearance={feature.status === 'Available' ? 'filled' : 'tint'} color={feature.status === 'Available' ? 'brand' : 'informative'}>{feature.status}</Badge>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-card-action">Open <ArrowRightRegular /></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}