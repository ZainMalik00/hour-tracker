import Navbar from './components/navbar/Navbar.js';
import './App.css';
import { Outlet } from 'react-router';
import { createTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';

function App() {
  const NAVIGATION = [
    {
      segment: 'insert',
      title: 'Insert',
      icon: <DashboardIcon />,
    },
    {
      segment: 'charts',
      title: 'Charts',
      icon: <BarChartIcon />,
    },
    {
      segment: 'analytics',
      title: 'Analytics',
      icon: <QueryStatsIcon />,
    },
  ];

  const theme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { 
      light: {
        palette: {
          primary: {
            main: '#52b788',
            light: "#b7e4c7",
            lighter: "#d8f3dc",
            dark: "#1b4332",
            darker: "#081c15"
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: '#52b788',
            light: "#b7e4c7",
            lighter: "#d8f3dc",
            dark: "#1b4332",
            darker: "#081c15"
          },
        },
      },
    },

    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 600,
        lg: 1200,
        xl: 1536,
      },
    },
  });
  
  return (
    <ReactRouterAppProvider
      navigation={NAVIGATION}
      branding={{
        logo: <ViewTimelineIcon color="primary" fontSize="large" />,
        title: 'Hour Tracker',
        homeUrl: '/',
      }}
      theme={theme}
    >
      <DashboardLayout defaultSidebarCollapsed>
        <Outlet></Outlet>
      </DashboardLayout>
    </ReactRouterAppProvider>
  );
}

export default App;
