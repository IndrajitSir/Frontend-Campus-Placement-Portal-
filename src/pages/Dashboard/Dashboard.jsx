import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex w-full">
      {/* <Sidebar /> */}
      <div className="p-6">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div >
  );
};

export default Dashboard;