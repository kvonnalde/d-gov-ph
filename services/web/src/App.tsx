import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BudgetLensOverviewPage, GovernmentDatasetsPage, SourceRegistryPage } from './features/budget-lens';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { OverviewPage } from './pages/OverviewPage';
import { ChartMultipleRegular, DocumentRegular, SearchRegular, ShieldTaskRegular } from '@fluentui/react-icons';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell><OverviewPage /></AppShell>} />
        <Route path="/budget" element={<Navigate to="/budget-lens/datasets" replace />} />
        <Route path="/sources" element={<Navigate to="/budget-lens/sources" replace />} />
        <Route path="/budget-lens" element={<Navigate to="/budget-lens/overview" replace />} />
        <Route path="/budget-lens/overview" element={<AppShell><BudgetLensOverviewPage /></AppShell>} />
        <Route path="/budget-lens/datasets" element={<AppShell><GovernmentDatasetsPage /></AppShell>} />
        <Route path="/budget-lens/sources" element={<AppShell><SourceRegistryPage /></AppShell>} />
        <Route path="/ready-ph" element={<AppShell><ComingSoonPage title="Ready PH" icon={<ShieldTaskRegular />} /></AppShell>} />
        <Route path="/govassist" element={<AppShell><ComingSoonPage title="GovAssist" icon={<SearchRegular />} /></AppShell>} />
        <Route path="/local-pulse" element={<AppShell><ComingSoonPage title="Local Pulse" icon={<DocumentRegular />} /></AppShell>} />
        <Route path="/open-stats" element={<AppShell><ComingSoonPage title="Open Stats" icon={<ChartMultipleRegular />} /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}