import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import Button from "../components/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen">
      <Header />

      <div className="h-[calc(100vh-120px)] flex items-center justify-center px-6">
        <div className="w-full max-w-lg text-center p-8 rounded-3xl bg-linear-to-t from-white/5 to-white/10 backdrop-blur-2xl border border-white/10">
          <div className="text-6xl font-bold text-violet">404</div>
          <div className="mt-3 text-xl font-semibold text-light-violet">Page Not Found</div>
          <p className="mt-3 text-white/80">
            The page you are looking for does not exist or may have been moved.
          </p>

          <div className="mt-6">
            <Button
              onClick={() => navigate("/")}
              className="rounded-4xl font-bold text-sm"
              type="olive-green"
            >
              Go To Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
