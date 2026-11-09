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
import type { BudgetRecordDetail } from '../../../api/types';

interface BudgetRecordDialogProps {
  record: BudgetRecordDetail | null;
  onClose: () => void;
}

export function BudgetRecordDialog({ record, onClose }: BudgetRecordDialogProps) {
  return (
    <Dialog open={record !== null} onOpenChange={(_, data) => { if (!data.open) onClose(); }}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={(
              <DialogTrigger action="close">
                <Button appearance="subtle" aria-label="Close record details" icon={<DismissRegular />} />
              </DialogTrigger>
            )}
          >
            {record?.title ?? 'Budget record details'}
          </DialogTitle>
          {record && (
            <DialogContent className="detail-content">
              <p className="detail-label">Publisher</p><p>{record.publisher}</p>
              <Divider />
              <p className="detail-label">Fiscal period</p><p>{record.fiscalPeriod}</p>
              <Divider />
              <p className="detail-label">Source provenance</p><p>{record.source}</p>
              <span className="status-badge status-verified">{record.displayState}</span>
              <p className="detail-note">Source record type: {record.sourceRecordType}</p>
              <p className="detail-note">Verified: {record.verifiedAt ? new Date(record.verifiedAt).toLocaleString() : 'Date not recorded'}</p>
            </DialogContent>
          )}
          <DialogActions>
            <DialogTrigger action="close"><Button appearance="secondary">Close record details</Button></DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}