import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PaymentSuccess() {

  const navigate = useNavigate();

  useEffect(() => {

    const placePaidOrder = async () => {

      try {

        const user = JSON.parse(localStorage.getItem("user"));

        const orderData = JSON.parse(
          localStorage.getItem("pendingOrder")
        );

        await axios.post(
          `http://localhost:8080/api/orders/place` +
          `?userId=${user.id}` +
          `&customerName=${encodeURIComponent(orderData.customerName)}` +
          `&address=${encodeURIComponent(orderData.address)}` +
          `&phone=${encodeURIComponent(orderData.phone)}`
        );

        localStorage.removeItem("pendingOrder");

        navigate("/orders");

      } catch (err) {

        console.error(err);

        navigate("/cart");
      }
    };

    placePaidOrder();

  }, [navigate]);

  return (
    <div style={{ color: "white", padding: "40px" }}>
      Payment Successful...
    </div>
  );
}

export default PaymentSuccess;