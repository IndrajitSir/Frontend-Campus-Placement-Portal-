import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex w-full">
      {/* <Sidebar /> */}
      <div className="p-6">
        <div className="w-full">
          <ErrorBoundary fallback={<p>Something went wrong at outlet!</p>}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div >
  );
};

export default Dashboard;