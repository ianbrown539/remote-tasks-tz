// api/palmpesa-record.js
// Store PalmPesa payment records in Firestore

const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: true, message: 'Method not allowed' });
  }

  try {
    const {
      userId,
      orderId,
      transactionId,
      amount,
      phone,
      tier,
      status
    } = req.body;

    // Validate required fields
    if (!userId || !orderId || !transactionId || !amount || !tier || !status) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }

    // Create payment record
    const paymentRecord = {
      userId: userId,
      orderId: orderId,
      transactionId: transactionId,
      amount: Number(amount),
      currency: 'TZS',
      phone: phone || '',
      tier: tier,
      status: status,
      paymentMethod: 'palmpesa',
      country: 'Tanzania',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    // Store in Firestore
    await db.collection('payments').add(paymentRecord);

    console.log(`[${new Date().toISOString()}] Payment recorded - User: ${userId}, Order: ${orderId}, Status: ${status}`);

    return res.status(200).json({
      success: true,
      message: 'Payment recorded successfully'
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Payment record error:`, error);
    return res.status(500).json({
      error: true,
      message: error.message || 'Failed to record payment'
    });
  }
};