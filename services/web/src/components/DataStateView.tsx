import {
  Body1,
  Button,
  Card,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Skeleton,
  SkeletonItem,
  Title3,
} from '@fluentui/react-components';
import { ArrowClockwiseRegular, BoxSearchRegular, WarningRegular } from '@fluentui/react-icons';
import type { ReactNode } from 'react';
import type { ResourceState } from '../api/useApiResource';

interface DataStateViewProps<T> {
  state: ResourceState<T>;
  onRetry: () => void;
  emptyTitle: string;
  emptyBody: string;
  emptyAction?: ReactNode;
  children: (value: T) => ReactNode;
}

export function DataStateView<T>({ state, onRetry, emptyTitle, emptyBody, emptyAction, children }: DataStateViewProps<T>) {
  if (state.status === 'loading') {
    return (
      <Card className="state-card loading-card" aria-label="Loading public records">
        <Skeleton aria-hidden="true">
          <SkeletonItem size={16} className="skeleton-heading" />
          <SkeletonItem size={12} className="skeleton-row" />
          <SkeletonItem size={12} className="skeleton-row" />
          <SkeletonItem size={12} className="skeleton-row" />
        </Skeleton>
      </Card>
    );
  }

  if (state.status === 'error') {
    return (
      <MessageBar intent="error" className="state-error">
        <WarningRegular className="state-error-icon" />
        <MessageBarBody>
          <MessageBarTitle>Records could not be loaded</MessageBarTitle>
          {state.message}
        </MessageBarBody>
        <Button appearance="primary" icon={<ArrowClockwiseRegular />} onClick={onRetry}>Retry loading records</Button>
      </MessageBar>
    );
  }

  if (state.status === 'empty') {
    return (
      <Card className="state-card empty-card" appearance="outline">
        <span className="empty-illustration" aria-hidden="true"><BoxSearchRegular /></span>
        <Title3>{emptyTitle}</Title3>
        <Body1 className="empty-copy">{emptyBody}</Body1>
        {emptyAction}
      </Card>
    );
  }

  return <>{children(state.value)}</>;
}