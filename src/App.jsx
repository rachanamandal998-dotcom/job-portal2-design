import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProductListing from "./components/pages/ProductListing";
import ServiceListing from "./components/pages/ServiceListing";
import JobPortal from "./components/pages/JobPortal";

export default function App() {
  return (
  
      <Routes>
        <Route path="/"                 element={<Navigate to="/products" replace />} />
        <Route path="/products"         element={<ProductListing />} />
        <Route path="/services"         element={<ServiceListing />} />
        <Route path="/jobs"             element={<JobPortal />} />
      </Routes>
   
  );
}