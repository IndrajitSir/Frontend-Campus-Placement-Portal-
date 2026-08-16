import React from "react";
import { FaLinkedin, FaGithub, FaInstagram } from "react-icons/fa";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h3 className="web-name">CampusPlace</h3>
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
          <div className="footer-social flex items-center gap-4 text-xl">
            <i className="cursor-pointer"><FaLinkedin /></i>
            <i className="cursor-pointer"><FaGithub /></i>
            <i className="cursor-pointer"><FaInstagram /></i>
          </div>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>Email: support@campusplace.dev</p>
          <p>Phone: +91 98765 43210</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
