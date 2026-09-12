import React from "react";
import { FaLinkedin, FaGithub, FaInstagram, FaPhone, FaEnvelope } from "react-icons/fa";
import "./footer.css";

// Developer / project contact details (single source of truth).
const CONTACT = {
  linkedin: "https://www.linkedin.com/in/indrajit-mandal-34a9842a5",
  github: "https://github.com/IndrajitSir",
  instagram: "https://www.instagram.com/its_indrajit_333/",
  phone: "+918391015655",
  phoneDisplay: "+91 8391015655",
  email: "indrajitmandal779@gmail.com",
};

const SOCIALS = [
  { label: "LinkedIn", href: CONTACT.linkedin, icon: <FaLinkedin /> },
  { label: "GitHub", href: CONTACT.github, icon: <FaGithub /> },
  { label: "Instagram", href: CONTACT.instagram, icon: <FaInstagram /> },
];

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
            {SOCIALS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
        <div className="footer-col">
          <h3>Contact</h3>
          <p>
            <a href={`mailto:${CONTACT.email}`} className="footer-link">
              <FaEnvelope className="footer-link-icon" /> {CONTACT.email}
            </a>
          </p>
          <p>
            <a href={`tel:${CONTACT.phone}`} className="footer-link">
              <FaPhone className="footer-link-icon" /> {CONTACT.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
