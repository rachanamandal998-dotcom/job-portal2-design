import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import ProductListing from "./components/ProductListing";
import ServiceListing from "./components/ServiceListing";
import JobPortal from "./components/JobPortal";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar userName="Rachana" verified={true} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
       
            <Route path="/jobs" element={<JobPortal />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/services" element={<ServiceListing />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}