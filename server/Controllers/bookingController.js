const Booking = require("../models/bookingsModel");
const Bus = require("../models/busModel");
const User = require("../models/usersModel");
const stripe = require("stripe")(process.env.stripe_key);
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require("moment");
const Payment = require('../models/payment');

// nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deesanjog@gmail.com", // Replace with your email address
    pass: "xtco baoi jeqr apsl", // Replace with your email password
  },
});

// book seat and send email to user with the booking details
const BookSeat = async (req, res) => {
  try {
    const newBooking = new Booking({
      ...req.body, // spread operator to get all the data from the request body
      user: req.params.userId,
    });
    const user = await User.findById(req.params.userId);
    // res.json(user._id)
    await newBooking.save();
    const bus = await Bus.findById(req.body.bus); // get the bus from the request body
    bus.seatsBooked = [...bus.seatsBooked, ...req.body.seats]; // add the booked seats to the bus seatsBooked array in the database

    await bus.save();
    // send email to user with the booking details
    let mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Booking Details",
      text: `Hello ${user.name}, your booking details are as follows:
      Bus: ${bus.name}
      Seats: ${req.body.seats}
      Departure Time: ${moment(bus.departure, "HH:mm:ss").format("hh:mm A")}
      Arrival Time: ${moment(bus.arrival, "HH:mm:ss").format("hh:mm A")}
      Journey Date: ${bus.journeyDate}
      Total Price: ${bus.price * req.body.seats.length} MAD
      Thank you for choosing us! 
      `,
    };
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log("Error Occurs", err);
      } else {
        console.log("Email sent!!!");
      }
    });
    res.status(200).send({
      message: "Seat booked successfully",
      data: newBooking,
      user: user._id,
      success: true,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
      message: "Booking failed",
      data: error,
      success: false,
    });
  }
};

// const GetAllBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find().populate("bus").populate("user");
//     res.status(200).send({
//       message: "All bookings",
//       data: bookings,
//       success: true,
//     });
//   } catch (error) {
//     res.status(500).send({
//       message: "Failed to get bookings",
//       data: error,
//       success: false,
//     });
//   }
// };



const GetAllBookings = async (req, res) => {
  try {
    const payments = await Payment.find();

    // Fetch the user and bus data for each payment
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const user = await User.findById(payment.userId);
        const bus = await Bus.findById(payment.busId);
        
        return {
          ...payment.toObject(), // Spread the payment fields
          user, // Attach user details
          bus, // Attach bus details
        };
      })
    );

    res.status(200).send({
      message: "All payment history",
      data: paymentsWithDetails,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to get payment history",
      data: error,
      success: false,
    });
  }
};



const GetAllBookingsByUser = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.user_Id }).populate([
      "bus",
      "user",
    ]);
    res.status(200).send({
      message: "Bookings fetched successfully",
      data: bookings,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Bookings fetch failed",
      data: error,
      success: false,
    });
  }
};

// cancel booking by id and remove the seats from the bus seatsBooked array
const CancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.booking_id);
    const user = await User.findById(req.params.user_id);
    const bus = await Bus.findById(req.params.bus_id);
    if (!booking || !user || !bus) {
      res.status(404).send({
        message: "Booking not found",
        data: error,
        success: false,
      });
    }

    booking.remove();
    bus.seatsBooked = bus.seatsBooked.filter(
      (seat) => !booking.seats.includes(seat)
    );
    await bus.save();
    res.status(200).send({
      message: "Booking cancelled successfully",
      data: booking,
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: "Booking cancellation failed",
      data: error,
      success: false,
    });
  }
};
const PayWithStripe = async (req, res) => {
  try {
    const { bus, selectedSeats, userId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3000/bookings?success=true`,
      cancel_url: `http://localhost:3000/bookings?canceled=true`,
      customer_email: req.user.email, // Optionally add customer email
      line_items: [
        {
          price_data: {
            currency: "npr",
            product_data: {
              name: `Bus Ticket (${bus.name})`,
              description: `Seat Numbers: ${selectedSeats.join(", ")}`,
            },
            unit_amount: bus.price * 100, // Stripe expects the amount in cents
          },
          quantity: selectedSeats.length,
        },
      ],
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }


  // try {
  //   const { token, amount } = req.body;
  //   const customer = await stripe.customers.create({
  //     email: token.email,
  //     source: token.id,
  //   });
  //   const payment = await stripe.charges.create(
  //     {
  //       amount: amount * 100,
  //       currency: "MAD",
  //       customer: customer.id,
  //       receipt_email: token.email,
  //     },
  //     {
  //       idempotencyKey: uuidv4(),
  //     }
  //   );

  //   if (payment) {
  //     res.status(200).send({
  //       message: "Payment successful",
  //       data: {
  //         transactionId: payment.source.id,
  //       },
  //       success: true,
  //       amount: payment.amount,
  //     });
  //   } else {
  //     res.status(500).send({
  //       message: "Payment failed",
  //       data: error,
  //       success: false,
  //       amount: payment.amount,
  //     });
  //   }
  // } catch (error) {
  //   res.status(500).send({
  //     message: "Payment failed",
  //     data: error,
  //     success: false,
  //   });
  // }
};
module.exports = {
  BookSeat,
  GetAllBookings,
  GetAllBookingsByUser,
  CancelBooking,
  PayWithStripe,
};
