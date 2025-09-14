import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
const Navbar = () => {
  const navigate = useNavigate();
  const { accessToken, role } = useUserData();
  const handleLogin = () => {
    navigate("/login")
  }
  const handleHome = () => {
    navigate("/home")
  }
  const handleDashboard = () => {
    navigate("/home/dashboard")
  }
  const handleApplications = () => {
    navigate("/home/dashboard/applied-jobs");
  }
  const handleProfile = () => {
    navigate("/home/profile");
  }
  const handleChat = () => {
    navigate("/home/message");
  }
  return (
    <Container>
      <Logo>Placement Portal</Logo>
      <NavLinks>
        {
          accessToken ? (
            <>
              <button onClick={handleChat} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Chat</button>
              {
                role === "student" &&
                <>
                  <button onClick={handleHome} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Jobs</button>
                  <button onClick={handleApplications} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Applications</button>
                  <button onClick={handleProfile} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Profile</button>
                </>
              }
              {
                role !== "student" &&
                <>
                  <button onClick={handleDashboard} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Dashboard</button>
                </>
              }
            </>
          ) : (
            <button onClick={handleLogin} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Login</button>
          )
        }
      </NavLinks>
    </Container>
  );
};

export default Navbar;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background:rgb(64, 59, 61);
  border-radius: 10px;
`;

const Logo = styled.h2`
  color: #ff79c6;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  
  a {
    color: #ff79c6;
    text-decoration: none;
    font-weight: bold;
  }
`;