import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Cart from "./pages/Cart";
import OrderHistory from "./pages/OrderHistory";  // ← Add this import
import AdminOrders from "./pages/AdminOrders";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (No Navbar) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes (With Navbar) */}
        <Route 
          path="/home" 
          element={
            <>
              <Navbar />
              <Home />
            </>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <>
              
              <Admin />
            </>
          } 
        />

        {/* Cart Route */}
        <Route 
          path="/cart" 
          element={
            <>
              <Navbar />
              <Cart />
            </>
          } 
        />

        {/* Order History Route */}
        <Route 
          path="/orders" 
          element={
            <>
              <Navbar />
              <OrderHistory />
            </>
          } 
        />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route
  path="/payment-success"
  element={<PaymentSuccess />}
/>
<Route path="/profile" element={<><Navbar /><Profile /></>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;