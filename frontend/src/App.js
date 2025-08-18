import React from 'react';
import './App.css'; 
import { useAuth, AuthProvider } from './contexts/authContext';
import { TaskProvider } from './contexts/taskContext';
import AuthContainer from './components/auth/authContainer';
import Dashboard from './components/dashboard/dashboard';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated ? <Dashboard /> : <AuthContainer />}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </AuthProvider>
  );
};

export default App;