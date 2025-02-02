import React, { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../helpers/axiosInstance";
import { HideLoading, ShowLoading } from "../redux/alertsSlice";
import { Row, Col, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import SeatSelection from "../components/SeatSelection";
import { Helmet } from "react-helmet";
import moment from "moment";

function BookNow() {
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const params = useParams();
  const dispatch = useDispatch();
  const [bus, setBus] = useState(null);

  const getBus = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.get(`/api/buses/${params.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(HideLoading());
      if (response.data.success) {
        setBus(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch, params.id]);

  const bookNow = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const busId = queryParams.get("busId");
    const userId = queryParams.get("userId");
    const seats = queryParams.get("seats") ? queryParams.get("seats").split(",") : [];
  
    if (!busId || !userId || seats.length === 0) {
      return message.error("Invalid booking details.");
    }
  
    // Fetch bus data if needed
    if (!bus || bus._id !== busId) {
      try {
        dispatch(ShowLoading());
        const response = await axiosInstance.get(`/api/buses/${busId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        dispatch(HideLoading());
        if (response.data.success) {
          setBus(response.data.data);
        } else {
          message.error(response.data.message);
        }
      } catch (error) {
        dispatch(HideLoading());
        message.error(error.message);
        return;
      }
    }
  
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post(
        `/api/bookings/book-seat/${userId}`,
        {
          bus: busId,
          seats: seats,
        }
      );
      dispatch(HideLoading());
      if (response.data.success) {
        message.success(response.data.message);
        navigate("/bookings");
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  
  useEffect(() => {
    getBus();
  }, [getBus]);

  const handleCheckout = async () => {
    if (!bus || !bus._id) {
      return message.error("Bus data is not available.");
    }

    if (selectedSeats.length === 0) {
      return message.error("Please select at least one seat.");
    }

    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.post("/api/stripe/create-checkout-session", {
        bus,
        selectedSeats,
        userId: localStorage.getItem("user_id"),
      });
      dispatch(HideLoading());

      if (response.data.success) {
        window.location.href = response.data.url;
      } else {
        message.error("Payment session failed.");
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get("success") === "true") {
      // Trigger the booking process if payment is successful
      bookNow();
    } else if (queryParams.get("canceled") === "true") {
      // Handle the case if the payment was canceled
      message.error("Payment was canceled.");
    }
  }, []); // Depend on bookNow to trigger when it is updated

  return (
    <>
      <Helmet>
        <title>Book Now</title>
      </Helmet>
      <div>
        {bus && (
          <Row className="m-3 p-5" gutter={[30, 30]}>
            <Col lg={12} xs={24} sm={24}>
              <h1 className="font-extrabold text-2xl text-blue-500">{bus.name}</h1>
              <h1 className="text-2xl font-bold">
                {bus.from} - {bus.to}
              </h1>
              <hr className="border-black" />

              <div className="flex flex-col gap-1 ">
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Journey Date: </b>
                  {bus.journeyDate}
                </h1>

                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Price: </b> NPR {bus.price} /-
                </h1>
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Departure Time: </b>
                  {moment(bus.departure, "HH:mm").format("hh:mm A")}
                </h1>
                <h1 className="text-lg">
                  <b className="text-blue-600 italic">Arrival Time: </b>
                  {moment(bus.arrival, "HH:mm").format("hh:mm A")}
                </h1>
              </div>
              <hr className="border-black" />
              
              <div className="flex w-60 flex-col ">
                <h1 className="text-lg mt-2 font-bold">
                  <span className="text-blue-600 italic">Capacity : </span>{" "}
                  <p>{bus.capacity}</p>
                </h1>
                <h1 className="text-lg font-bold">
                  <span className="text-blue-600 italic">Seats Left : </span>{" "}
                  <p>{bus.capacity - bus.seatsBooked.length}</p>
                </h1>
              </div>
              <hr className="border-black" />

              <div className="flex flex-col gap-2 w-48">
                <h1 className="text-xl">
                  <b className="text-blue-600 italic">Selected Seats: </b>
                  {selectedSeats.join(", ")}
                </h1>
                <h1 className="text-xl mt-2 mb-3">
                  <b className="text-blue-600 italic">Total Price: </b> NPR{" "}
                  {bus.price * selectedSeats.length}
                </h1>

                <button
                  onClick={handleCheckout}
                  className={`bg-blue-500 text-white px-4 py-2 rounded ${
                    selectedSeats.length === 0 && "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={selectedSeats.length === 0}
                >
                  Pay Now
                </button>
              </div>
            </Col>
            <Col lg={12} xs={24} sm={24}>
              <SeatSelection
                selectedSeats={selectedSeats}
                setSelectedSeats={setSelectedSeats}
                bus={bus}
              />
            </Col>
          </Row>
        )}
      </div>
    </>
  );
}

export default BookNow;
