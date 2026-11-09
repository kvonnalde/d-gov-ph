import { useState, type FormEvent } from 'react';
import {
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
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, SearchRegular } from '@fluentui/react-icons';
import { api } from '../../../api';
import { useApiResource } from '../../../api/useApiResource';
import { DataStateView } from '../../../components/DataStateView';
import type { DataGovPhCatalogSearchResponse } from '../../../api/types';
import { getCatalogPeriod, getCatalogYears } from '../../../utils/catalogPeriod';
import { TablePagination } from './TablePagination';
import { TableText } from './TableText';

const isCatalogEmpty = (value: DataGovPhCatalogSearchResponse) => value.items.length === 0;
const tablePageSize = 25;

interface GovernmentDatasetsPreviewProps {
  title: string;
  query?: string;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export function GovernmentDatasetsPreview({ title, query = '', pageSize = 50, showSearch = false, showFilters = false }: GovernmentDatasetsPreviewProps) {
  const [draftQuery, setDraftQuery] = useState(query);
  const [searchQuery, setSearchQuery] = useState(query);
  const [datasetYear, setDatasetYear] = useState('');
  const [publisher, setPublisher] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const { state, retry } = useApiResource(
    `government-catalog-${searchQuery}`,
    () => api.searchAllDataGovPhCatalog(searchQuery, pageSize),
    isCatalogEmpty,
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = draftQuery.trim();
    setDatasetYear('');
    setPublisher('');
    setTablePage(1);
    if (nextQuery === searchQuery) retry();
    else setSearchQuery(nextQuery);
  }

  function browseAll() {
    setDraftQuery('');
    setDatasetYear('');
    setPublisher('');
    setTablePage(1);
    if (searchQuery === '') retry();
    else setSearchQuery('');
  }

  const availableYears = state.status === 'data' || state.status === 'empty'
    ? getCatalogYears(state.value.items.map((dataset) => dataset.name))
    : [];

  return (
    <section aria-labelledby="government-datasets-title">
      <div className="section-heading">
        <div>
          <h2 id="government-datasets-title" className="section-title">{title}</h2>
          <p className="section-hint">Published dataset metadata from data.gov.ph; these are not verified budget records.</p>
        </div>
      </div>
      {showSearch && (
        <form className={`search-panel catalog-search-panel${showFilters ? ' catalog-search-panel--filters' : ''}`} role="search" onSubmit={handleSearch}>
          <Field label="Search public datasets">
            <Input
              type="search"
              value={draftQuery}
              onChange={(_, data) => setDraftQuery(data.value)}
              placeholder="Try budget or education"
              contentBefore={<SearchRegular />}
            />
          </Field>
          {showFilters && (
            <>
              <Field label="Dataset year / period">
                <select
                  className="catalog-filter-select"
                  value={datasetYear}
                  aria-label="Dataset year / period"
                  onChange={(event) => { setDatasetYear(event.target.value); setTablePage(1); }}
                >
                  <option value="">All dataset years</option>
                  {availableYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </Field>
              <Field label="Publisher / agency">
                <select
                  className="catalog-filter-select"
                  value={publisher}
                  onChange={(event) => { setPublisher(event.target.value); setTablePage(1); }}
                  aria-label="Publisher or agency"
                >
                  <option value="">All publishers</option>
                  {Array.from(new Set(
                    state.status === 'data' || state.status === 'empty'
                      ? state.value.items.map((dataset) => dataset.publisher).filter((value): value is string => Boolean(value))
                      : [],
                  )).sort().map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </Field>
            </>
          )}
          <div className="search-actions">
            <Button type="submit" appearance="primary" icon={<SearchRegular />} disabled={state.status === 'loading'}>Search catalog</Button>
            <Button type="button" appearance="secondary" icon={<ArrowClockwiseRegular />} onClick={browseAll} disabled={state.status === 'loading'}>
              Browse all datasets
            </Button>
          </div>
        </form>
      )}
      <DataStateView
        state={state}
        onRetry={retry}
        emptyTitle="No government datasets matched"
        emptyBody="Try the Source Registry catalog search for another dataset, publisher, or topic."
      >
        {(results) => (
          (() => {
            const filteredDatasets = results.items.filter((dataset) =>
              (!datasetYear || getCatalogYears([dataset.name]).includes(datasetYear))
              && (!publisher || dataset.publisher === publisher));
            const pageStart = filteredDatasets.length === 0 ? 0 : (tablePage - 1) * tablePageSize + 1;
            const pageEnd = Math.min(tablePage * tablePageSize, filteredDatasets.length);
            const visibleDatasets = filteredDatasets.slice(pageStart - 1, pageEnd);

            return (
              <Card className="table-card catalog-results" appearance="outline">
                <div className="table-scroll">
                  <Table aria-label="Government datasets" size="small">
                    <TableHeader>
                      <TableRow>
                        <TableHeaderCell>Dataset</TableHeaderCell>
                        <TableHeaderCell>Dataset year / period</TableHeaderCell>
                        <TableHeaderCell>Publisher</TableHeaderCell>
                        <TableHeaderCell>Topics</TableHeaderCell>
                        <TableHeaderCell>Catalog last updated</TableHeaderCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDatasets.length ? visibleDatasets.map((dataset) => (
                        <TableRow key={dataset.id}>
                          <TableCell><TableText value={dataset.name} className="source-name" /></TableCell>
                          <TableCell><TableText value={getCatalogPeriod(dataset.name)} /></TableCell>
                          <TableCell><TableText value={dataset.publisher || 'Publisher not listed'} /></TableCell>
                          <TableCell><TableText value={dataset.topics.length ? dataset.topics.join(', ') : 'Not tagged'} /></TableCell>
                          <TableCell><TableText value={dataset.modifiedDate || 'Not listed'} /></TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell>No datasets match the selected filters.</TableCell>
                          <TableCell />
                          <TableCell />
                          <TableCell />
                          <TableCell />
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination page={tablePage} pageSize={tablePageSize} total={filteredDatasets.length} onPageChange={setTablePage} />
                <div className="table-caption">Showing {pageStart}-{pageEnd} of {filteredDatasets.length} matching datasets ({results.total} total) | Source: Open Data Philippines.</div>
              </Card>
            );
          })()
        )}
      </DataStateView>
    </section>
  );
}
