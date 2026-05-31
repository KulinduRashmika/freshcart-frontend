import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Home         from "./pages/Home";
import Admin        from "./pages/Admin";
import Cart         from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";
import AdminOrders  from "./pages/AdminOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile      from "./pages/Profile";

/*
  Navbar is rendered INSIDE each page component that needs it.
  No wrapper <Navbar /> here — avoids double navbars.
*/
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no navbar */}
        <Route path="/"         element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — each page renders its own <Navbar /> */}
        <Route path="/home"           element={<Home />} />
        <Route path="/cart"           element={<Cart />} />
        <Route path="/orders"         element={<OrderHistory />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/admin"          element={<Admin />} />
        <Route path="/admin/orders"   element={<AdminOrders />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;