import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { axiosInstance } from "../../helpers/axiosInstance";
import { message, Table } from "antd";
import { HideLoading, ShowLoading } from "../../redux/alertsSlice";
import PageTitle from "../../components/PageTitle";
import moment from "moment";
import { Helmet } from "react-helmet";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const dispatch = useDispatch();

  const getBookings = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await axiosInstance.get(
        `/api/bookings/get-all-bookings`, // Change this to fetch payments history
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(HideLoading());
      if (response.data.success) {
        const mappedData = response.data.data.map((booking) => {
          return {
            ...booking,
            user: booking.user || {}, // Ensure user info is included
            bus: booking.bus || {}, // Ensure bus info is included
            paymentDate: moment(booking.createdAt).format("DD/MM/YYYY"), // Format the payment date
            key: booking._id,
          };
        });
        setBookings(mappedData);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  }, [dispatch]);

  const columns = [
    {
      title: "Bus Name",
      dataIndex: ["bus", "name"], // Access bus name from the nested object
      key: "busName",
    },
    {
      title: "Full Name",
      dataIndex: ["user", "name"], // Access user name from the nested object
      render: (userName) => userName || "N/A", // Fallback to "N/A" if no name
    },
    {
      title: "Bus Number",
      dataIndex: ["bus", "busNumber"], // Access bus number from the nested object
      key: "busNumber",
    },
    {
      title: "Journey Date",
      dataIndex: "journeyDate",
      render: (journeyDate) => moment(journeyDate).format("DD/MM/YYYY"),
    },
    {
      title: "Journey Time",
      dataIndex: ["bus", "departure"],
      render: (departure) => moment(departure, "HH:mm").format("hh:mm A"),
    },
    {
      title: "Seats",
      dataIndex: "seats",
      render: (seats) => (seats ? seats.join(", ") : "N/A"), // Check if seats exists
    },
    {
      title: "Payment Amount",
      dataIndex: "amount", // Assuming amount is part of the payment data
      key: "amount",
      render: (amount) => (amount ? `Rs ${amount.toFixed(2)}` : "N/A"), // Format the payment amount
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate", // Display the payment date from formatted createdAt
      key: "paymentDate",
    },
  ];

  useEffect(() => {
    getBookings();
  }, [getBookings]);

  return (
    <>
      <Helmet>
        <title>User Bookings</title>
      </Helmet>
      <div className="p-5">
        <PageTitle title="Bookings" />
        <Table columns={columns} dataSource={bookings} />
      </div>
    </>
  );
}

export default AdminBookings;
