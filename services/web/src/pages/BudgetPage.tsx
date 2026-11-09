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
  Title2,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, DocumentSearchRegular } from '@fluentui/react-icons';
import { api } from '../api';
import { useApiResource } from '../api/useApiResource';
import { DataStateView } from '../components/DataStateView';
import { BudgetRecordDialog } from '../components/BudgetRecordDialog';
import { GovernmentDatasetsPreview } from '../components/GovernmentDatasetsPreview';
import type { BudgetRecordDetail, BudgetRecordsResponse } from '../api/types';

const isRecordListEmpty = (value: BudgetRecordsResponse) => value.items.length === 0;

export function BudgetPage() {
  const [selectedRecord, setSelectedRecord] = useState<BudgetRecordDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const { state, retry } = useApiResource('verified-budget-records', () => api.listBudgetRecords(), isRecordListEmpty);

  async function openRecord(id: string) {
    setDetailError(null);
    try {
      const detail = await api.getBudgetRecord(id);
      if (detail) setSelectedRecord(detail);
      else setDetailError('The verified record was not found.');
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Record details could not be loaded.');
    }
  }

  return (
    <div className="page-content">
      <section aria-labelledby="page-title">
        <div className="page-title-row">
          <div className="page-title-icon"><DocumentSearchRegular /></div>
          <div>
            <Title2 id="page-title">Budget Explorer</Title2>
            <Body1 className="page-subtitle">Search public datasets and review verified budget records.</Body1>
          </div>
        </div>
      </section>

      <GovernmentDatasetsPreview title="Government datasets" pageSize={50} showSearch showFilters />

      <section aria-labelledby="results-title">
        <div className="section-heading">
          <div>
            <h2 id="results-title" className="section-title">Verified budget records</h2>
            <p className="section-hint">Only records verified against a public source appear here.</p>
          </div>
          <Button appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={retry}>Refresh records</Button>
        </div>
        {detailError && <p className="inline-error" role="alert">{detailError}</p>}
        <DataStateView
          state={state}
          onRetry={retry}
          emptyTitle="No verified budget records are listed"
          emptyBody="The public catalog results above are source metadata. They are not imported here as verified budget records."
        >
          {(records) => (
            <Card className="table-card" appearance="outline">
              <div className="table-scroll">
                <Table aria-label="Budget documents" size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Budget document</TableHeaderCell>
                      <TableHeaderCell>Publisher</TableHeaderCell>
                      <TableHeaderCell>Fiscal period</TableHeaderCell>
                      <TableHeaderCell>Source verification</TableHeaderCell>
                      <TableHeaderCell><span className="sr-only">Record details</span></TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.items.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell><span className="source-name">{record.title}</span></TableCell>
                        <TableCell>{record.publisher}</TableCell>
                        <TableCell>{record.fiscalPeriod}</TableCell>
                        <TableCell><span className="status-badge status-verified">{record.displayState}</span></TableCell>
                        <TableCell>
                          <Button
                            appearance="subtle"
                            icon={<DocumentSearchRegular />}
                            aria-label={`View ${record.title} details`}
                            title="View source provenance"
                            onClick={() => void openRecord(record.id)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="table-caption">{records.total} verified records | Amounts are not shown until source mapping is verified.</div>
            </Card>
          )}
        </DataStateView>
      </section>
      <BudgetRecordDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}