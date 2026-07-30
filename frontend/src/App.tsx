import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/ComingSoon";
import Offers from "@/pages/Offers";
import ClaimOffer from "./pages/ClaimOffer";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/claim-offer" element={<ClaimOffer />} />
    </Routes>
  );
}

