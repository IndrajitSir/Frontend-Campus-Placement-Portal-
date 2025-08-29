import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Components
import Navbar from "../../Components/Navbar/Navbar.jsx";
// CONTEXT api
import { SocketProvider } from '../../context/SocketContext/SocketProvider.jsx'
import { ApiProvider } from "../../context/ApiContext/ApiProvider.jsx";
const Home = () => {
  return (
    <div className="p-4 relative block">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <SocketProvider>
        <ApiProvider>
          <Outlet />
        </ApiProvider>
      </SocketProvider>
    </div>
  );
};

export default Home;
