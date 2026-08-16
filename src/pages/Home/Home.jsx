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
    <div className="relative min-h-screen bg-slate-50/70">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6">
        <SocketProvider>
          <ApiProvider>
            <Outlet />
          </ApiProvider>
        </SocketProvider>
      </main>
    </div>
  );
};

export default Home;
