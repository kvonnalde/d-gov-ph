import { useEffect, useState, type FormEvent } from 'react';
import {
  Body1,
  Body2,
  Button,
  Card,
  Field,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title2,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, ArrowRightRegular, DocumentRegular, SearchRegular, ShieldTaskRegular } from '@fluentui/react-icons';
import { api } from '../api';
import { useApiResource, type ResourceState } from '../api/useApiResource';
import { DataStateView } from '../components/DataStateView';
import { CatalogDatasetDialog } from '../components/CatalogDatasetDialog';
import type { DataGovPhCatalogDataset, DataGovPhCatalogSearchResponse, SourcesResponse } from '../api/types';
import { getCatalogPeriod } from '../utils/catalogPeriod';

const isSourcesEmpty = (value: SourcesResponse) => value.items.length === 0;
const catalogPageSize = 25;
type CatalogSearchState = { status: 'idle' } | ResourceState<DataGovPhCatalogSearchResponse>;

function getPlainDescription(description: string | null) {
  if (!description) return null;
  const template = document.createElement('template');
  template.innerHTML = description;
  return template.content.textContent?.trim() || null;
}

export function SourcesPage() {
  const { state, retry } = useApiResource('sources', () => api.listSources(), isSourcesEmpty);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogState, setCatalogState] = useState<CatalogSearchState>({ status: 'idle' });
  const [catalogPage, setCatalogPage] = useState(1);
  const [selectedDataset, setSelectedDataset] = useState<DataGovPhCatalogDataset | null>(null);

  async function searchCatalog() {
    const query = catalogQuery.trim();
    setCatalogPage(1);
    setCatalogState({ status: 'loading' });
    try {
      const results = await api.searchAllDataGovPhCatalog(query, 50);
      setCatalogState(results.items.length === 0
        ? { status: 'empty', value: results }
        : { status: 'data', value: results });
    } catch (error) {
      setCatalogState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The public catalog could not be reached.',
      });
    }
  }

  function handleCatalogSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchCatalog();
  }

  function browseAllCatalog() {
    setCatalogQuery('');
    setCatalogPage(1);
    setCatalogState({ status: 'loading' });
    void api.searchAllDataGovPhCatalog('', 50).then((results) => {
      setCatalogState(results.items.length === 0
        ? { status: 'empty', value: results }
        : { status: 'data', value: results });
    }).catch((error: unknown) => {
      setCatalogState({
        status: 'error',
        message: error instanceof Error ? error.message : 'The public catalog could not be reached.',
      });
    });
  }

  useEffect(() => {
    void searchCatalog();
  }, []);

  return (
    <div className="page-content">
      <section aria-labelledby="page-title">
        <div className="page-title-row">
          <div className="page-title-icon"><DocumentRegular /></div>
          <div>
            <Title2 id="page-title">Source Registry</Title2>
            <Body1 className="page-subtitle">Review official source records and the verification status of their public data access.</Body1>
          </div>
          <Button className="title-action" appearance="subtle" icon={<ArrowClockwiseRegular />} onClick={retry}>Refresh sources</Button>
        </div>
      </section>

      <section aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <h2 id="catalog-title" className="section-title">Open Data Philippines catalog</h2>
            <p className="section-hint">Search public dataset details. Catalog entries are not verified budget records.</p>
          </div>
        </div>
        <form className="search-panel catalog-search-panel" role="search" onSubmit={handleCatalogSearch}>
          <Field label="Search public datasets" hint="Search by dataset, publisher, or topic">
            <Input
              type="search"
              value={catalogQuery}
              onChange={(_, data) => setCatalogQuery(data.value)}
              placeholder="Try budget or education"
              contentBefore={<SearchRegular />}
            />
          </Field>
          <div className="search-actions">
            <Button type="submit" appearance="primary" icon={<SearchRegular />} disabled={catalogState.status === 'loading'}>Search catalog</Button>
            <Button type="button" appearance="secondary" icon={<ArrowClockwiseRegular />} onClick={browseAllCatalog} disabled={catalogState.status === 'loading'}>Browse all datasets</Button>
          </div>
        </form>
        {catalogState.status !== 'idle' && (
          <DataStateView
            state={catalogState}
            onRetry={() => void searchCatalog()}
            emptyTitle="No catalog datasets matched"
            emptyBody="Try a different title, publisher, or topic."
          >
            {(results) => {
              const pageCount = Math.max(1, Math.ceil(results.items.length / catalogPageSize));
              const pageStart = (catalogPage - 1) * catalogPageSize;
              const visibleDatasets = results.items.slice(pageStart, pageStart + catalogPageSize);

              return (
                <Card className="table-card catalog-results" appearance="outline">
                  <div className="table-scroll">
                    <Table aria-label="Open Data Philippines datasets" size="small">
                      <TableHeader>
                        <TableRow>
                          <TableHeaderCell>Dataset</TableHeaderCell>
                          <TableHeaderCell>Dataset year / period</TableHeaderCell>
                          <TableHeaderCell>License</TableHeaderCell>
                          <TableHeaderCell>Topics</TableHeaderCell>
                          <TableHeaderCell>Resources</TableHeaderCell>
                          <TableHeaderCell>Catalog last updated</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleDatasets.map((dataset) => {
                          const description = getPlainDescription(dataset.description);
                          return (
                            <TableRow key={dataset.id}>
                              <TableCell>
                                <div className="catalog-dataset-cell">
                                  <button
                                    type="button"
                                    className="catalog-dataset-open"
                                    aria-label={`View resources for ${dataset.name}`}
                                    onClick={() => setSelectedDataset(dataset)}
                                  >
                                    {dataset.name}
                                  </button>
                                  <Body2>{dataset.publisher || 'Publisher not listed'}</Body2>
                                  {description && <p className="catalog-description">{description}</p>}
                                </div>
                              </TableCell>
                              <TableCell>{getCatalogPeriod(dataset.name)}</TableCell>
                              <TableCell>{dataset.license || 'Not listed'}</TableCell>
                              <TableCell>{dataset.topics.length ? dataset.topics.join(', ') : 'Not tagged'}</TableCell>
                              <TableCell>
                                {dataset.resources.length
                                  ? dataset.resources.map((resource) => `${resource.name}${resource.format ? ` (${resource.format})` : ''}`).join(', ')
                                  : 'No resources listed'}
                              </TableCell>
                              <TableCell>{dataset.modifiedDate || 'Not listed'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {pageCount > 1 && (
                    <div className="table-pagination">
                      <Button size="small" appearance="subtle" icon={<ArrowRightRegular className="pagination-previous-icon" />} onClick={() => setCatalogPage((page) => page - 1)} disabled={catalogPage <= 1}>Previous</Button>
                      <span>Page {catalogPage} of {pageCount}</span>
                      <Button size="small" appearance="subtle" icon={<ArrowRightRegular />} iconPosition="after" onClick={() => setCatalogPage((page) => page + 1)} disabled={catalogPage >= pageCount}>Next</Button>
                    </div>
                  )}
                  <div className="table-caption">Showing {pageStart + 1}-{Math.min(pageStart + catalogPageSize, results.items.length)} of {results.total} catalog datasets | Metadata from data.gov.ph; verification is still required.</div>
                </Card>
              );
            }}
          </DataStateView>
        )}
      </section>

      <section aria-labelledby="registered-sources-title">
        <div className="section-heading">
          <div>
            <h2 id="registered-sources-title" className="section-title">Registered sources</h2>
            <p className="section-hint">Sources already stored in D-Gov PH with their verification status.</p>
          </div>
        </div>
        <DataStateView
          state={state}
          onRetry={retry}
          emptyTitle="No public sources are registered"
          emptyBody="Registered sources will appear here with their public record type and verification status."
          emptyAction={<Button as="a" href="/budget" appearance="primary" icon={<ShieldTaskRegular />}>Review verification requirements</Button>}
        >
          {(sources) => (
            <Card className="table-card" appearance="outline">
              <div className="table-scroll">
                <Table aria-label="Registered public data sources" size="small">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Organization</TableHeaderCell>
                      <TableHeaderCell>Public record type</TableHeaderCell>
                      <TableHeaderCell>Verification status</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sources.items.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell><span className="source-name">{source.organization}</span></TableCell>
                        <TableCell>{source.publicRecordType}</TableCell>
                        <TableCell><span className={source.verificationState === 'Verified' ? 'status-badge status-verified' : 'status-badge status-neutral'}>{source.verificationState}</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="table-caption">Registered public data sources and their current verification status.</div>
            </Card>
          )}
        </DataStateView>
      </section>
      <CatalogDatasetDialog dataset={selectedDataset} onClose={() => setSelectedDataset(null)} />
    </div>
  );
}