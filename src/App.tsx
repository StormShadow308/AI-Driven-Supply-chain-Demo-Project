import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import IndexPage from '@/pages/Index';
import Upload from '@/pages/Upload';
import Department from '@/pages/Department';
import Departments from '@/pages/Departments';
import SalesAnalytics from '@/pages/SalesAnalytics';
import SalesInsight from '@/pages/SalesInsight';
import Performance from '@/pages/Performance';
import Logistics from '@/pages/Logistics';
import Distribution from '@/pages/Distribution';
import Analytics from '@/pages/Analytics';
import Category from '@/pages/Category';
import Compare from '@/pages/Compare';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import FileAnalysis from '@/pages/FileAnalysis';
import ReviewsAnalysisPage from '@/pages/ReviewsAnalysisPage';
import JointDashboard from '@/components/dashboard/JointDashboard';
import TestView from '@/pages/TestView';
import { createContext, useContext, useState } from 'react';

// Define interface for department analysis state
export interface DepartmentAnalysisState {
  fileId: string;
  timestamp: number;
}

// Create a context for the application state
export interface AppStateContextType {
  pageState: Record<string, any>;
  departmentStates: Record<string, DepartmentAnalysisState>;
  updatePageState: (key: string, data: any) => void;
  updateDepartmentState: (department: string, fileId: string) => void;
  getActiveDepartmentState: (department: string) => DepartmentAnalysisState | undefined;
}

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Custom hook to use the app state
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

function App() {
  // State to store page data that needs to be preserved across navigation
  const [pageState, setPageState] = useState<Record<string, any>>({});
  // State to store analysis data for each department
  const [departmentStates, setDepartmentStates] = useState<Record<string, DepartmentAnalysisState>>({});

  // Function to update page state
  const updatePageState = (key: string, data: any) => {
    setPageState(prev => ({
      ...prev,
      [key]: data
    }));
  };

  // Function to update department state
  const updateDepartmentState = (department: string, fileId: string) => {
    setDepartmentStates(prev => ({
      ...prev,
      [department]: {
        fileId,
        timestamp: Date.now()
      }
    }));
  };

  // Function to get active department state
  const getActiveDepartmentState = (department: string) => {
    return departmentStates[department];
  };

  return (
    <AppStateContext.Provider value={{ 
      pageState, 
      departmentStates, 
      updatePageState, 
      updateDepartmentState,
      getActiveDepartmentState 
    }}>
      <div className="min-h-screen bg-background">
        <Layout>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/department/:id" element={<Department />} />
            <Route path="/analytics/sales" element={<SalesAnalytics />} />
            <Route path="/analytics/reviews" element={<ReviewsAnalysisPage />} />
            <Route path="/joint-dashboard" element={<JointDashboard />} />
            <Route path="/analytics/sales-insight" element={<SalesInsight />} />
            <Route path="/analytics/performance" element={<Performance />} />
            <Route path="/logistics" element={<Logistics />} />
            <Route path="/analytics/distribution" element={<Distribution />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analysis/:department/:fileId" element={<FileAnalysis />} />
            <Route path="/test-view" element={<TestView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
        <Toaster />
      </div>
    </AppStateContext.Provider>
  );
}

export default App;
