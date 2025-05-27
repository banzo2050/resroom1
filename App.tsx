import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import { SidebarProvider } from "@/components/ui/sidebar";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";

// Common Pages
import Dashboard from "./pages/Dashboard";

// Student Pages
import ApplicationForm from "./pages/ApplicationForm";
import ApplicationList from "./pages/ApplicationList";
import MaintenanceRequestForm from "./pages/MaintenanceRequestForm";
import MaintenanceRequestList from "./pages/MaintenanceRequestList";
import AnnouncementsList from "./pages/AnnouncementsList";

// Admin Pages
import AdminApplications from "./pages/admin/AdminApplications";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminMaintenance from "./pages/admin/AdminMaintenance";
import AnnouncementsManagement from "./pages/admin/AnnouncementsManagement";

// Protected route component
import ProtectedRoute from "./components/ProtectedRoute";

// 404 page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes - Any role */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Routes - Students */}
              <Route 
                path="/apply" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/applications" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maintenance" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MaintenanceRequestList />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/maintenance/new" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <MaintenanceRequestForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/announcements" 
                element={
                  <ProtectedRoute>
                    <AnnouncementsList />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/applications" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminApplications />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/rooms" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRooms />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/students" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminStudents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/maintenance" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMaintenance />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/announcements" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AnnouncementsManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route for 404s */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
