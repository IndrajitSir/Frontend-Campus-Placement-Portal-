import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Components
import Navbar from "../../components/Navbar/Navbar.jsx";
// CONTEXT api
import { SocketProvider } from '../../context/SocketContext/SocketProvider.jsx'
const Home = () => {
  return (
    <div className="p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <SocketProvider>
        <Outlet />
      </SocketProvider>
    </div>
  );
};

export default Home;