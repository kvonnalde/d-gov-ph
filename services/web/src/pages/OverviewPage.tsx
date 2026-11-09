import {
  Body1,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
} from '@fluentui/react-components';
import {
  ArrowRightRegular,
  ChartMultipleRegular,
} from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { GovernmentDatasetsPreview } from '../components/GovernmentDatasetsPreview';
import { useApiResource } from '../api/useApiResource';
import { DataStateView } from '../components/DataStateView';
import type { DashboardResponse } from '../api/types';

const isDashboardEmpty = (value: DashboardResponse) => value.latestRecords.length === 0;

export function OverviewPage() {
  const { state, retry } = useApiResource('dashboard', () => api.getDashboard(), isDashboardEmpty);

  return (
    <div className="page-content overview-page">
      <section className="hero-region" aria-labelledby="page-title">
        <svg className="hero-mesh" aria-hidden="true" viewBox="0 0 800 400" preserveAspectRatio="none">
          <defs>
            <radialGradient id="hero-accent" cx="0%" cy="0%" r="80%">
              <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hero-primary" cx="100%" cy="100%" r="80%">
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="400" fill="url(#hero-accent)" />
          <rect width="800" height="400" fill="url(#hero-primary)" />
        </svg>
        <p className="hero-eyebrow"><span aria-hidden="true" />Public records / source provenance</p>
        <Title1 id="page-title" className="hero-title">Public money, traceable to its source.</Title1>
        <Body1 className="hero-subtitle">
          Explore Philippine government budget information with provenance and verification status kept in view.
        </Body1>
        <div className="hero-actions">
          <Button as="a" href="/budget" appearance="primary" icon={<ChartMultipleRegular />} iconPosition="before">
            Explore budget records
          </Button>
          <Button as="a" href="/sources" appearance="outline" icon={<ArrowRightRegular />} iconPosition="after" className="hero-secondary">
            Review source registry
          </Button>
        </div>
      </section>

      <GovernmentDatasetsPreview title="Government datasets matching budget" query="budget" />

      <section aria-labelledby="recent-records-title" className="records-section">
        <div className="section-heading">
          <div>
            <h2 id="recent-records-title" className="section-title"><ChartMultipleRegular />Recent public records</h2>
            <p className="section-hint">Latest verified records returned by the API</p>
          </div>
          <Link className="quiet-link" to="/sources">View source registry <ArrowRightRegular /></Link>
        </div>
        <DataStateView
          state={state}
          onRetry={retry}
          emptyTitle="No public records are listed"
          emptyBody="Records will appear when source information is available for review."
          emptyAction={<Button as="a" href="/sources" appearance="primary">Review registered sources</Button>}
        >
          {(dashboard) => (
            <Card className="table-card" appearance="outline">
              <div className="table-scroll">
                <Table aria-label="Recent public records" size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Source</TableHeaderCell>
                      <TableHeaderCell>Public record</TableHeaderCell>
                      <TableHeaderCell>Provenance status</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboard.latestRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell><span className="source-name">{record.source}</span></TableCell>
                        <TableCell>{record.record}</TableCell>
                        <TableCell><span className="status-badge status-verified">{record.displayState}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="table-caption">{dashboard.verifiedSourceCount} verified sources | Only verified records are returned.</div>
            </Card>
          )}
        </DataStateView>
      </section>
    </div>
  );
}