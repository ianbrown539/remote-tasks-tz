if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

module.exports = (req, res) => {
  console.log(`[${new Date().toISOString()}] Lipwa callback received:`, JSON.stringify(req.body, null, 2));

  const callbackData = req.body;

  // Official fields
  if (callbackData.status === 'payment.success') {
    console.log(`Payment SUCCESS | CheckoutID: ${callbackData.checkout_id} | Amount: ${callbackData.amount} | Receipt: ${callbackData.mpesa_code}`);
    // Update your DB, mark loan as paid, etc.
  } else if (callbackData.status === 'payment.failed') {
    console.log(`Payment FAILED/CANCELLED | CheckoutID: ${callbackData.checkout_id}`);
    // Handle failure
  }

  // Always respond 200 so Lipwa doesn't retry
  res.status(200).json({ success: true, message: 'Callback received' });
};