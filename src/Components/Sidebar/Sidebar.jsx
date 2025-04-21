import styled from "styled-components";
import { Link, NavLink } from "react-router-dom";
import "./sidebar.css"
// Icons
import { FaHome, FaUsers, FaUserGraduate, FaUser } from "react-icons/fa";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Components
import FloatingBlob from "../../AnimatedComponents/FloatingBlob.jsx";

const animation = {
  x: ["-2vw", "1vw", "-3vw"], // Moves left and right
  y: ["-9vh", "-12vh", "-33vh"],  // Moves up and down
  transition: {
    duration: 58,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
  },
};
const Sidebar = () => {
  const { role } = useUserData();
  return (
    <Container>
      <FloatingBlob moveAnimation={animation}/>
      <div className="w-62 m-h-50 flex flex-column p-6 rounded border-1 border-black fixed left-[15px] bg-transparent bg-opacity-60 backdrop-blur-xl rounded-xl shadow-sm">
        <Nav>
          {
            role !== "student" &&
            <>

              <NavLink to="/home/dashboard/students" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUsers /> Students</NavLink>
              <NavLink to="/home/dashboard/manage-applications/applied-candidates" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUserGraduate /> Applied</NavLink>
              <NavLink to="/home/dashboard/manage-applications/shortlisted-candidates" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUserGraduate /> Shortlisted</NavLink>
              <NavLink to="/home/dashboard/manage-applications/selected-candidates" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUserGraduate /> Selected</NavLink>
              <NavLink to="/home/dashboard/manage-applications/rejected-candidates" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUserGraduate /> Rejected</NavLink>
              <NavLink to="/home/placements" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUserGraduate /> Jobs</NavLink>
            </>
          }
          {
            role === "student" &&
            <NavLink to="/home/dashboard/profile" className={({ isActive }) => (isActive ? "active-link" : "non-active-link")}><FaUser /> profile</NavLink>
          }
        </Nav>
      </div>
    </Container>
  );
};

export default Sidebar;

const Container = styled.div`
  width: 247px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 12px;
  position: relative;
`;

const Nav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  a {
    color: #ff79c6;
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-size: 18px;
  }
`;
