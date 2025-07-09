import React from 'react';
import '../styles/components/Footer.css';

function Footer() {
  return (
    <footer className="py-3 footer-container">
      <ul className="nav justify-content-center mb-3">
        <li className="nav-item nav-items">
          <a href="#" className="nav-link px-2 footer-link">Home</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link px-2 footer-link">Features</a>
        </li>
        {/* <li className="nav-item"><a href="#" className="nav-link px-2 footer-link">Pricing</a></li> */}
        <li className="nav-item">
          <a href="#" className="nav-link px-2 footer-link">FAQs</a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link px-2 footer-link">About</a>
        </li>
      </ul>
      {/* <p className="text-center text-body-secondary footer-link">© {new Date().getFullYear()} Cosyn Ltd, Inc</p> */}
    </footer>
  );
}

export default Footer;