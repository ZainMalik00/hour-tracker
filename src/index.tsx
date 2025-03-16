import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import reportWebVitals from './reportWebVitals.ts';
import { createBrowserRouter, RouterProvider } from 'react-router';
import HourEntryForm from './components/hour-entry-form/hour-entry-form.tsx';

  const router = createBrowserRouter([
    {
      Component: App,
      children: [
        {
          path: '/',
          Component: HourEntryForm,
        },
        {
          path: '/insert',
          Component: HourEntryForm,
        },
        {
          path: '/charts',
          Component: HourEntryForm,
        },
        {
          path: '/analytics',
          Component: HourEntryForm,
        },
      ],
    },
  ]);

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
