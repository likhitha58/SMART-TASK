import React from 'react';
import AppNavbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import image1 from '../assets/images/homeimage.jpg';
import image2 from '../assets/images/homeimage2.jpg';
import image3 from '../assets/images/homeimage3.png';
import ImageOverlaySection from '../components/ImageOverlaySection.jsx';
import '../styles/pages-css/Home.css';

function Home() {
  const carouselImages = [image1, image2, image3];
   return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <div className="d-flex flex-grow-1 home-layout">
        <div className="sidebar-fixed">
          <Sidebar />
        </div>
        <div className="main-content-area">
          <ImageOverlaySection images={carouselImages} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
