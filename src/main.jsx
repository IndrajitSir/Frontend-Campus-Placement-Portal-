import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
// -- PAGES imported
import App from './App.jsx'
import Auth from './pages/Auth/Auth.jsx'
import Placements from './pages/Placements/Placements.jsx'
import InfinitePlacements from './pages/Placements/InfinitePlacements.jsx'
import ProtectedRoute from './functionality/ProtectedRoutes.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import DashBoardContent from './pages/Dashboard/DashBoardContent'
import ProfilePage from './pages/Profile/Profile.jsx'
import Students from './pages/Users/Students/Students'
import ShortlistedApplications from './pages/Applications/ShortlistedApplications/ShortlistedApplications'
import AppliedApplications from './pages/Applications/AppliedApplications/AppliedApplications';
import RejectedApplications from './pages/Applications/RejectedApplications/RejectedApplications'
import SelectedApplications from './pages/Applications/SelectedApplications/SelectedApplications'
import ManageApplications from './pages/Manage_Applications/ManageApplications'
import ManageUsers from './pages/ManageUsers/ManageUsers'
import AppliedForJobs from './components/AppliedForJobs/AppliedForJobs'
import MonitorSystem from './components/Dashboards/Admin_dashboard/Monitor_System/MonitorSystem'
// CONTEXT PROVIDER imported
import { AuthCrediantialsProvider } from './context/AuthContext/AuthProvider.jsx'
import { PlacementDataProvider } from './context/PlacementContext/PlacementProvider.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<App />} />
      <Route>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute />} >
          <Route path="" element={<PlacementDataProvider><InfinitePlacements /></PlacementDataProvider>} />
          <Route path="placements" element={<PlacementDataProvider><InfinitePlacements /></PlacementDataProvider>} />
          <Route path="dashboard" element={<Dashboard />} >
            <Route path="" element={<DashBoardContent />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="students" element={<Students />} />
            <Route path="applied-jobs" element={<AppliedForJobs />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="monitor-system" element={<MonitorSystem />} />
            <Route path="manage-applications">
              <Route path="" element={<ManageApplications />} />
              <Route path="selected-candidates" element={<SelectedApplications />} />
              <Route path="applied-candidates" element={<AppliedApplications />} />
              <Route path="shortlisted-candidates" element={<ShortlistedApplications />} />
              <Route path="rejected-candidates" element={<RejectedApplications />} />
            </Route>
          </Route>
        </Route>
      </Route >
    </Route >
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthCrediantialsProvider>
      <RouterProvider router={router} />
    </AuthCrediantialsProvider>
  </StrictMode>,
)
