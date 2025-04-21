import { motion } from "framer-motion";
import styled from "styled-components";

const FloatingBlob = ({moveAnimation}) => {
  return <Blob animate={moveAnimation} />;
};

export default FloatingBlob;

// Styled component for the blob
const Blob = styled(motion.div)`
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, rgba(255, 0, 150, 0.8), rgba(0, 150, 255, 0.8), rgba(43, 197, 64, 0.8));
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -70%);
  filter: blur(20px);
  z-index: 1;
`;