import { useState } from 'react';
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
import { ArrowRightRegular, ChartMultipleRegular } from '@fluentui/react-icons';
import { Link } from 'react-router-dom';
import { api } from '../../../api';
import { useApiResource } from '../../../api/useApiResource';
import { DataStateView } from '../../../components/DataStateView';
import type { BudgetRecordsResponse } from '../../../api/types';
import { GovernmentDatasetsPreview } from '../components/GovernmentDatasetsPreview';
import { TablePagination } from '../components/TablePagination';
import { TableText } from '../components/TableText';

const overviewPageSize = 25;
const isRecordListEmpty = (value: BudgetRecordsResponse) => value.items.length === 0;

export function BudgetLensOverviewPage() {
  const [page, setPage] = useState(1);
  const { state, retry } = useApiResource(
    `budget-lens-overview-records-${page}`,
    () => api.listBudgetRecords({ page, pageSize: overviewPageSize }),
    isRecordListEmpty,
  );

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
        <p className="hero-eyebrow"><span aria-hidden="true" />Budget Lens</p>
        <Title1 id="page-title" className="hero-title">Public money, traceable to its source.</Title1>
        <Body1 className="hero-subtitle">Explore public datasets and verified budget records with provenance kept in view.</Body1>
        <div className="hero-actions">
          <Button as="a" href="/budget-lens/datasets" appearance="primary" icon={<ChartMultipleRegular />} iconPosition="before">Government datasets</Button>
          <Button as="a" href="/budget-lens/sources" appearance="outline" icon={<ArrowRightRegular />} iconPosition="after" className="hero-secondary">Source Registry</Button>
        </div>
      </section>

      <GovernmentDatasetsPreview title="Government datasets matching budget" query="budget" />

      <section aria-labelledby="verified-records-title" className="records-section">
        <div className="section-heading">
          <div>
            <h2 id="verified-records-title" className="section-title"><ChartMultipleRegular />Verified budget records</h2>
            <p className="section-hint">Records verified against their published sources</p>
          </div>
          <Link className="quiet-link" to="/budget-lens/sources">View source registry <ArrowRightRegular /></Link>
        </div>
        <DataStateView
          state={state}
          onRetry={retry}
          emptyTitle="No verified budget records are listed"
          emptyBody="Verified records will appear here after their source information has been reviewed."
          emptyAction={<Button as="a" href="/budget-lens/sources" appearance="primary">Review registered sources</Button>}
        >
          {(records) => (
            <Card className="table-card" appearance="outline">
              <div className="table-scroll">
                <Table aria-label="Verified budget records" size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Source</TableHeaderCell>
                      <TableHeaderCell>Public record</TableHeaderCell>
                      <TableHeaderCell>Fiscal period</TableHeaderCell>
                      <TableHeaderCell>Provenance status</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.items.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell><TableText value={record.publisher} className="source-name" /></TableCell>
                        <TableCell><TableText value={record.title} /></TableCell>
                        <TableCell><TableText value={record.fiscalPeriod} /></TableCell>
                        <TableCell><TableText value={record.displayState} className="status-badge status-verified" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination page={page} pageSize={overviewPageSize} total={records.total} onPageChange={setPage} />
              <div className="table-caption">Showing {records.items.length === 0 ? 0 : (page - 1) * overviewPageSize + 1}-{Math.min(page * overviewPageSize, records.total)} of {records.total} verified records.</div>
            </Card>
          )}
        </DataStateView>
      </section>
    </div>
  );
}
