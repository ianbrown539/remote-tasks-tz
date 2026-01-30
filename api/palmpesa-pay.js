// api/palmpesa-pay.js
// PalmPesa Tanzania Payment Integration

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const PALMPESA_CONFIG = {
  apiUrl: 'https://palmpesa.drmlelwa.co.tz/api',
  apiToken: process.env.PALMPESA_API_TOKEN,
  userId: process.env.PALMPESA_USER_ID,
};

/**
 * Make request to PalmPesa API
 */
async function makePalmPesaRequest(endpoint, data) {
  try {
    const url = `${PALMPESA_CONFIG.apiUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PALMPESA_CONFIG.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const contentType = response.headers.get('content-type');
    const text = await response.text();

    // Check if response is JSON
    let decoded = null;
    try {
      decoded = JSON.parse(text);
    } catch (e) {
      return {
        statusCode: response.status,
        response: null,
        raw: text.substring(0, 200),
        contentType: contentType,
        error: 'Non-JSON response received'
      };
    }

    return {
      statusCode: response.status,
      response: decoded,
      raw: text,
      contentType: contentType,
      error: null
    };

  } catch (error) {
    return {
      statusCode: 0,
      response: null,
      raw: null,
      contentType: null,
      error: error.message
    };
  }
}

/**
 * Validate Tanzania phone number
 */
function validateTZPhoneNumber(phone) {
  if (!phone) return { valid: false, message: 'Phone number required' };
  
  const cleaned = phone.replace(/[\s-]/g, '');
  const tzPattern = /^(0|255)(6[2-9]|7[1-9])\d{7}$/;
  
  if (!tzPattern.test(cleaned)) {
    return { 
      valid: false, 
      message: 'Invalid Tanzania phone number. Use format: 0712345678 or 255712345678' 
    };
  }
  
  return { valid: true, formatted: cleaned };
}

module.exports = async (req, res) => {
  // CORS - Allow both production and local development
  const allowedOrigins = [
    'https://www.remote-tasks.it.com',
    'http://localhost:3000',
    'http://localhost:54325'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all for now
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validate method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const { action } = req.body;

    // ACTION: Initiate Payment
    if (action === 'pay') {
      const { phone, amount, transaction_id, name, email } = req.body;

      console.log(`[${new Date().toISOString()}] PalmPesa payment initiated - Phone: ${phone}, Amount: ${amount}, TxID: ${transaction_id}`);

      // Validate inputs
      if (!phone || !amount || !transaction_id) {
        return res.status(400).json({
          error: true,
          message: 'Missing required fields: phone, amount, transaction_id'
        });
      }

      // Validate phone number
      const phoneValidation = validateTZPhoneNumber(phone);
      if (!phoneValidation.valid) {
        return res.status(400).json({
          error: true,
          message: phoneValidation.message
        });
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          error: true,
          message: 'Amount must be a positive number'
        });
      }

      // Check credentials
      if (!PALMPESA_CONFIG.apiToken || !PALMPESA_CONFIG.userId) {
        throw new Error('Missing PalmPesa API credentials');
      }

      // Prepare payment data
      const paymentData = {
        user_id: PALMPESA_CONFIG.userId,
        name: name || 'VIP Customer',
        email: email || 'customer@remote-tasks.it.com',
        phone: phoneValidation.formatted,
        amount: Number(amount),
        transaction_id: transaction_id,
        address: 'Tanzania',
        postcode: '00000',
        buyer_uuid: Math.floor(Math.random() * 900000) + 100000
      };

      console.log(`[${new Date().toISOString()}] Sending to PalmPesa API:`, {
        ...paymentData,
        phone: paymentData.phone.substring(0, 6) + '***'
      });

      // Make API request
      const result = await makePalmPesaRequest('/pay-via-mobile', paymentData);

      // Handle errors
      if (result.error) {
        console.error(`[${new Date().toISOString()}] PalmPesa connection error:`, result.error);
        return res.status(500).json({
          error: true,
          message: `Connection error: ${result.error}`
        });
      }

      if (result.statusCode !== 200) {
        console.error(`[${new Date().toISOString()}] PalmPesa API error (HTTP ${result.statusCode}):`, result.raw?.substring(0, 200));
        return res.status(result.statusCode).json({
          error: true,
          message: `API error (HTTP ${result.statusCode})`,
          content_type: result.contentType,
          details: result.response,
          raw_snippet: result.raw?.substring(0, 200)
        });
      }

      if (result.response === null) {
        console.error(`[${new Date().toISOString()}] PalmPesa returned non-JSON response`);
        return res.status(500).json({
          error: true,
          message: 'Upstream returned non-JSON response',
          content_type: result.contentType,
          raw_snippet: result.raw?.substring(0, 200)
        });
      }

      // Success
      console.log(`[${new Date().toISOString()}] PalmPesa payment response:`, result.response);
      return res.status(200).json(result.response);
    }

    // ACTION: Check Payment Status
    else if (action === 'status') {
      const { order_id } = req.body;

      console.log(`[${new Date().toISOString()}] PalmPesa status check - Order: ${order_id}`);

      if (!order_id) {
        return res.status(400).json({
          error: true,
          message: 'Missing required field: order_id'
        });
      }

      // Prepare status check data
      const statusData = {
        order_id: order_id
      };

      // Make API request
      const result = await makePalmPesaRequest('/order-status', statusData);

      // Handle errors
      if (result.error) {
        console.error(`[${new Date().toISOString()}] PalmPesa status check connection error:`, result.error);
        return res.status(500).json({
          error: true,
          message: `Connection error: ${result.error}`
        });
      }

      if (result.statusCode !== 200) {
        console.error(`[${new Date().toISOString()}] PalmPesa status API error (HTTP ${result.statusCode})`);
        return res.status(result.statusCode).json({
          error: true,
          message: `API error (HTTP ${result.statusCode})`,
          content_type: result.contentType,
          details: result.response,
          raw_snippet: result.raw?.substring(0, 200)
        });
      }

      if (result.response === null) {
        return res.status(500).json({
          error: true,
          message: 'Upstream returned non-JSON response',
          content_type: result.contentType,
          raw_snippet: result.raw?.substring(0, 200)
        });
      }

      // Success
      console.log(`[${new Date().toISOString()}] PalmPesa status response:`, result.response);
      return res.status(200).json(result.response);
    }

    // Invalid action
    else {
      return res.status(400).json({
        error: true,
        message: 'Invalid action. Use "pay" or "status"'
      });
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] PalmPesa API error:`, error);
    return res.status(500).json({
      error: true,
      message: error.message || 'An unexpected error occurred'
    });
  }
};