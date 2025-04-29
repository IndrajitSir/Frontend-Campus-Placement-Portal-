import { useNavigate } from "react-router-dom";
import styled from "styled-components";
// CONTEXT api
import { useUserData } from "../../context/AuthContext/AuthContext.jsx";
// Shadcn Components
import { Button } from "../ui/button.jsx";
const Navbar = () => {
  const navigate = useNavigate();
  const { accessToken, role } = useUserData();

  const handleLogin = () => {
    navigate("/login")
  }
  const handleHome = () => {
    navigate("/home")
  }
  // const handlePlacement = () => {
  //   navigate("/home/placements")
  // }
  const handleDashboard = () => {
    navigate("/home/dashboard")
  }
  const handleApplications = () => {
    navigate("/home/dashboard/applied-jobs");
  }
  const handleProfile = () => {
    navigate("/home/dashboard/profile");
  }
  return (
    <Container>
      <Logo>Placement Portal</Logo>
      <NavLinks>
        {
          accessToken ? (
            <>
              {
                role === "student" &&
                <>
                  <button onClick={handleHome} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Jobs</button>
                  <button onClick={handleApplications} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Applications</button>
                  <button onClick={handleProfile} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Profile</button>
                  {/* <Button variant="secondary" onClick={handleHome} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Jobs</Button> */}
                </>
              }
              {
                role !== "student" &&
                <>
                  {/* <button onClick={handlePlacement} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Jobs</button> */}
                  <button onClick={handleDashboard} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Dashboard</button>
                  {/* <Button variant="secondary" onClick={handleDashboard} className="rounded focus:outline-2 focus:outline-offset-2 cursor-pointer text-[#ff79c6] hover:underline">Dashboard</Button> */}
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