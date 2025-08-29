import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styled from "styled-components";
// Components
import FloatingBlob from "./AnimatedComponents/FloatingBlob.jsx";
import Navbar from "./Components/Navbar/Navbar.jsx";
import AboutSection from "./Components/AboutSection/AboutSection.jsx";
import PlacementStats from "./Components/PlacementStats/PlacementStats.jsx";
import Testimonials from "./Components/Testimonials/Testimonials.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import CompaniesSection from "./Components/Companies/CompaniesSection.jsx";
// Define animation
import { animation } from "./constants/constants.js";

function App() {
  return (
    <>
      <Container>
        <FloatingBlob moveAnimation={animation} />
        <Navbar />
        <Main>
          <Moto>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ color: "black", opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              Connect . Apply
            </motion.h1>
          </Moto>
          <GradientText>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2 }}
            >
              Get HIRED
            </motion.h1>
          </GradientText>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ color: "black", opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4 }}
          >
            A one-stop platform for students and companies to connect.
          </motion.p>
          <ExploreButton to="/home/dashboard">Explore</ExploreButton>
        </Main>
        <OtherSections>
          <div className="bg-white text-black p-6 font-sans">
            {/* Placement Statistics Section */}
            <PlacementStats />
            {/* Companies Section */}
            <CompaniesSection />
            {/* About Placement Portal Section */}
            <AboutSection />
            {/* Success Stories Section */}
            <Testimonials />
            {/* Footer Section */}
            <Footer />
          </div>
        </OtherSections>
      </Container>
    </>
  );
}

export default App;

const Container = styled.div`
  min-height: 100vh;
  background: white;
  color: white;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;
const Main = styled.div`
  min-height: 80vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const OtherSections = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const ExploreButton = styled(Link)`
  padding: 12px 24px;
  background: linear-gradient(45deg, #ff79c6, #bd93f9);
  border-radius: 10px;
  color: white;
  text-decoration: none;
  font-weight: bold;
  margin-top: 20px;
`;
const Moto = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  h1 {
  font-Size: 5rem;
  font-style: bold;
  position: relative;
  bottom: -20px;
  }
`;
const GradientText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  h1 {
  font-size: 4rem;
  font-weight: bold;
  background: linear-gradient(45deg, #ff79c6, #bd93f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  }
`;
