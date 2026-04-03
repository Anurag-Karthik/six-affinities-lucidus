import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/landing";
import Assessment from "../pages/assessment";
import Result from "../pages/result";
import NotFound from "../pages/not-found";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/assessment/:assessmentId" element={<Assessment />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/result/:assessmentId" element={<Result />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}