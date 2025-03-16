import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from 'react-router';
import HourEntryForm from './components/hour-entry-form/hour-entry-form.js';

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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
