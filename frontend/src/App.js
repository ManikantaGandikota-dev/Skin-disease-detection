import './App.css';

import React, { useState } from "react";
import axios from "axios";
import Navbar from "./Components/NavBar";
import ModelPage from "./Components/ModelPage";
import AboutPage from "./Components/About.js";
import ModelHome from "./Components/HomeModel.jsx";


function App() {
  const [page, setPage] = useState("home");
  const [output, setOutput] = useState("");
  const [resultImage, setResultImage] = useState(null);
  
    return (
    <>
      <Navbar setPage={setPage} />
<div className="container" style={{ paddingTop: "80px" }}>
        {page === "home" && (
          <ModelHome onUseModel={() => setPage("model")} />
        )}
       {page === "model" && <ModelPage setPage={setPage}/>}

        {page === "about" && <AboutPage />}
      </div>
    </>
  );
  
}

export default App;