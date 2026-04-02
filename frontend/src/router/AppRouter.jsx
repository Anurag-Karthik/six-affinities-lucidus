import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/landing";
import Assessment from "../pages/assessment";
import Results from "../pages/result";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}