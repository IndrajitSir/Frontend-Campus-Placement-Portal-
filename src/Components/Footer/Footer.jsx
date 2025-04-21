import React from "react";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import "./footer.css"
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h3 className="web-name">Placement Portal</h3>
          <p>Your gateway to career success.</p>
        </div>
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li>Home</li>
            <li>Companies</li>
            <li>Jobs</li>
            <li>Contact</li>
          </ul>
        </div>
        <div className="footer-col">
          <h3>Connect with Us</h3>
          <div className="flex items-center justify-center m-3 cursor-pointer gap-5 text-xl">
            <i className="hover:bg-gray-500 rounded-xl"><FaLinkedin/></i>
            <i className="hover:bg-gray-500 rounded-xl"><FaGithub/></i>
            <i className="hover:bg-gray-500 rounded-xl"><FaInstagram/></i>
          </div>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>Email: support@placementportal.com</p>
          <p>Phone: +91 98765 43210</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
