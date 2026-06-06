import "./HomeModel.css";
import img1 from "./Images/image1.png";
import img2 from "./Images/Image2.png";
import img3 from "./Images/Image3.png";
import img4 from "./Images/Skin-bg.avif";

export default function ModelHome({ onUseModel }) {
  return (
    <div className="home">
      <img src={img4} alt="Background" className="home-bg-image" />
      <div className="home-card">

        <h1 className="home-title">
          Skin Detection & Makeup Recommendation
        </h1>

        <p className="home-subtitle">
          An AI-powered system for skin analysis and personalized makeup suggestions
        </p>

        <button
          className="primary-btn"
          onClick={onUseModel}
        >
          Use My Model
        </button>

        <hr className="divider" />

        <div className="info">
          <h2 className="info-title">About the Model:</h2>

          <p className="info-text">
            This system uses deep learning techniques to analyze facial skin
            characteristics such as tone, texture, and visible conditions.
            Based on the detected skin type, it recommends suitable makeup
            products tailored to individual needs.
          </p>

          <ul className="info-list">
            <li>Skin type detection using computer vision</li>
            <li>Deep learning–based facial analysis</li>
            <li>Personalized makeup recommendations</li>
            <li>Designed for real-world cosmetic applications</li>
          </ul>
        </div>
        <div className="tech-stack">
            <h2 className="tech-title">Technology Stack:</h2>
            <ul className="tech-list">
              <li><strong>Frontend:</strong> React, CSS</li>
              <li><strong>Backend:</strong> Flask</li>
              <li><strong>Models:</strong> YOLO for object detection and prediction</li>
            </ul>

        </div>
        <div className="examples">
        <h2 className="examples-title">Example Outputs</h2>

        <div className="example-grid">
            <div className="example-card">
            <img src={img1} alt="Input Face" />
            <p>Input Image</p>
            </div>

            <div className="example-card">
            <img src={img2} alt="Skin Analysis" />
            <p>Skin Analysis</p>
            </div>

            <div className="example-card">
            <img src={img3} alt="Makeup Recommendation" />
            <p>Makeup Recommendation</p>
            </div>
        </div>
        </div>

        <div className="feedback">
  <h2 className="feedback-title">User Feedback</h2>

  <p className="feedback-subtitle">
    Share your experience using the Skin Detection & Makeup Recommendation system.
  </p>

  <form className="feedback-form">
    <input 
      type="text" 
      placeholder="Your Name" 
      className="feedback-input"
    />

    <select className="feedback-input">
      <option value="">Rate the system</option>
      <option>⭐⭐⭐⭐⭐ Excellent</option>
      <option>⭐⭐⭐⭐ Good</option>
      <option>⭐⭐⭐ Average</option>
      <option>⭐⭐ Needs Improvement</option>
    </select>

    <textarea 
      placeholder="Write your feedback..." 
      className="feedback-textarea"
    />

          <button type="submit" className="feedback-btn">
            Submit Feedback
          </button>
        </form>
      </div>

      </div>
    </div>
  );
}