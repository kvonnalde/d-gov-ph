import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { BudgetPage } from './pages/BudgetPage';
import { OverviewPage } from './pages/OverviewPage';
import { SourcesPage } from './pages/SourcesPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell><OverviewPage /></AppShell>} />
        <Route path="/budget" element={<AppShell><BudgetPage /></AppShell>} />
        <Route path="/sources" element={<AppShell><SourcesPage /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}