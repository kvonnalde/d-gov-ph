import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Divider,
} from '@fluentui/react-components';
import { DismissRegular } from '@fluentui/react-icons';
import { api } from '../api';
import type { DataGovPhCatalogDataset } from '../api/types';

interface CatalogDatasetDialogProps {
  dataset: DataGovPhCatalogDataset | null;
  onClose: () => void;
}

function formatFileSize(size: number | null) {
  if (size === null) return null;
  if (size < 1024) return `${size} B`;

  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function CatalogDatasetDialog({ dataset, onClose }: CatalogDatasetDialogProps) {
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setDownloadingFileId(null);
    setDownloadError(null);
  }, [dataset?.id]);

  async function downloadFile(fileId: string, fileName: string) {
    setDownloadingFileId(fileId);
    setDownloadError(null);
    try {
      await api.downloadDataGovPhResourceFile(fileId, fileName);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'This file could not be downloaded.');
    } finally {
      setDownloadingFileId(null);
    }
  }

  return (
    <Dialog open={dataset !== null} onOpenChange={(_, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={(
              <DialogTrigger action="close">
                <Button appearance="subtle" aria-label="Close dataset details" icon={<DismissRegular />} />
              </DialogTrigger>
            )}
          >
            {dataset?.name ?? 'Dataset resources'}
          </DialogTitle>
          {dataset && (
            <DialogContent className="catalog-dialog-content">
              <p className="detail-note">{dataset.publisher || 'Publisher not listed'} · {dataset.license || 'License not listed'}</p>
              <p className="detail-note">Catalog metadata from data.gov.ph. Resource files are provided by the publishing agency.</p>
              {dataset.url && (
                <a className="catalog-source-link" href={`https://data.gov.ph/${dataset.url}`} target="_blank" rel="noreferrer">
                  Open dataset on data.gov.ph
                </a>
              )}
              {downloadError && <p className="inline-error" role="alert">{downloadError}</p>}
              <Divider />
              {dataset.resources.length === 0 ? (
                <p>No resources are listed for this dataset.</p>
              ) : dataset.resources.map((resource) => (
                <section className="catalog-resource" key={resource.id}>
                  <div className="catalog-resource-heading">
                    <h3>{resource.name}</h3>
                    <span>{resource.format || 'Format not specified'}</span>
                  </div>
                  {resource.files.length === 0 ? (
                    <p className="detail-note">No downloadable files are listed for this resource.</p>
                  ) : (
                    <ul className="catalog-file-list">
                      {resource.files.map((file) => (
                        <li key={file.id ?? file.name}>
                          <div className="catalog-file-info">
                            <span className="catalog-file-name">{file.name}</span>
                            {formatFileSize(file.size) && <span className="detail-note">{formatFileSize(file.size)}</span>}
                          </div>
                          {file.id ? (
                            <Button
                              appearance="secondary"
                              className="catalog-download-button"
                              disabled={downloadingFileId === file.id}
                              onClick={() => void downloadFile(file.id!, file.name)}
                            >
                              {downloadingFileId === file.id ? 'Downloading…' : 'Download'}
                            </Button>
                          ) : <span className="detail-note">Download unavailable</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </DialogContent>
          )}
          <DialogActions>
            <DialogTrigger action="close"><Button appearance="secondary">Close dataset details</Button></DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}