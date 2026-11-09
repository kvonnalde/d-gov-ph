import {
  Button,
  FluentProvider,
  Tab,
  TabList,
  Toolbar,
  ToolbarButton,
  Tooltip,
} from '@fluentui/react-components';
import {
  ChartMultipleRegular,
  DocumentRegular,
  HomeRegular,
  WeatherMoonRegular,
  WeatherSunnyRegular,
} from '@fluentui/react-icons';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeMode } from './useThemeMode';
import { darkTheme, lightTheme } from '../theme';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { mode, resolvedTheme, cycleMode } = useThemeMode();
  const activeTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;

  return (
    <FluentProvider theme={activeTheme} className={`app-provider theme-${resolvedTheme}`}>
      <div className={`app-shell theme-${resolvedTheme}`}>
        <header className="app-header">
          <Toolbar className="header-toolbar" aria-label="D-Gov PH header">
            <a className="brand-lockup" href="/" aria-label="D-Gov PH overview">
              <span className="brand-mark" aria-hidden="true">DG</span>
              <span className="brand-name">D-Gov PH</span>
            </a>
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
          <nav className="primary-nav" aria-label="Main navigation">
            <TabList
              selectedValue={location.pathname}
              onTabSelect={(_, data) => navigate(String(data.value))}
              size="small"
            >
              <Tab value="/" icon={<HomeRegular />}>Overview</Tab>
              <Tab value="/budget" icon={<ChartMultipleRegular />}>Budget Explorer</Tab>
              <Tab value="/sources" icon={<DocumentRegular />}>Source Registry</Tab>
            </TabList>
          </nav>
        </header>
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
        <footer className="app-footer">
          <span>D-Gov PH</span>
          <span>Public records are shown with their stated verification status.</span>
        </footer>
      </div>
    </FluentProvider>
  );
}

export function InlineAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <Button appearance="subtle" onClick={onClick}>{children}</Button>;
}