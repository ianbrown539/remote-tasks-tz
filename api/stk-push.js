if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const axios = require('axios');

module.exports = async (req, res) => {
  const allowedOrigins = [
    'https://remote-tasks-seven.vercel.app',
    'https://remote-tasks-seven.vercel.app', // Update with your actual deployed URL
  ];

  const origin = req.headers.origin;

  // CORS handling
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } else if (req.method !== 'OPTIONS') {
    return res.status(403).json({ success: false, error: 'CORS origin not allowed' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { phoneNumber, amount, reference } = req.body;

  console.log(`[${new Date().toISOString()}] STK Push requested - Phone: ${phoneNumber}, Amount: ${amount}, Reference: ${reference}`);

  if (!phoneNumber || !amount || !reference) {
    return res.status(400).json({ success: false, error: 'Missing phoneNumber, amount, or reference' });
  }

  let formattedPhone = phoneNumber;
  if (phoneNumber.startsWith('0')) {
    formattedPhone = `254${phoneNumber.slice(1)}`;
  } else if (phoneNumber.startsWith('+254')) {
    formattedPhone = phoneNumber.slice(1);
  }

  if (!/^254[17]\d{8}$/.test(formattedPhone)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid phone number format',
    });
  }

  if (isNaN(amount) || amount < 10) { // Lipwa min amount is 10 KES per docs
    return res.status(400).json({ success: false, error: 'Amount must be at least 10 KES' });
  }

  const apiKey = process.env.LIPWA_API_KEY;
  const channelId = process.env.LIPWA_CHANNEL_ID;
  const callbackUrl = process.env.LIPWA_CALLBACK_URL;

  if (!apiKey || !channelId || !callbackUrl) {
    console.error('Missing Lipwa configuration');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const payload = {
      amount: Number(amount),
      phone_number: formattedPhone,
      channel_id: channelId,
      callback_url: callbackUrl,
      api_ref: reference, // Can be string or object per docs – string works fine
    };

    console.log('Sending to Lipwa:', JSON.stringify(payload, null, 2));

    const response = await axios.post(
      'https://pay.lipwa.app/api/payments',
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const lipwaData = response.data;

    console.log('Lipwa response:', JSON.stringify(lipwaData, null, 2));

    // Official success check per docs & your logs
    if (lipwaData.ResponseCode === '0') {
      // Use CheckoutRequestID as the reference for polling (official status endpoint uses this)
      const lipwaRef = lipwaData.CheckoutRequestID;

      return res.status(200).json({
        success: true,
        clientReference: reference,
        lipwaReference: lipwaRef,
        message: 'STK Push initiated successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: lipwaData.ResponseDescription || lipwaData.CustomerMessage || 'STK Push initiation failed',
        data: lipwaData,
      });
    }
  } catch (error) {
    const errorData = error.response?.data || { message: error.message };
    console.error('Lipwa error:', JSON.stringify(errorData, null, 2));
    return res.status(400).json({
      success: false,
      error: errorData.ResponseDescription || errorData.message || 'An unexpected error occurred',
      data: errorData,
    });
  }
};