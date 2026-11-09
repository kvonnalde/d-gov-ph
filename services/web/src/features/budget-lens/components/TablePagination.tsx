import { Button } from '@fluentui/react-components';
import { ArrowRightRegular } from '@fluentui/react-icons';

interface TablePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, pageSize, total, onPageChange }: TablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  return (
    <nav className="table-pagination" aria-label="Table pagination">
      <Button size="small" appearance="subtle" icon={<ArrowRightRegular className="pagination-previous-icon" />} onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </Button>
      <span>Page {page} of {pageCount}</span>
      <Button size="small" appearance="subtle" icon={<ArrowRightRegular />} iconPosition="after" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
        Next
      </Button>
    </nav>
  );
}