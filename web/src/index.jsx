import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from "react-router-dom";
import { ThirdwebProvider } from "@thirdweb-dev/react";

import './index.css';
import App from './app/App';
import HomePage from './app/pages/HomePage';
import DashboardPage from './app/pages/Dashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path:"/",
        element: <HomePage />
      },
      {
        path:"/dashboard",
        element: <DashboardPage />
      }
    ]
  },
  
]);

root.render(
  <React.StrictMode>
    <ThirdwebProvider activeChain="arbitrum-sepolia" clientId="10b979e90e7b1522923fc2edcec0b719">
      <RouterProvider router={router} />
    </ThirdwebProvider>
  </React.StrictMode>
);