
import axios from "axios";
import "./ModelPags.css";
import { useState, useRef } from "react";
import productsData from "./Images/prices.json";

export default function ModelPage({setPage}) {

  const [image, setImage] = useState(null);
  const [output, setOutput] = useState("");
  const [resultImage, setResultImage] = useState(null);
  const [cnnPrediction, setCnnPrediction] = useState("");
  const [cnnConfidence, setCnnConfidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [budget, setBudget] = useState("");
  const [season, setSeason] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [top3Predictions, setTop3Predictions] = useState([]);

const BACKEND_URL = "http://127.0.0.1:5000";

  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // Block AVIF explicitly
  if (file.type === "image/avif") {
    alert("AVIF format is not supported. Please upload JPG, PNG, or WEBP.");
    e.target.value = "";   // reset input
    return;
  }

  // Optional extra safety
  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    e.target.value = "";
    return;
  }

  setImage(file);
  setOutput("");
};

const categoryMap = {
  acne: "acne",
  pores: "pores",
  wrinkles: "wrinkles",
  blackheades: "blackheades",
  "dark spots": "dark_spots"
};

   const handleFilterProducts = () => {

  // example cnnPrediction = "pimples"
const mappedCategory = categoryMap[cnnPrediction];
const categoryProducts = productsData[mappedCategory] || [];

console.log("CNN Prediction:", cnnPrediction);
console.log("Mapped Category:", categoryMap[cnnPrediction]);
console.log("Available Keys:", Object.keys(productsData));

  const filtered = categoryProducts.filter(product => {

    // price filter
    const matchBudget =
      budget === "" || product.price <= Number(budget);

    // season filter
    const matchSeason =
      season === "" ||
      !product.season || // some items don't have season
      (Array.isArray(product.season)
        ? product.season.includes(season)
        : product.season === season);

      return matchBudget && matchSeason;

    });

    // convert names → image paths
        const images = filtered.map(product =>{

          let productSeason;

        if (Array.isArray(product.season)) {
          productSeason = product.season.includes(season)
            ? season
            : product.season[0];
        }
        else {
          productSeason = product.season;
        }


      const cleanName = product.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "");
    
      console.log(`/Rec/${mappedCategory}/${mappedCategory}/${productSeason}/${cleanName}.webp`)


       return {
        name: product.name,
        price: product.price,
        img: `/Rec/${mappedCategory}/${mappedCategory}/${productSeason}/${cleanName}.webp`
      };

       });
       
       console.log(images);
    

    setFilteredProducts(images);
  };

   const predictYOLO = async () => {
    try{
    const formData = new FormData();
    console.log("Predicting YOLO with image:", image);
    formData.append("image", image);
    const res = await axios.post(`${BACKEND_URL}/predict-yolo`, formData);

    setResultImage(`data:image/jpeg;base64,${res.data.image}`);
    await predictCNN();
    setOutput("");
  
}catch (error) {
    console.error("Error during YOLO prediction:", error);
    setOutput("Error during YOLO prediction. Please try again.");
  }
};

 const predictCNN = async () => {

    try {

      const formData = new FormData();

      formData.append("image", image);


      const res = await axios.post(
        `${BACKEND_URL}/predict-cnn`,
        formData
      );


      setCnnPrediction(res.data.prediction);

      setCnnConfidence(res.data.top_confidence);

      setTop3Predictions(res.data.top3);

    }

    catch (error) {

      console.error(error);

      setOutput("Error during CNN prediction");

    }

  };

 return (
    <div className="page">
      <div className="card">

        <h2 className="title">
          Upload your Image 
        </h2>

        {/* Upload box */}
          <div
               className="upload-box">
                <label className="upload-label">
              <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <p className="upload-text">Upload an image to analyze skin</p>

              {!image ? (
              <>
               <div className="upload-icon">⬆</div>
                  <p className="upload-text">Drop image here</p>
                  <span className="upload-subtext">or click to browse</span>
              </>
            ) : (
              <img
                src={URL.createObjectURL(image)}
                alt="Uploaded preview"
                className="preview-image"
              />
            )}
            </label>
          </div>

        <div className="actions">
          <button
            onClick={predictYOLO}
            disabled={loading}
            className="btn"
          >
            {loading ? "Predicting..." : "Run YOLO"}
          </button>

          <button onClick={() => setPage("home")}>← Back</button>
        </div>

        {output && (
          <pre className="error">
            {output}
          </pre>
        )}

        {resultImage && (
          <div className="result">
            <img
              src={resultImage}
              alt="YOLO Result"
              className="result-image"
            />

            <div className="result-text">
              <strong>Prediction:</strong> {cnnPrediction}
              <br />
              <strong>Confidence:</strong> {cnnConfidence}
            </div>
            <div className="top3-container">
              <h4>Top Skin Conditions</h4>

              {top3Predictions.map((item, index) => (
                <div key={index} className="top3-item">
                  {index + 1}. {item.label} - {item.confidence}%
                </div>
              ))}
            </div>
          </div>
        )}




        {cnnPrediction && (
    <div className="budget-box">

      <h3>Recommended Products</h3>

      {/* Budget */}
      <input
        type="number"
        placeholder="Enter your budget"
        value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />

          {/* Season dropdown */}
            <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="">Select Season</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="rainy">Rainy</option>
          </select>

          <button onClick={handleFilterProducts}>
            Show Products
          </button>

        </div>
    )}

        <div className="product-grid">

          {filteredProducts.map((img, index) => (

              <div key={index} className="product-card">

                <img src={img.img} alt={`product-${index}`} />
                 <h4 className="product-name">{img.name}</h4>
                  <p className="product-price">₹{img.price}</p>

              </div>

            ))}

    </div>


      </div>
      
    </div>
  );
}