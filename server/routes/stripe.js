const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Payment = require("../models/payment"); // Import the Payment model
const Bus = require("../models/busModel"); // Import the Bus model
const User = require("../models/usersModel"); // Import the User model

router.post("/create-checkout-session", async (req, res) => {
  try {
    console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY); // Debugging log
    const { bus, selectedSeats, userId } = req.body;

    if (!bus || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid request data." });
    }

    const referer = req.get("Referer");
    // Use the referer to dynamically set success_url and cancel_url
    const successUrl = `${referer}?success=true&busId=${bus._id}&userId=${userId}&seats=${selectedSeats.join(",")}`;
    const cancelUrl = `${referer}?canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: req.user?.email,
      line_items: [
        {
          price_data: {
            currency: "npr",
            product_data: {
              name: `Bus Ticket (${bus.name})`,
              description: `Seat Numbers: ${selectedSeats.join(", ")}`,
            },
            unit_amount: bus.price * 100, // Convert NPR to cents
          },
          quantity: selectedSeats.length,
        },
      ],
    });

    // Store payment information in the database
    const payment = new Payment({
      userId,
      busId: bus._id,
      seats: selectedSeats,
      amount: bus.price * selectedSeats.length,
      stripeSessionId: session.id,
    });

    await payment.save();

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Error during Stripe checkout session creation:", error); // Log error for debugging
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
