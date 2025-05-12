import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home/HomePage';
import Dashboard from './pages/Dashboard';
import Forecasting from './pages/Forecasting';
import Network from './pages/Network';
import Risk from './pages/Risk';
import AuthPage from './pages/AuthPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/forecasting" element={
          <Layout>
            <Forecasting />
          </Layout>
        } />
        <Route path="/network" element={
          <Layout>
            <Network />
          </Layout>
        } />
        <Route path="/risk" element={
          <Layout>
            <Risk />
          </Layout>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;