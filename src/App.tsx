import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import RootLayout from './pages/layout';
import DashboardPage from './pages/dashboard/dashboard';
import NotFound from './pages/not-found';

// Définition des routes principales de l'application
const routes = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
];

// Création du routeur
const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
