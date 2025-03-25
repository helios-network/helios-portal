import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/dashboard/page';
import { Header } from './components/header';
import { Wrapper } from './components/wrapper';

function App() {
  return (
    <BrowserRouter>
      <Wrapper>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Wrapper>
    </BrowserRouter>
  );
}

export default App;
