import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ResidentList from './pages/admin/ResidentList';
import ResidentProfile from './pages/admin/ResidentProfile';
import MedicationManagement from './pages/admin/MedicationManagement';
import CaretakerManagement from './pages/admin/CaretakerManagement';
import FamilyManagement from './pages/admin/FamilyManagement';

// Caretaker pages
import CaretakerDashboard from './pages/caretaker/CaretakerDashboard';
import CaretakerTasks from './pages/caretaker/CaretakerTasks';

// Family pages
import FamilyDashboard from './pages/family/FamilyDashboard';

// Shared pages
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'CARETAKER') return <Navigate to="/caretaker/dashboard" replace />;
    if (user.role === 'FAMILY') return <Navigate to="/family/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="residents" element={<ResidentList />} />
          <Route path="caretakers" element={<CaretakerManagement />} />
          <Route path="family" element={<FamilyManagement />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Caretaker Routes */}
        <Route path="/caretaker" element={<ProtectedRoute allowedRoles={['CARETAKER']}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<CaretakerDashboard />} />
          <Route path="tasks" element={<CaretakerTasks />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Family Routes */}
        <Route path="/family" element={<ProtectedRoute allowedRoles={['FAMILY']}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<FamilyDashboard />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Shared Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CARETAKER', 'FAMILY']}><MainLayout /></ProtectedRoute>}>
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Admin + Caretaker Shared Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CARETAKER']}><MainLayout /></ProtectedRoute>}>
          <Route path="residents/:id" element={<ResidentProfile />} />
          <Route path="medications" element={<MedicationManagement />} />
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
