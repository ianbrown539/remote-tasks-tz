if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const axios = require('axios');

module.exports = async (req, res) => {
  const { reference } = req.query; // This is the CheckoutRequestID (e.g., ws_CO_...)

  console.log(`[${new Date().toISOString()}] Status check for CheckoutRequestID: ${reference}`);

  if (!reference) {
    return res.status(400).json({ success: false, error: 'Missing reference' });
  }

  const apiKey = process.env.LIPWA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const response = await axios.get(
      `https://pay.lipwa.app/api/status?ref=${reference}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 10000,
      }
    );

    const data = response.data;

    console.log('Lipwa status response:', JSON.stringify(data, null, 2));

    let normalizedStatus = 'PENDING';
    if (data.status === 'payment.success') normalizedStatus = 'SUCCESS';
    else if (data.status === 'payment.failed') normalizedStatus = 'FAILED';
    // Lipwa uses "payment.failed" for both failed & cancelled

    res.json({
      success: true,
      status: normalizedStatus,
      data: data,
    });
  } catch (error) {
    console.error('Status check error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || 'Failed to fetch status',
    });
  }
};