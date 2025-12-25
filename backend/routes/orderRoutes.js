const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Create new order (Pay button clicked)
router.post('/', async (req, res) => {
  const { customerName, items, totalAmount } = req.body;
  
  // In a real app, verify totalAmount with server-side calculation
  const order = new Order({
    customerName,
    items,
    totalAmount,
    status: 'Paid' // Automatically paid as per requirement
  });

  try {
    const newOrder = await order.save();
    res.status(201).json({ message: 'Payment successful', order: newOrder });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
