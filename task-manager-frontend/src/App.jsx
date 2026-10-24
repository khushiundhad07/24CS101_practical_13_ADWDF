
import { lazy, Suspense } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import "./App.css";

const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./pages/Contact"));

function LoadingPage() {
  return (
    <div className="container">
      <h2>Loading page...</h2>
      <p>Please wait while the page loads.</p>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "5px solid #ccc",
          borderTop: "5px solid blue",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "20px auto",
        }}
      />
    </div>
  );
}

function App() {
  return (
    <div>
      <nav style={{ padding: "15px" }}>
        <Link to="/">Home</Link>
        {" | "}
        <Link to="/projects">Projects</Link>
        {" | "}
        <Link to="/contact">Contact</Link>
      </nav>

      <Suspense fallback={<LoadingPage />}>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/contact" element={<Contact />} />
  </Routes>
</Suspense>
    </div>
  );
}

export default App;
