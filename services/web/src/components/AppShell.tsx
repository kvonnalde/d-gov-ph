import {
  FluentProvider,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import {
  ChartMultipleRegular,
  DocumentRegular,
  HomeRegular,
  SearchRegular,
  ShieldTaskRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useThemeMode } from './useThemeMode';
import { darkTheme, lightTheme } from '../theme';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const { mode, resolvedTheme, cycleMode } = useThemeMode();
  const activeTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <FluentProvider theme={activeTheme} className={`app-provider theme-${resolvedTheme}`}>
      <div className={`app-shell theme-${resolvedTheme}`}>
        <header className="app-header">
          <Toolbar className="header-toolbar" aria-label="D-Gov PH header">
            <Link className="brand-lockup" to="/" aria-label="D-Gov PH overview">
              <span className="brand-mark" aria-hidden="true">DG</span>
              <span className="brand-name">D-Gov PH</span>
            </Link>
            <div className="header-actions">
              <span className="public-label">PUBLIC RECORDS</span>
              <Tooltip content={`Theme: ${mode}. Change theme`} relationship="label">
                <ToolbarButton
                  aria-label={`Theme is ${mode}. Change theme`}
                  icon={resolvedTheme === 'dark' ? <WeatherSunnyRegular /> : <WeatherMoonRegular />}
                  onClick={cycleMode}
                />
              </Tooltip>
            </div>
          </Toolbar>
        </header>
        <div className="app-workspace">
          <aside className="app-sidebar">
            <nav className="sidebar-nav" aria-label="Workspace navigation">
              <span className="sidebar-group-label">Workspace</span>
              <NavLink to="/" end className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
                <HomeRegular /><span>Overview</span>
              </NavLink>
              <span className="sidebar-group-label sidebar-features-label">Features</span>
              <div className="sidebar-feature-group">
                <div className="sidebar-feature-heading"><ChartMultipleRegular /><span>Budget Lens</span></div>
                <div className="sidebar-subnav">
                  <NavLink end to="/budget-lens/overview" className={({ isActive }) => `sidebar-sublink${isActive ? ' sidebar-sublink-active' : ''}`}>Overview</NavLink>
                  <NavLink to="/budget-lens/datasets" className={({ isActive }) => `sidebar-sublink${isActive ? ' sidebar-sublink-active' : ''}`}>Government Datasets</NavLink>
                  <NavLink to="/budget-lens/sources" className={({ isActive }) => `sidebar-sublink${isActive ? ' sidebar-sublink-active' : ''}`}>Source Registry</NavLink>
                </div>
              </div>
              <NavLink to="/ready-ph" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
                <ShieldTaskRegular /><span>Ready PH</span>
              </NavLink>
              <NavLink to="/govassist" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
                <SearchRegular /><span>GovAssist</span>
              </NavLink>
              <NavLink to="/local-pulse" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
                <DocumentRegular /><span>Local Pulse</span>
              </NavLink>
              <NavLink to="/open-stats" className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}>
                <ChartMultipleRegular /><span>Open Stats</span>
              </NavLink>
            </nav>
          </aside>
          <AnimatePresence mode="wait" initial={false}>
            <motion.main
              key={location.pathname}
              className="page-motion"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
        <footer className="app-footer">
          <span>D-Gov PH</span>
          <span>Public records are shown with their stated verification status.</span>
        </footer>
      </div>
    </FluentProvider>
  );
}
