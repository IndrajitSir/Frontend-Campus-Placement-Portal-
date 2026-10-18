import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom'
// -- CORE PAGES imported eagerly (needed for the first paint / app shell)
import App from './App.jsx'
import Auth from './pages/Auth/Auth.jsx'
import ProtectedRoute from './functionality/ProtectedRoutes.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import CircleLoader from './Components/Loader/CircleLoader.jsx'
// -- ROUTE PAGES code-split on demand
const DashBoardContent = lazy(() => import('./pages/Dashboard/DashBoardContent.jsx'))
const InfinitePlacements = lazy(() => import('./pages/Placements/InfinitePlacements.jsx'))
const ProfilePage = lazy(() => import('./pages/Profile/Profile.jsx'))
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage.jsx'))
const Students = lazy(() => import('./pages/Users/Students/Students.jsx'))
const ShortlistedApplications = lazy(() => import('./pages/Applications/ShortlistedApplications/ShortlistedApplications.jsx'))
const AppliedApplications = lazy(() => import('./pages/Applications/AppliedApplications/AppliedApplications.jsx'))
const RejectedApplications = lazy(() => import('./pages/Applications/RejectedApplications/RejectedApplications.jsx'))
const SelectedApplications = lazy(() => import('./pages/Applications/SelectedApplications/SelectedApplications.jsx'))
const ManageApplications = lazy(() => import('./pages/Manage_Applications/ManageApplications.jsx'))
const ManageUsers = lazy(() => import('./pages/ManageUsers/ManageUsers.jsx'))
const AppliedForJobs = lazy(() => import('./Components/AppliedForJobs/AppliedForJobs.jsx'))
const MonitorSystem = lazy(() => import('./Components/Dashboards/Admin_dashboard/Monitor_System/MonitorSystem.jsx'))
const InterviewSetup = lazy(() => import('./pages/Interview_Setup/InterviewSetup.jsx'))
const NewMessagePage = lazy(() => import('./pages/Message/MessagePage.jsx'))
const SearchPage = lazy(() => import('./pages/Search/SearchPage.jsx'))
// CONTEXT PROVIDER imported
import { AuthCrediantialsProvider } from './context/AuthContext/AuthProvider.jsx'
import { PlacementDataProvider } from './context/PlacementContext/PlacementProvider.jsx'

/** Wrap a lazy route in a shared, accessible suspense fallback. */
const page = (Component) => (
  <Suspense fallback={<CircleLoader fullScreen={false} label="Loading page…" />}>
    <Component />
  </Suspense>
)

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<App />} />
      <Route>
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute />} >
          <Route path="" element={<Navigate to="/home/dashboard/placements" replace />} />
          <Route path="placements" element={<Navigate to="/home/dashboard/placements" replace />} />
          <Route path="profile" element={page(ProfilePage)} />
          <Route path="settings" element={page(SettingsPage)} />
          <Route path="message" element={page(NewMessagePage)} />
          <Route path="search" element={page(SearchPage)} />
          <Route path="dashboard" element={<Dashboard />} >
            <Route path="" element={page(DashBoardContent)} />
            <Route path="placements" element={<PlacementDataProvider>{page(InfinitePlacements)}</PlacementDataProvider>} />
            <Route path="students" element={page(Students)} />
            <Route path="applied-jobs" element={page(AppliedForJobs)} />
            <Route path="manage-users" element={page(ManageUsers)} />
            <Route path="monitor-system" element={page(MonitorSystem)} />
            <Route path="interview-setup" element={page(InterviewSetup)} />
            <Route path="manage-applications">
              <Route path="" element={page(ManageApplications)} />
              <Route path="selected-candidates" element={page(SelectedApplications)} />
              <Route path="applied-candidates" element={page(AppliedApplications)} />
              <Route path="shortlisted-candidates" element={page(ShortlistedApplications)} />
              <Route path="rejected-candidates" element={page(RejectedApplications)} />
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
