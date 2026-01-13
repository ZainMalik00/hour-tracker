import './_app.css';
import * as React from 'react';
import { NextAppProvider } from '@toolpad/core/nextjs';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import Head from 'next/head';
import { AppCacheProvider } from '@mui/material-nextjs/v14-pagesRouter';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import PaletteIcon from '@mui/icons-material/Palette';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { Navigation } from '@toolpad/core/AppProvider';
import { createTheme } from '@mui/material';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import LinearProgress from '@mui/material/LinearProgress';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement<any>) => React.ReactNode;
  requireAuth?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const NAVIGATION: Navigation = [
  {
    segment: 'insert',
    title: 'Insert',
    icon: <DashboardIcon />,
    children: [{
      segment: 'time-entries',
      title: 'Time Entries',
      icon: <ArticleIcon />,
    },
    {
      segment: 'categories',
      title: 'Categories',
      icon: <PaletteIcon />  
    }]
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

const THEME = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { 
    light: {
      palette: {
        primary: {
          main: '#52b788',
          light: "#b7e4c7",
          dark: "#1b4332",
          contrastText: "#fff",
        },
        background: {
          paper: "#F9FFFA"
        },
        error: {
          main: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
          contrastText: "#fff",
        }
      },
    },
    dark: {
      palette: {
        primary: {
          main: '#52b788',
          light: "#b7e4c7",
          dark: "#1b4332",
          contrastText: "#000",
        },
        background: {
          paper: "#00140eff"
        },
        error: {
          main: "#ef4444",
          light: "#fca5a5",
          dark: "#b91c1c",
          contrastText: "#fff",
        }
      },
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      sm: 900,
      md: 1500,
      lg: 2000,
      xl: 3500,
    },
  },
});

const BRANDING = {
  logo: <ViewTimelineIcon color="primary" fontSize="large" />,
  title: 'Hour Tracker',
  homeUrl: '/',
};

const AUTHENTICATION = {
  signIn,
  signOut,
};

function getDefaultLayout(page: React.ReactElement<any>) {
  return (
    <DashboardLayout defaultSidebarCollapsed>
      {page}
    </DashboardLayout>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') { return null; }
  return children;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  return (
    <React.Fragment>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Hour Tracker</title>
      </Head>
      <NextAppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
        session={session}
        authentication={AUTHENTICATION}
        theme={THEME}
      >
        {children}
      </NextAppProvider>
    </React.Fragment>
  );
}

export default function App(props: AppPropsWithLayout) {
  const {
    Component,
    pageProps: { session, ...pageProps },
  } = props;

  const getLayout = Component.getLayout ?? getDefaultLayout;
  const requireAuth = Component.requireAuth ?? true;

  let pageContent = getLayout(<Component {...pageProps} />);
  if (requireAuth) {
    pageContent = <RequireAuth>{pageContent}</RequireAuth>;
  }
  pageContent = <AppLayout>{pageContent}</AppLayout>;

  return (
    <AppCacheProvider {...props}>
      <SessionProvider session={session}>{pageContent}</SessionProvider>
    </AppCacheProvider>
  );
}