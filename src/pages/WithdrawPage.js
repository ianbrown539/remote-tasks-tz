import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { 
  doc, setDoc, serverTimestamp, onSnapshot,
  collection, query, where, orderBy, limit 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import { 
  DollarSign, Smartphone, CreditCard, Building2, ArrowLeft, 
  CheckCircle, Clock, XCircle, AlertCircle, Calendar 
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const EXCHANGE_RATE = 129.55; // 1 USD = 129.55 KES

function formatKES(amount) {
  return `Ksh.${(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// function formatUSD(amount) {
//   return `($${amount.toFixed(2)} USD)`;
// }

function WithdrawPage() {
  const [userData, setUserData] = useState(null);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [amountUSD, setAmountUSD] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const navigate = useNavigate();

  const MIN_WITHDRAWAL_USD = 10;
  const FEE_PERCENTAGE = 2;

  const balanceKES = balanceUSD * EXCHANGE_RATE;
  const minWithdrawalKES = MIN_WITHDRAWAL_USD * EXCHANGE_RATE;

  // AUTO FETCH BALANCE + USER DATA + WITHDRAWALS
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/signin');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setBalanceUSD(data.balance || 0);
          setPhone(data.phone || '');
        }
      });

      const withdrawalsRef = collection(db, 'withdrawals');
      const q = query(
        withdrawalsRef,
        where('userId', '==', user.uid),
        orderBy('requestedAt', 'desc'),
        limit(5)
      );

      const unsubWithdrawals = onSnapshot(q, (snapshot) => {
        const withdrawals = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          requestedAt: doc.data().requestedAt?.toDate()
        }));
        setRecentWithdrawals(withdrawals);
      });

      return () => {
        unsubUser();
        unsubWithdrawals();
      };
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const calculateFeeUSD = (usd) => (usd * FEE_PERCENTAGE / 100).toFixed(2);
  const calculateTotalUSD = (usd) => (usd - usd * FEE_PERCENTAGE / 100).toFixed(2);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const usd = parseFloat(amountUSD);
    if (!usd || usd < MIN_WITHDRAWAL_USD) {
      toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL_USD} (${formatKES(minWithdrawalKES)})`);
      return;
    }
    if (usd > balanceUSD) {
      toast.error('Insufficient balance');
      return;
    }
    if (method === 'mpesa' && !/^\+254[17]\d{8}$/.test(phone)) {
      toast.error('Invalid M-Pesa number');
      return;
    }
    if (method === 'paypal' && !paypalEmail.includes('@')) {
      toast.error('Invalid PayPal email');
      return;
    }
    if (method === 'bank' && (!bankName || !accountName || !accountNumber)) {
      toast.error('Complete all bank details');
      return;
    }

    setLoading(true);
    try {
      const withdrawalId = `${auth.currentUser.uid}_${Date.now()}`;
      await setDoc(doc(db, 'withdrawals', withdrawalId), {
        userId: auth.currentUser.uid,
        name: userData.name,
        email: userData.email,
        amount: usd,
        method,
        phone: method === 'mpesa' ? phone : null,
        paypalEmail: method === 'paypal' ? paypalEmail : null,
        bankDetails: method === 'bank' ? { bankName, accountName, accountNumber, swiftCode } : null,
        status: 'pending',
        requestedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        balance: balanceUSD - usd
      }, { merge: true });

      toast.success('Withdrawal requested! Paid in 24hrs');
      setAmountUSD('');
      setPaypalEmail('');
      setBankName(''); setAccountName(''); setAccountNumber(''); setSwiftCode('');
    } catch (err) {
      console.error(err);
      toast.error('Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
  const defaultConfig = { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'Pending' };

  const configs = {
    pending: defaultConfig,
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Completed' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'Failed' }
  };

  const config = configs[status] || defaultConfig;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-100">Loading withdrawal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" theme="light" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-100 hover:text-white mb-6">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>

          <h1 className="text-4xl font-black text-white mb-2">Withdraw Earnings</h1>
          <p className="text-blue-100 mb-8">Request payout via M-Pesa, PayPal or Bank</p>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Balance Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border border-amber-400/20 shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Available Balance</p>
                    <h2 className="text-5xl font-black text-slate-800">
                      ${(balanceUSD).toFixed(2)}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{formatKES(balanceKES)}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-slate-600 text-sm">
                  Min: ${MIN_WITHDRAWAL_USD} ({formatKES(minWithdrawalKES)}) • Fee: {FEE_PERCENTAGE}%
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-amber-400/20">
                <h2 className="text-xl font-black text-slate-800 mb-6">Withdrawal Request</h2>

                {/* Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(e.target.value)}
                    className="w-full px-5 py-4 text-2xl font-bold border-2 border-slate-300 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                    placeholder="10.00"
                  />
                  <p className="text-xs text-slate-500 mt-1 ml-1">
                    {amountUSD ? formatKES(parseFloat(amountUSD) * EXCHANGE_RATE) : ''}
                  </p>

                  <div className="flex gap-3 mt-3">
                    {[10, 25, 50, 100].map(usd => {
                      // const kes = usd * EXCHANGE_RATE;
                      return (
                        <button 
                          key={usd} 
                          type="button" 
                          onClick={() => setAmountUSD(usd.toFixed(2))} 
                          disabled={usd > balanceUSD}
                          className="px-5 py-2 bg-amber-100 text-amber-700 rounded-lg font-bold disabled:opacity-50 hover:bg-amber-200 transition"
                        >
                          ${usd}
                        </button>
                      );
                    })}
                    <button 
                      type="button" 
                      onClick={() => setAmountUSD(balanceUSD.toFixed(2))}
                      className="px-5 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-lg font-bold hover:shadow-md transition"
                    >
                      Max
                    </button>
                  </div>

                  {amountUSD && parseFloat(amountUSD) >= MIN_WITHDRAWAL_USD && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex justify-between text-sm">
                        <span>Amount</span>
                        <strong>${parseFloat(amountUSD).toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fee ({FEE_PERCENTAGE}%)</span>
                        <strong>-${calculateFeeUSD(parseFloat(amountUSD))}</strong>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-green-700 mt-2">
                        <span>You Receive</span>
                        <span>${calculateTotalUSD(parseFloat(amountUSD))}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2">
                        ≈ {formatKES(parseFloat(amountUSD) * EXCHANGE_RATE)} KES
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Payment Method</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, color: 'green' },
                      { id: 'paypal', label: 'PayPal', icon: CreditCard, color: 'blue' },
                      { id: 'bank', label: 'Bank', icon: Building2, color: 'purple' }
                    ].map(opt => {
                      const Icon = opt.icon;
                      return (
                        <label key={opt.id} className={`cursor-pointer p-6 rounded-xl border-2 text-center transition ${method === opt.id ? `border-${opt.color}-600 bg-${opt.color}-50` : 'border-slate-300'}`}>
                          <input type="radio" name="method" value={opt.id} checked={method === opt.id} onChange={(e) => setMethod(e.target.value)} className="sr-only" />
                          <Icon className={`w-10 h-10 mx-auto mb-2 ${method === opt.id ? `text-${opt.color}-600` : 'text-slate-600'}`} />
                          <span className="font-bold text-slate-700">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* M-Pesa */}
                {method === 'mpesa' && (
                  <div className="bg-green-50 p-5 rounded-xl border-2 border-green-300">
                    <label className="block font-bold text-green-900 mb-2">M-Pesa Number</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="+254712345678" 
                      className="w-full px-4 py-3 rounded-lg border-2 border-green-400 focus:ring-2 focus:ring-green-400/20"
                    />
                  </div>
                )}

                {/* PayPal */}
                {method === 'paypal' && (
                  <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-300">
                    <label className="block font-bold text-blue-900 mb-2">PayPal Email</label>
                    <input 
                      type="email" 
                      value={paypalEmail} 
                      onChange={(e) => setPaypalEmail(e.target.value)} 
                      placeholder="you@paypal.com" 
                      className="w-full px-4 py-3 rounded-lg border-2 border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                  </div>
                )}

                {/* Bank */}
                {method === 'bank' && (
                  <div className="space-y-4 bg-purple-50 p-5 rounded-xl border-2 border-purple-300">
                    <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name" className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 focus:ring-2 focus:ring-purple-400/20" />
                    <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account Holder" className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 focus:ring-2 focus:ring-purple-400/20" />
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account Number" className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 focus:ring-2 focus:ring-purple-400/20" />
                    <input type="text" value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} placeholder="SWIFT Code (optional)" className="w-full px-4 py-3 rounded-lg border-2 border-purple-400 focus:ring-2 focus:ring-purple-400/20" />
                  </div>
                )}

                <button
                  onClick={handleWithdraw}
                  disabled={loading || !amountUSD || parseFloat(amountUSD) < MIN_WITHDRAWAL_USD || parseFloat(amountUSD) > balanceUSD}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-black text-xl py-5 rounded-xl hover:shadow-2xl transform hover:scale-105 transition disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? 'Processing...' : 'Submit Withdrawal'}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-amber-400/20">
                <h3 className="font-black flex items-center gap-2 mb-4 text-slate-800">
                  <Calendar className="w-5 h-5 text-amber-400" /> Payout Schedule
                </h3>
                <p className="text-sm text-slate-600">• M-Pesa: <strong>Instant</strong></p>
                <p className="text-sm text-slate-600">• PayPal: <strong>24-48 hrs</strong></p>
                <p className="text-sm text-slate-600">• Bank: <strong>2-3 days</strong></p>
              </div>

              <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-300">
                <h3 className="font-black flex items-center gap-2 mb-3 text-slate-800">
                  <AlertCircle className="w-5 h-5 text-amber-600" /> Rules
                </h3>
                <ul className="text-sm space-y-2 text-slate-700">
                  <li>• Min: <strong>${MIN_WITHDRAWAL_USD}</strong> ({formatKES(minWithdrawalKES)})</li>
                  <li>• Fee: <strong>{FEE_PERCENTAGE}%</strong></li>
                  <li>• Paid every Monday & Thursday</li>
                </ul>
              </div>

              <div className="bg-white/95 backdrop-blur-xl p-6 rounded-3xl border border-amber-400/20">
                <h3 className="font-black mb-4 text-slate-800">Recent Withdrawals</h3>
                {recentWithdrawals.length > 0 ? recentWithdrawals.map(w => (
                  <div key={w.id} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
                    <div>
                      <p className="font-bold text-slate-800">${w.amount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{formatKES(w.amount * EXCHANGE_RATE)}</p>
                      <p className="text-xs text-slate-500">{w.requestedAt?.toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(w.status)}
                  </div>
                )) : <p className="text-center text-slate-500 py-4">No history</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WithdrawPage;