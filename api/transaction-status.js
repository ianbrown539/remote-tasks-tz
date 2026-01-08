if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const axios = require('axios');

module.exports = async (req, res) => {
  const { reference } = req.query; // CheckoutRequestID e.g. ws_CO_...

  console.log(`[${new Date().toISOString()}] Status check for CheckoutRequestID: ${reference}`);

  if (!reference) {
    return res.status(400).json({ success: false, error: 'Missing reference' });
  }

  const apiKey = process.env.LIPWA_API_KEY;

  if (!apiKey) {
    console.error('Missing LIPWA_API_KEY');
    return res.status(500).json({ success: false, error: 'Server configuration error' });
  }

  try {
    const response = await axios.get(
      `https://pay.lipwa.app/api/status?ref=${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000, // Slightly increased for reliability
      }
    );

    const data = response.data;

    console.log('Lipwa status response:', JSON.stringify(data, null, 2));

    // Normalize Lipwa's raw status strings
    let normalizedStatus = 'PENDING';

    if (data.status === 'payment.success') {
      normalizedStatus = 'SUCCESS';
    } else if (data.status === 'payment.failed') {
      normalizedStatus = 'FAILED'; // Covers both failed and cancelled
    } else if (data.status === 'payment.queued') {
      normalizedStatus = 'PENDING';
    }
    // Any unknown status falls back to PENDING (safe)

    return res.json({
      success: true,
      status: normalizedStatus,
      data: data, // Return raw data for frontend debugging if needed
    });
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    console.error('Status check error:', error.response?.data || errorMsg);

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction status',
      details: errorMsg,
    });
  }
};