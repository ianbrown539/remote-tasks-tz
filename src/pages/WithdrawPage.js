// src/pages/WithdrawPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  doc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';
import {
  DollarSign,
  Smartphone,
  CreditCard,
  Building2,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

const EXCHANGE_RATE = 129.55;
const MIN_AFTER_FEE_USD = 10.20;
const MIN_COMPLETED_TASKS = 15;
const FEE_PERCENTAGE = 2;

const formatKES = (usd) =>
  `Ksh.${(usd * EXCHANGE_RATE).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;

const isThursday = () => new Date().getDay() === 4;

const normalizeMpesa = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  if (/^0[71]/.test(input) && cleaned.length === 10) return `+254${cleaned.slice(1)}`;
  if (/^\+254[71]/.test(input) && cleaned.length === 12) return `+254${cleaned.slice(3)}`;
  if (/^254[71]/.test(cleaned) && cleaned.length === 12) return `+${cleaned}`;
  return null;
};

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mpesa');
  const [phone, setPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eligibility, setEligibility] = useState({
    isThursday: false,
    minAmount: false,
    minTasks: false,
  });

  // Fixed: getStatusIcon inside component, no external config
  const getStatusIcon = useCallback((status) => {
    const config = {
      pending: { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
      completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    }[status] || { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' };

    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  // ... rest of your useEffect and logic (unchanged)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/signin');
        return;
      }
      setUser(currentUser);

      const userRef = doc(db, 'users', currentUser.uid);
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setProfile(data);
          setBalance(data.balance || 0);
          setPhone(data.phone || '');
        }
      });

      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', currentUser.uid),
        orderBy('requestedAt', 'desc'),
        limit(5)
      );
      const unsubWithdrawals = onSnapshot(q, (snapshot) => {
        setWithdrawals(
          snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            requestedAt: d.data().requestedAt?.toDate(),
          }))
        );
      });

      return () => {
        unsubUser();
        unsubWithdrawals();
      };
    });

    return () => unsubAuth();
  }, [navigate]);

  useEffect(() => {
    if (!profile) return;
    const tasksDone = profile.completedTasks || 0;
    const amountOk = balance >= MIN_AFTER_FEE_USD;
    setEligibility({
      isThursday: isThursday(),
      minAmount: amountOk,
      minTasks: tasksDone >= MIN_COMPLETED_TASKS,
    });
  }, [profile, balance]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const usd = parseFloat(amount);
    if (isNaN(usd) || usd <= 0) return toast.error('Enter valid amount');

    const isThu = isThursday();
    const tasksDone = profile?.completedTasks || 0;
    const amountValid = usd >= MIN_AFTER_FEE_USD && balance >= usd;
    const tasksValid = tasksDone >= MIN_COMPLETED_TASKS;

    if (!isThu || !amountValid || !tasksValid) {
      setEligibility({ isThursday: isThu, minAmount: amountValid, minTasks: tasksValid });
      setShowModal(true);
      return;
    }

    if (method === 'mpesa') {
      const normalized = normalizeMpesa(phone);
      if (!normalized) return toast.error('Invalid M-Pesa number');
      setPhone(normalized);
    }
    if (method === 'paypal' && !paypalEmail.includes('@')) {
      return toast.error('Invalid PayPal email');
    }
    if (method === 'bank') {
      const { bankName, accountName, accountNumber } = bankDetails;
      if (!bankName || !accountName || !accountNumber) {
        return toast.error('Complete bank details');
      }
    }

    setLoading(true);
    try {
      const withdrawalId = `${user.uid}_${Date.now()}`;
      const payload = {
        userId: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        amount: usd,
        method,
        status: 'pending',
        requestedAt: serverTimestamp(),
      };

      if (method === 'mpesa') payload.phone = normalizeMpesa(phone);
      if (method === 'paypal') payload.paypalEmail = paypalEmail;
      if (method === 'bank') payload.bankDetails = bankDetails;

      await setDoc(doc(db, 'withdrawals', withdrawalId), payload);
      toast.success('Withdrawal requested! Paid within 24 hrs.');
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setPaypalEmail('');
    setBankDetails({ bankName: '', accountName: '', accountNumber: '', swiftCode: '' });
  };

  const fee = amount ? (parseFloat(amount) * FEE_PERCENTAGE) / 100 : 0;
  const receive = amount ? parseFloat(amount) - fee : 0;

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-100">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" theme="light" autoClose={3000} />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-slate-900">Cannot Withdraw</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {eligibility.isThursday ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <div>
                  <p className="font-medium">Today is Thursday</p>
                  <p className="text-xs text-slate-500">{eligibility.isThursday ? 'Allowed' : 'Only Thursdays'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {eligibility.minAmount ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <div>
                  <p className="font-medium">Greater than or equal to $10.20 after fee</p>
                  <p className="text-xs text-slate-500">You entered ${amount || '0'} • Balance: ${balance.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {eligibility.minTasks ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <div>
                  <p className="font-medium">Greater than or equal to 15 tasks completed</p>
                  <p className="text-xs text-slate-500">You have {profile.completedTasks || 0}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-100 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-black text-white mb-2">Withdraw Earnings</h1>
          <p className="text-blue-100 mb-8">Loyalty pays — every Thursday</p>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <p className="text-sm text-slate-600">Available Balance</p>
                    <p className="text-3xl font-black text-slate-900">${balance.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{formatKES(balance)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-amber-500" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* ... rest of form (unchanged) ... */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Amount (USD) – Min $10.20 after fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-amber-400 focus:ring focus:ring-amber-200 transition"
                      placeholder="10.20"
                      min={MIN_AFTER_FEE_USD}
                      max={balance}
                    />
                    {amount && parseFloat(amount) >= MIN_AFTER_FEE_USD && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span>Fee (2%)</span>
                          <span className="font-medium">-${fee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-700">
                          <span>You Receive</span>
                          <span>${receive.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">≈ {formatKES(receive)}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {[10.20, 25, 50].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toFixed(2))}
                        disabled={val > balance}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-amber-100 disabled:opacity-50 transition"
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(balance.toFixed(2))}
                      className="px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 rounded-lg text-sm font-bold hover:shadow transition"
                    >
                      Max
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, color: 'green' },
                        { id: 'paypal', label: 'PayPal', icon: CreditCard, color: 'blue' },
                        { id: 'bank', label: 'Bank', icon: Building2, color: 'purple' },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <label
                            key={opt.id}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${
                              method === opt.id
                                ? `border-${opt.color}-500 bg-${opt.color}-50`
                                : 'border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            <input
                              type="radio"
                              name="method"
                              value={opt.id}
                              checked={method === opt.id}
                              onChange={(e) => setMethod(e.target.value)}
                              className="sr-only"
                            />
                            <Icon className={`w-6 h-6 mb-1 ${method === opt.id ? `text-${opt.color}-600` : 'text-slate-600'}`} />
                            <span className="text-xs font-medium">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {method === 'mpesa' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        M-Pesa Number (07xx, +2547xx, etc.)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full px-4 py-3 border-2 border-green-400 rounded-lg focus:ring focus:ring-green-200"
                      />
                    </div>
                  )}

                  {method === 'paypal' && (
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="you@paypal.com"
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:ring focus:ring-blue-200"
                    />
                  )}

                  {method === 'bank' && (
                    <div className="space-y-3">
                      {['bankName', 'accountName', 'accountNumber', 'swiftCode'].map((field) => (
                        <input
                          key={field}
                          type="text"
                          value={bankDetails[field]}
                          onChange={(e) =>
                            setBankDetails({ ...bankDetails, [field]: e.target.value })
                          }
                          placeholder={
                            field === 'swiftCode' ? 'SWIFT (optional)' : field.replace(/([A-Z])/g, ' $1').trim()
                          }
                          className="w-full px-4 py-3 border-2 border-purple-400 rounded-lg focus:ring focus:ring-purple-200"
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-bold py-4 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Processing...' : 'Request Withdrawal'}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-amber-500" /> Payout Schedule
                </h3>
                <div className="text-sm space-y-1 text-slate-600">
                  <p>M-Pesa: <strong>Instant</strong></p>
                  <p>PayPal: <strong>24–48 hrs</strong></p>
                  <p>Bank: <strong>2–3 days</strong></p>
                </div>
              </div>

              <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-300">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" /> Loyalty Rules
                </h3>
                <ul className="text-xs space-y-1 text-slate-700">
                  <li>• Only on <strong>Thursdays</strong></li>
                  <li>• Min <strong>$10.20</strong> (after 2% fee)</li>
                  <li>• Complete <strong>15 tasks</strong></li>
                </ul>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow border border-slate-200">
                <h3 className="font-bold mb-3">Recent Withdrawals</h3>
                {withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-bold">${w.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">
                            {w.requestedAt?.toLocaleDateString()} • {w.method}
                          </p>
                        </div>
                        {getStatusIcon(w.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 text-sm">No history</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithdrawPage;