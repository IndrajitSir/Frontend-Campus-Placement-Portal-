import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../../functionality/ProtectedRoutes';

const Dashboard = () => {
  return (
    <div className="flex w-full">
      {/* <Sidebar /> */}
      <div className="p-6">
        <div className="w-full">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;