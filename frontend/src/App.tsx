import { Routes, Route } from "react-router-dom";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "@/pages/Home";
import ComingSoon from "@/pages/ComingSoon";
import ComingSoonDetailPage from "@/pages/ComingSoonDetailPage";
import MoviesPage from "@/pages/MoviesPage";
import SelectScreenPage from "@/pages/SelectScreenPage";
import SeatSelectionPage from "@/pages/SeatSelectionPage";
import CheckoutPage from "@/pages/CheckoutPage";
import Theaters from "@/pages/Theaters";
import About from "./pages/About-backup";
import NotificationsPage from "@/pages/NotificationsPage";
import ProfilePage from "@/pages/ProfilePage";
import TicketPage from "@/pages/TicketPage";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coming-soon" element={<ComingSoon />} />
      <Route path="/coming-soon/:id" element={<ComingSoonDetailPage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/select-screen/:id" element={<SelectScreenPage />} />
      <Route path="/select-seat/:id" element={<SeatSelectionPage />} />
      <Route path="/checkout/:id" element={<CheckoutPage />} />
      <Route path="/theaters" element={<Theaters />} />
      <Route path="/about" element={<About />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/ticket/:id" element={<TicketPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
    </>
  );
}