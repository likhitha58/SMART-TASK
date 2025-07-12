// 📁 components/ImageOverlaySection.jsx
import React from 'react';
import { Carousel } from 'react-bootstrap';
import '../styles/components/ImageOverlaySection.css';

const ImageOverlaySection = ({ images }) => {
  return (
    <div className="image-overlay-container">
      <Carousel fade controls={false} indicators={false} interval={3000}>
        {images.map((img, idx) => (
          <Carousel.Item key={idx}>
            <img className="background-image d-block w-100" src={img} alt={`Slide ${idx}`} />
            <div className="dark-overlay" />
            <Carousel.Caption className="overlay-text">
              <h1>Your Smart Task Assistant</h1>
              <p>Assign. Manage. Review. All in one platform.</p>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default ImageOverlaySection;
