import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/ComingSoon";
import MoviesPage from "@/pages/MoviesPage";
import SelectScreenPage from "@/pages/SelectScreenPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
import CheckoutPage from "@/pages/CheckoutPage";
import Theaters from "@/pages/Theaters";
import Offers from "@/pages/Offers";
import ClaimOffer from "./pages/ClaimOffer";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/select-screen/:id" element={<SelectScreenPage />} />
      <Route path="/select-seat/:id" element={<SeatSelectionPage />} />
      <Route path="/checkout/:id" element={<CheckoutPage />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/claim-offer" element={<ClaimOffer />} />
    </Routes>
  );
}

