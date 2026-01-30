// src/pages/WithdrawPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  query,
  collection,
  where,
  setDoc,
  onSnapshot,
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
  Lock,
  ShieldCheck,
  TrendingUp,
  Crown,
  User,
  Sparkles,
  Zap,
  PartyPopper,
  BadgeCheck,
  RefreshCw,
  Users,
  Gift
} from 'lucide-react';
import Confetti from 'react-confetti';
import 'react-toastify/dist/ReactToastify.css';
import { getCurrentExchangeRate, formatKES } from './UserDashboard';

const VIP_CONFIG = {
  Bronze: { priceUSD: 1.99, dailyTasks: 3 },
  Silver: { priceUSD: 4.99, dailyTasks: 8 }, // Best value
  Gold:   { priceUSD: 9.99, dailyTasks: 15 }, // Premium tier
};

const MIN_WITHDRAWAL_USD = 10.00;
const MIN_COMPLETED_TASKS = 15;
const FEE_PERCENTAGE = 2;

// Referral requirements
const REQUIRED_TOTAL_REFERRALS = 5;
const REQUIRED_VIP_REFERRALS = 2;

// Referral bonuses
const VIP_UPGRADE_BONUS = 10;

const normalizePhoneNumber = (input) => {
  if (!input) return null;
  const cleaned = input.replace(/\D/g, '');
  if (/^0[71]\d{8}$/.test(input)) return `254${cleaned.slice(1)}`;
  if (/^\+254[71]\d{8}$/.test(input)) return cleaned.slice(4);
  if (/^254[71]\d{8}$/.test(cleaned)) return cleaned;
  return null;
};

const isValidMpesaNumber = (input) =>
  /^0[17]\d{8}$/.test(input) || /^\+254[17]\d{8}$/.test(input) || /^254[17]\d{8}$/.test(input.replace(/\D/g, ''));

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
    kycComplete: false,
    minAmount: false,
    minTasks: false,
  });
  // VIP Upgrade State
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [selectedVIP, setSelectedVIP] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // Animated Withdrawal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [animationStep, setAnimationStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [refreshingWithdrawals, setRefreshingWithdrawals] = useState(false);

  // Check if basic requirements (first 3) are complete
  const basicRequirementsMet = eligibility.kycComplete && eligibility.minAmount && eligibility.minTasks;
  // Check if ALL requirements including referrals are complete
  const allRequirementsMet =
    basicRequirementsMet &&
    (profile?.totalReferrals || 0) >= REQUIRED_TOTAL_REFERRALS &&
    (profile?.vipReferrals || 0) >= REQUIRED_VIP_REFERRALS;

  const getStatusIcon = useCallback((status) => {
    const config = {
      pending: { Icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
      processing: { Icon: RefreshCw, color: 'text-lime-400', bg: 'bg-lime-400/20' },
      completed: { Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
      failed: { Icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/20' },
    }[status] || { Icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/20' };
    const Icon = config.Icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }, []);

  const loadWithdrawals = useCallback(async (userId) => {
    if (!userId) return;

    setRefreshingWithdrawals(true);
    try {
      const q = query(
        collection(db, 'withdrawals'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      const withdrawalsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        withdrawalsData.push({
          id: doc.id,
          ...data,
          requestedAt: data.requestedAt?.toDate() || new Date(),
        });
      });

      withdrawalsData.sort((a, b) => b.requestedAt - a.requestedAt);
      const limitedWithdrawals = withdrawalsData.slice(0, 10);

      setWithdrawals(limitedWithdrawals);
    } catch (error) {
      console.error('❌ Error loading withdrawals:', error);
      toast.error('Failed to load withdrawal history');
    } finally {
      setRefreshingWithdrawals(false);
    }
  }, []);

  const setupWithdrawalsListener = useCallback((userId) => {
    if (!userId) return;

    const q = query(
      collection(db, 'withdrawals'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        let withdrawalsData = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          requestedAt: d.data().requestedAt?.toDate() || new Date(),
        }));

        withdrawalsData.sort((a, b) => b.requestedAt - a.requestedAt);
        withdrawalsData = withdrawalsData.slice(0, 10);

        setWithdrawals(withdrawalsData);
      },
      (error) => {
        console.error('❌ Error in withdrawals listener:', error);
        loadWithdrawals(userId);
      }
    );

    return unsubscribe;
  }, [loadWithdrawals]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser === null) return;

      if (!currentUser) {
        toast.info('Please sign in to withdraw your earnings');
        navigate('/signin', { replace: true });
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, 'users', currentUser.uid);
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (!snap.exists()) {
          toast.error('Profile not found');
          navigate('/dashboard');
          return;
        }
        const data = snap.data();
        setProfile(data);
        setBalance(data.currentbalance || 0);
        setPhone(data.phone || '');
      });

      const unsubWithdrawals = setupWithdrawalsListener(currentUser.uid);

      return () => {
        unsubUser();
        if (unsubWithdrawals) unsubWithdrawals();
      };
    });

    return () => unsubAuth();
  }, [navigate, setupWithdrawalsListener]);

  const refreshWithdrawals = () => {
    if (user) {
      loadWithdrawals(user.uid);
    }
  };

  useEffect(() => {
    if (!profile) return;

    const hasCompletedOnboarding = profile.hasDoneOnboardingTask || false;
    const tasksDone = profile.ApprovedTasks || 0;
    const minAmountNeeded = MIN_WITHDRAWAL_USD / (1 - FEE_PERCENTAGE / 100);
    const amountOk = balance >= minAmountNeeded;

    setEligibility({
      kycComplete: hasCompletedOnboarding,
      minAmount: amountOk,
      minTasks: tasksDone >= MIN_COMPLETED_TASKS,
    });
  }, [profile, balance]);

  const startWithdrawalAnimation = (data) => {
    setWithdrawalData(data);
    setShowSuccessModal(true);
    setAnimationStep(0);
    setShowConfetti(true);
    setTimeout(() => setAnimationStep(1), 1500);
    setTimeout(() => setAnimationStep(2), 3000);
    setTimeout(() => setShowConfetti(false), 6000);
    setTimeout(() => {
      if (user) loadWithdrawals(user.uid);
    }, 5000);
  };

const handleRealVIPUpgrade = async () => {
    if (!selectedVIP) return toast.error('Select a VIP tier');
    
    const normalized = normalizePhoneNumber(mpesaNumber);
    if (!normalized || !isValidMpesaNumber(mpesaNumber)) 
      return toast.error('Invalid M-Pesa number');

    setIsProcessing(true);

    const liveRate = getCurrentExchangeRate();
    const usdPrice = VIP_CONFIG[selectedVIP].priceUSD;
    const kesAmount = Math.round(usdPrice * liveRate);

   const clientReference = `V_${user.uid}_${Date.now()}`;

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: normalized,
          amount: kesAmount,
          reference: clientReference,
          description: `${selectedVIP} VIP Upgrade • $${usdPrice} USD @ ${liveRate.toFixed(2)} KES/USD`,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'STK push failed');

      toast.info(
        <div className="text-xs">
          <p>STK push sent to {mpesaNumber}</p>
          <p className="text-emerald-300 mt-1">
            Amount: Ksh.{kesAmount.toLocaleString()} (≈ ${usdPrice} @ {liveRate.toFixed(2)} KES/USD)
          </p>
        </div>,
        { autoClose: 15000 }
      );

      const poll = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/transaction-status?reference=${encodeURIComponent(data.payheroReference)}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'SUCCESS') {
            clearInterval(poll);
            toast.success('Payment confirmed! VIP upgraded 🎉');
            await finalizeVIPUpgrade();
          } else if (['FAILED', 'CANCELLED'].includes(statusData.status)) {
            clearInterval(poll);
            toast.error('Payment failed or cancelled');
            setIsProcessing(false);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 5000);

      setTimeout(() => {
        clearInterval(poll);
        if (isProcessing) {
          toast.warn('Payment timed out — check your phone');
          setIsProcessing(false);
        }
      }, 120000);

    } catch (e) {
      toast.error(e.message || 'Upgrade failed');
      setIsProcessing(false);
    }
  };


  // FIXED: Award $10 bonus to referrer when referred user upgrades to VIP
  const handleVIPReferralBonus = async (upgradedUserId, upgradedUserPhone) => {
    try {
      const upgradedUserSnap = await getDoc(doc(db, 'users', upgradedUserId));
      const upgradedUserData = upgradedUserSnap.data();
      const referredByCode = upgradedUserData?.referredBy;
      if (!referredByCode || !upgradedUserPhone) {
        console.log('No referral code or phone found');
        return;
      }
      // Find referrer by their referral code
      const referrerQuery = await getDocs(
        query(collection(db, 'users'), where('referralCode', '==', referredByCode))
      );
      if (referrerQuery.empty) {
        console.log('Referrer not found for code:', referredByCode);
        return;
      }
      const referrerRef = referrerQuery.docs[0].ref;
      const referrerSnap = await getDoc(referrerRef);
      const referrerData = referrerSnap.data();
      // Check if VIP bonus already awarded for this user
      const alreadyHasVIPBonus = (referrerData.recentReferrals || []).some(
        (r) => r.phone === upgradedUserPhone && (r.isVIP || r.vipUpgraded)
      );
      if (alreadyHasVIPBonus) {
        console.log('✓ VIP bonus already awarded for this user');
        return;
      }
      // Award $10 VIP upgrade bonus (on top of initial $5)
      await updateDoc(referrerRef, {
        vipReferrals: increment(1),
        referralEarnings: increment(VIP_UPGRADE_BONUS),
        currentbalance: increment(VIP_UPGRADE_BONUS),

        // Update the referral entry to mark as VIP
        recentReferrals: arrayUnion({
          phone: upgradedUserPhone,
          isVIP: true,
          vipUpgraded: true,
          upgradeDate: serverTimestamp(),
        }),
      });
      console.log(`✅ VIP Referral Bonus: $${VIP_UPGRADE_BONUS} awarded to referrer!`);

      toast.success(`Your referrer earned $${VIP_UPGRADE_BONUS} because you upgraded!`, {
        autoClose: 5000,
        icon: <Gift className="w-5 h-5" />,
      });
    } catch (err) {
      console.error('❌ Failed to award VIP referral bonus:', err);
    }
  };

  const finalizeVIPUpgrade = async () => {
    const newMax = VIP_CONFIG[selectedVIP].dailyTasks;
    // Award VIP bonus to referrer
    await handleVIPReferralBonus(user.uid, profile.phone);
    await updateDoc(doc(db, 'users', user.uid), {
      isVIP: true,
      tier: `${selectedVIP}VIP`,
      dailyTasksRemaining: newMax,
      lastTaskResetDate: serverTimestamp(),
      vipUpgradedAt: serverTimestamp(),
    });
    setProfile(prev => ({ ...prev, isVIP: true, tier: `${selectedVIP}VIP` }));
    toast.success(`${selectedVIP} VIP Activated! ${newMax} tasks/day unlocked!`);
    setShowVIPModal(false);
    setIsProcessing(false);
    setSelectedVIP('');
    setMpesaNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allRequirementsMet) {
      setShowModal(true);
      return;
    }
    const usd = parseFloat(amount);
    if (isNaN(usd) || usd <= 0) return toast.error('Enter valid amount');
    const hasCompletedOnboarding = profile?.hasDoneOnboardingTask || false;
    const tasksDone = profile?.ApprovedTasks || 0;
    const feeAmount = (usd * FEE_PERCENTAGE) / 100;
    const amountAfterFee = usd - feeAmount;
    const amountValid = amountAfterFee >= MIN_WITHDRAWAL_USD && balance >= usd;
    const tasksValid = tasksDone >= MIN_COMPLETED_TASKS;
    if (!hasCompletedOnboarding || !amountValid || !tasksValid) {
      setEligibility({
        kycComplete: hasCompletedOnboarding,
        minAmount: amountValid,
        minTasks: tasksValid
      });
      setShowModal(true);
      return;
    }
    if (method === 'mpesa') {
      const normalized = normalizePhoneNumber(phone);
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
      const userDoc = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userDoc);
      const currentBalance = userSnap.data()?.currentbalance || 0;
      if (currentBalance < usd) {
        toast.error('Insufficient balance');
        setLoading(false);
        return;
      }
      const withdrawalId = `${user.uid}_${Date.now()}`;
      const payload = {
        userId: user.uid,
        name: profile.name || user.displayName || 'User',
        email: user.email,
        amount: usd,
        method,
        status: 'pending',
        requestedAt: serverTimestamp(),
      };
      if (method === 'mpesa') payload.phone = normalizePhoneNumber(phone);
      if (method === 'paypal') payload.paypalEmail = paypalEmail;
      if (method === 'bank') payload.bankDetails = bankDetails;
      await setDoc(doc(db, 'withdrawals', withdrawalId), payload);
      await updateDoc(userDoc, { currentbalance: increment(-usd) });
      const withdrawalInfo = {
        id: withdrawalId,
        amount: usd,
        method,
        fee: feeAmount,
        receive: amountAfterFee,
        phone: method === 'mpesa' ? phone : null,
        email: method === 'paypal' ? paypalEmail : null,
        bankDetails: method === 'bank' ? bankDetails : null,
        timestamp: new Date(),
      };
      startWithdrawalAnimation(withdrawalInfo);
      resetForm();
      setAmount('');
    } catch (err) {
      console.error('❌ Withdrawal error:', err);
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

  // Scroll to referral card
  const scrollToReferralCard = () => {
    setShowModal(false);
    setTimeout(() => {
      const referralCard = document.getElementById('referral-card');
      if (referralCard) {
        referralCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        referralCard.classList.add('ring-4', 'ring-lime-400', 'ring-offset-4', 'ring-offset-green-950');
        setTimeout(() => {
          referralCard.classList.remove('ring-4', 'ring-lime-400', 'ring-offset-4', 'ring-offset-green-950');
        }, 3000);
      }
    }, 300);
  };

  const fee = amount ? (parseFloat(amount) * FEE_PERCENTAGE) / 100 : 0;
  const receive = amount ? parseFloat(amount) - fee : 0;

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-green-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-green-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" theme="dark" autoClose={3000} />
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} gravity={0.3} />}

      {/* Animated Success Modal */}
      {showSuccessModal && withdrawalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-green-900/90 backdrop-blur rounded-3xl p-8 max-w-md w-full shadow-2xl border border-lime-400/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 via-emerald-400/10 to-green-600/10 animate-pulse" />

            <div className="relative z-10 text-center">
              {animationStep === 0 && (
                <div className="animate-fade-in">
                  <div className="w-20 h-20 bg-lime-400/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-lime-400/50">
                    <Zap className="w-10 h-10 text-lime-400 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Processing Withdrawal</h3>
                  <p className="text-green-200 mb-6">Setting up your payment...</p>
                  <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              {animationStep === 1 && (
                <div className="animate-fade-in">
                  <div className="w-20 h-20 bg-emerald-400/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-400/50">
                    <BadgeCheck className="w-10 h-10 text-emerald-400 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Payment Approved!</h3>
                  <p className="text-green-200 mb-6">Funds are being transferred...</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              {animationStep === 2 && (
                <div className="animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-lime-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <PartyPopper className="w-10 h-10 text-white animate-tada" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Success! 🎉</h3>
                  <p className="text-green-200 mb-2">Withdrawal processed successfully</p>

                  <div className="bg-green-950/80 rounded-2xl p-5 border border-lime-400/30 mt-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-green-300">Amount:</span>
                      <span className="text-2xl font-black text-lime-400">
                        ${withdrawalData.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-300">Fee (2%):</span>
                      <span className="text-red-400">-${withdrawalData.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-green-300">You receive:</span>
                      <span className="font-bold text-white">${withdrawalData.receive.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-green-700 pt-3">
                      <p className="text-xs text-green-300">
                        {withdrawalData.method === 'mpesa' && `To: ${withdrawalData.phone}`}
                        {withdrawalData.method === 'paypal' && `To: ${withdrawalData.email}`}
                        {withdrawalData.method === 'bank' && `To: ${withdrawalData.bankDetails?.bankName}`}
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        Expected: {withdrawalData.method === 'mpesa' ? 'Instant' : '24-48 hours'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-green-950 font-bold py-4 rounded-xl hover:shadow-lg transition transform hover:scale-[1.02]"
                    >
                      Continue Earning
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full bg-green-800 text-green-200 font-bold py-3 rounded-xl hover:bg-green-700 transition"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIP Upgrade Modal */}
      {showVIPModal && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-green-950 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lime-400/20 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Unlock VIP Access</h2>
            <p className="text-xs text-green-200">Maximize Your Earning Potential</p>
          </div>
        </div>
        <button 
          onClick={() => setShowVIPModal(false)}
          className="p-2 hover:bg-white/10 rounded-lg text-green-200 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
  
      {/* Value Proposition */}
      <div className="bg-lime-400/20 border border-lime-400 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-lime-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-green-950" />
          </div>
          <div>
            <p className="text-white font-bold text-sm mb-1">Why Upgrade to VIP?</p>
            <ul className="space-y-1.5 text-xs text-green-200">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                <span>Complete up to <strong className="text-white">15 tasks daily</strong> (vs 1 task)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                <span>Earn <strong className="text-white">3-15× more per day</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                <span><strong className="text-white">Priority support</strong> & faster withdrawals</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                <span>Access to <strong className="text-white">premium high-paying tasks</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  
      {/* VIP Tiers */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-green-200 mb-3 uppercase tracking-wide">Choose Your Plan</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(VIP_CONFIG).map(([tier, config]) => {
            const isSelected = selectedVIP === tier;
            const isRecommended = tier === 'Silver';
  
            return (
              <label
                key={tier}
                className={`relative cursor-pointer rounded-xl border-2 p-3.5 text-center transition-all ${
                  isSelected 
                    ? 'border-lime-400 bg-lime-400/10 shadow-lg shadow-lime-400/20' 
                    : 'border-white/10 bg-green-900 hover:border-lime-400/50'
                }`}
              >
                {isRecommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-lime-400 text-green-950 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    Best Value
                  </span>
                )}
                
                <input
                  type="radio"
                  name="vipTier"
                  value={tier}
                  checked={isSelected}
                  onChange={(e) => setSelectedVIP(e.target.value)}
                  className="sr-only"
                />
  
                <Crown className={`w-7 h-7 mx-auto mb-2 ${isSelected ? 'text-lime-400' : 'text-green-400'}`} />
                <p className={`font-bold text-xs mb-1 ${isSelected ? 'text-white' : 'text-green-200'}`}>{tier}</p>
                <p className={`text-lg font-black mb-1 ${isSelected ? 'text-lime-400' : 'text-white'}`}>
                  ${config.priceUSD}
                </p>
                <p className="text-[10px] text-green-300">{formatKES(config.priceUSD)}</p>
                <div className="mt-2 pt-2 border-t border-white/10">
                  <p className="text-xs font-semibold text-lime-400">{config.dailyTasks} Tasks/Day</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
  
      {/* Payment Confirmation */}
      {selectedVIP && (
        <div className="bg-green-900 border-2 border-lime-400 rounded-lg p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-green-200">Your Investment</span>
            <span className="text-xs bg-lime-400/20 text-lime-400 px-2 py-1 rounded font-semibold">
              {selectedVIP} VIP
            </span>
          </div>
          <p className="text-3xl font-black text-lime-400 mb-1">
            {formatKES(VIP_CONFIG[selectedVIP].priceUSD)}
          </p>
          <p className="text-xs text-green-200">
            ≈ ${VIP_CONFIG[selectedVIP].priceUSD} USD • Unlock {VIP_CONFIG[selectedVIP].dailyTasks} tasks daily
          </p>
        </div>
      )}
  
      {/* M-Pesa Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-green-200 mb-2">
            M-Pesa Number
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
            <input
              type="tel"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
              placeholder="0712345678 or 0112345678"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-green-900 border-2 border-white/10 text-white placeholder-green-400 focus:border-lime-400 focus:outline-none transition"
            />
          </div>
          <p className="text-xs text-green-300 mt-1.5">Enter your Safaricom number to receive payment prompt</p>
        </div>
  
        {/* Action Button */}
        <button
          onClick={handleRealVIPUpgrade}
          disabled={isProcessing || !selectedVIP || !isValidMpesaNumber(mpesaNumber)}
          className={`w-full py-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            selectedVIP && isValidMpesaNumber(mpesaNumber)
              ? 'bg-lime-400 hover:bg-lime-500 text-green-950 shadow-lg hover:shadow-xl hover:shadow-lime-400/20 active:scale-[0.98]'
              : 'bg-white/10 text-green-400 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-green-950 border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Smartphone className="w-5 h-5" />
              {selectedVIP ? `Upgrade to ${selectedVIP} VIP` : 'Select a Plan to Continue'}
            </>
          )}
        </button>
  
        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-4 text-xs text-green-300">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-lime-400" />
            <span>Instant Activation</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

      {/* STRATEGIC Eligibility Modal - Shows 3 first, then reveals final 2 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-green-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-lime-400/30">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-xl font-bold text-white">Withdrawal Requirements</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-green-800 rounded-lg">
                <X className="w-5 h-5 text-green-300" />
              </button>
            </div>
            <div className="bg-gradient-to-r from-lime-400/20 to-emerald-400/20 border border-lime-400/50 rounded-lg p-4 mb-5">
              <p className="text-sm font-medium text-lime-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                Withdrawal Status: <span className="font-bold text-lime-400">
                  {allRequirementsMet ? 'UNLOCKED ✓' : basicRequirementsMet ? 'One More Step!' : 'Getting Started'}
                </span>
              </p>
            </div>
            {!basicRequirementsMet && (
              <p className="text-sm text-green-300 mb-5">
                Complete these 3 simple steps to unlock withdrawals. You're making great progress!
              </p>
            )}
            {basicRequirementsMet && !allRequirementsMet && (
              <div className="bg-emerald-600/30 border border-emerald-500 rounded-lg p-4 mb-5">
                <p className="text-sm font-semibold text-emerald-300 flex items-center gap-2">
                  <PartyPopper className="w-4 h-4 text-emerald-400" />
                  Amazing! Basic requirements complete!
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  One final step to unlock instant withdrawals...
                </p>
              </div>
            )}
            <div className="space-y-4">
              {/* Always show first 3 requirements */}
              {/* 1. Identity Verification */}
              <div className="flex items-start gap-3">
                {eligibility.kycComplete ? (
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-lime-400" />
                    Identity Verification
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    {eligibility.kycComplete
                      ? "✓ Verified via onboarding task"
                      : "Complete the onboarding task to verify identity"}
                  </p>
                </div>
              </div>
              {/* 2. Payout Threshold */}
              <div className="flex items-start gap-3">
                {eligibility.minAmount ? (
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-lime-400" />
                    Minimum Balance
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    {eligibility.minAmount
                      ? `✓ You have enough balance`
                      : `Need ${(MIN_WITHDRAWAL_USD / (1 - FEE_PERCENTAGE / 100)).toFixed(2)} to receive $${MIN_WITHDRAWAL_USD} after fee`}
                  </p>
                </div>
              </div>
              {/* 3. Task Completion */}
              <div className="flex items-start gap-3">
                {eligibility.minTasks ? (
                  <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-lime-400" />
                    Task Completion
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    {eligibility.minTasks
                      ? `✓ You've completed ${profile?.ApprovedTasks || 0} tasks`
                      : `Complete at least ${MIN_COMPLETED_TASKS} tasks • (${profile?.ApprovedTasks || 0}/${MIN_COMPLETED_TASKS})`}
                  </p>
                  {!eligibility.minTasks && (
                    <div className="mt-2 bg-green-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-lime-400 transition-all duration-500"
                        style={{ width: `${Math.min(100, ((profile?.ApprovedTasks || 0) / MIN_COMPLETED_TASKS) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
              {/* ONLY SHOW REFERRAL REQUIREMENTS IF BASIC 3 ARE COMPLETE */}
              {basicRequirementsMet && (
                <>
                  {/* Divider */}
                  <div className="relative py-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-emerald-400"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-green-900 px-4 text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Final Referral Requirements
                        <Sparkles className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                  {/* 4. Total Referrals */}
                  <div className="flex items-start gap-3">
                    {(profile?.totalReferrals || 0) >= REQUIRED_TOTAL_REFERRALS ? (
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-lime-400" />
                        Invite {REQUIRED_TOTAL_REFERRALS} Friends
                      </p>
                      <p className="text-xs text-green-300 mt-1">
                        {(profile?.totalReferrals || 0) >= REQUIRED_TOTAL_REFERRALS
                          ? `✓ Amazing! You invited ${profile.totalReferrals} friends`
                          : `Invite ${REQUIRED_TOTAL_REFERRALS} friends to earn $${REQUIRED_TOTAL_REFERRALS * 5} • (${profile?.totalReferrals || 0}/${REQUIRED_TOTAL_REFERRALS})`}
                      </p>
                      {(profile?.totalReferrals || 0) < REQUIRED_TOTAL_REFERRALS && (
                        <div className="mt-2 bg-green-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-lime-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, ((profile?.totalReferrals || 0) / REQUIRED_TOTAL_REFERRALS) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* 5. VIP Referrals */}
                  <div className="flex items-start gap-3">
                    {(profile?.vipReferrals || 0) >= REQUIRED_VIP_REFERRALS ? (
                      <Check className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-white flex items-center gap-2">
                        <Crown className="w-4 h-4 text-emerald-400" />
                        {REQUIRED_VIP_REFERRALS} Friends Upgrade to VIP
                      </p>
                      <p className="text-xs text-green-300 mt-1">
                        {(profile?.vipReferrals || 0) >= REQUIRED_VIP_REFERRALS
                          ? `✓ Elite status! ${profile.vipReferrals} friends went VIP`
                          : `Earn $${REQUIRED_VIP_REFERRALS * 10} extra when ${REQUIRED_VIP_REFERRALS} friends upgrade • (${profile?.vipReferrals || 0}/${REQUIRED_VIP_REFERRALS})`}
                      </p>
                      {(profile?.vipReferrals || 0) < REQUIRED_VIP_REFERRALS && (
                        <div className="mt-2 bg-green-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, ((profile?.vipReferrals || 0) / REQUIRED_VIP_REFERRALS) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {/* CTA Buttons - Dynamic based on progress */}
            <div className="mt-8 space-y-3">
              {allRequirementsMet ? (
                <div className="text-center bg-gradient-to-r from-emerald-600/30 to-lime-400/30 border-2 border-emerald-500 rounded-xl p-4">
                  <PartyPopper className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-black text-emerald-300">All Requirements Met!</p>
                  <p className="text-sm text-emerald-200">You can now withdraw anytime</p>
                </div>
              ) : basicRequirementsMet ? (
                <p className="text-center text-sm text-green-300 font-medium">
                  You're <strong className="text-emerald-400">75% there!</strong> Just invite friends to unlock withdrawals
                </p>
              ) : (
                <p className="text-center text-sm text-green-300 font-medium">
                  Keep going — you're <strong className="text-lime-400">
                    {[eligibility.kycComplete, eligibility.minAmount, eligibility.minTasks].filter(Boolean).length}/3
                  </strong> complete!
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-green-800 text-green-200 font-bold py-3 rounded-xl hover:bg-green-700 transition"
                >
                  Close
                </button>

                {/* Dynamic CTA Button */}
                {!basicRequirementsMet ? (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setShowVIPModal(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to VIP
                  </button>
                ) : !allRequirementsMet ? (
                  <button
                    onClick={scrollToReferralCard}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-lime-500 text-green-950 font-bold py-3 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Refer Friends
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="min-h-screen bg-green-950 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-green-200 hover:text-lime-400 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header with VIP Upgrade Option */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Withdraw Earnings</h1>
              <p className="text-green-300">Fast, secure payouts — available daily</p>
            </div>

            {!profile?.isVIP && (
              <button
                onClick={() => setShowVIPModal(true)}
                className="bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 font-bold px-6 py-3 rounded-xl hover:shadow-lg transition flex items-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to VIP
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-green-900/80 backdrop-blur rounded-2xl p-6 shadow-xl border border-lime-400/20">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-green-700">
                  <div>
                    <p className="text-sm text-green-300">Available Balance</p>
                    <p className="text-3xl font-black text-lime-400">${balance.toFixed(2)}</p>
                    <p className="text-xs text-green-400">{formatKES(balance)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-lime-400" />
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-green-200 mb-2">
                      Amount (USD) – Min ${MIN_WITHDRAWAL_USD.toFixed(2)} after 2% fee
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-700 rounded-lg focus:border-lime-400 focus:ring focus:ring-lime-400/20 transition bg-green-950/50 text-white placeholder-green-400"
                      placeholder="10.21"
                      min="0.01"
                      max={balance}
                    />
                    {amount && parseFloat(amount) > 0 && (
                      <div className={`mt-3 p-3 rounded-lg text-sm ${
                        receive >= MIN_WITHDRAWAL_USD ? 'bg-emerald-600/30 border-emerald-500' : 'bg-red-600/20 border-red-500/30'
                      } border`}>
                        <div className="flex justify-between">
                          <span className="text-green-300">Amount Entered</span>
                          <span className="font-medium text-white">${parseFloat(amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-400">
                          <span>Fee (2%)</span>
                          <span className="font-medium">-${fee.toFixed(2)}</span>
                        </div>
                        <div className={`flex justify-between font-bold ${
                          receive >= MIN_WITHDRAWAL_USD ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <span>You Receive</span>
                          <span>${receive.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-green-400 mt-1">≈ {formatKES(receive)}</p>
                        {receive < MIN_WITHDRAWAL_USD && (
                          <p className="text-xs text-red-400 mt-2 font-medium">
                            ⚠ Amount after fee must be at least ${MIN_WITHDRAWAL_USD.toFixed(2)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[10.21, 25, 50].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toFixed(2))}
                        disabled={val > balance}
                        className="px-4 py-2 bg-green-800 text-green-200 rounded-lg text-sm font-medium hover:bg-lime-400 hover:text-green-950 disabled:opacity-50 transition"
                      >
                        ${val}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setAmount(balance.toFixed(2))}
                      className="px-4 py-2 bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 rounded-lg text-sm font-bold hover:shadow transition"
                    >
                      Max
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-green-200 mb-3">Method</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'mpesa', label: 'M-Pesa', icon: Smartphone, color: 'emerald' },
                        { id: 'paypal', label: 'PayPal', icon: CreditCard, color: 'lime' },
                        { id: 'bank', label: 'Bank', icon: Building2, color: 'green' },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <label
                            key={opt.id}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${
                              method === opt.id
                                ? `border-${opt.color}-400 bg-${opt.color}-500/20`
                                : 'border-green-700 hover:border-green-600'
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
                            <Icon className={`w-6 h-6 mb-1 ${method === opt.id ? `text-${opt.color}-400` : 'text-green-300'}`} />
                            <span className="text-xs font-medium text-white">{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {method === 'mpesa' && (
                    <div>
                      <label className="block text-xs font-medium text-green-400 mb-1">
                        M-Pesa Number (07xx, +2547xx, etc.)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full px-4 py-3 border-2 border-emerald-400 rounded-lg focus:ring focus:ring-emerald-400/20 bg-green-950/50 text-white placeholder-green-400"
                      />
                    </div>
                  )}
                  {method === 'paypal' && (
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder="you@paypal.com"
                      className="w-full px-4 py-3 border-2 border-lime-400 rounded-lg focus:ring focus:ring-lime-400/20 bg-green-950/50 text-white placeholder-green-400"
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
                          className="w-full px-4 py-3 border-2 border-green-600 rounded-lg focus:ring focus:ring-green-400/20 bg-green-950/50 text-white placeholder-green-400"
                        />
                      ))}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !amount}
                    className="w-full bg-gradient-to-r from-lime-400 to-emerald-500 text-green-950 font-bold py-4 rounded-xl hover:shadow-xl transform hover:scale-[1.02] transition disabled:opacity-50 disabled:transform-none"
                  >
                    {loading ? 'Processing...' : 'Request Withdrawal'}
                  </button>
                </form>
              </div>
            </div>
            {/* Sidebar */}
            <div className="space-y-5">
              {/* User Info Card */}
              <div className="bg-green-900/80 backdrop-blur p-5 rounded-2xl shadow border border-lime-400/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center text-green-950 font-bold">
                    {profile?.name?.[0] ?? <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{profile?.name || 'User'}</p>
                    <p className="text-xs text-green-400">{profile?.tier || 'Standard'}</p>
                  </div>
                </div>
                <div className="text-sm space-y-1 text-green-300">
                  <p>Tasks Completed: <strong>{profile?.ApprovedTasks || 0}</strong></p>
                  <p>Status: <strong className={profile?.isVIP ? 'text-lime-400' : 'text-green-300'}>
                    {profile?.isVIP ? 'VIP Member' : 'Standard'}
                  </strong></p>
                </div>
              </div>
              <div className="bg-green-900/80 backdrop-blur p-5 rounded-2xl shadow border border-lime-400/20">
                <h3 className="font-bold flex items-center gap-2 mb-3 text-white">
                  <Calendar className="w-5 h-5 text-lime-400" /> Payout Schedule
                </h3>
                <div className="text-sm space-y-1 text-green-300">
                  <p>M-Pesa: <strong>Instant</strong></p>
                  <p>PayPal: <strong>24–48 hrs</strong></p>
                  <p>Bank: <strong>2–3 days</strong></p>
                </div>
              </div>
              <div className="bg-lime-400/20 p-5 rounded-2xl border-2 border-lime-400/50">
                <h3 className="font-bold flex items-center gap-2 mb-2 text-lime-300">
                  <AlertCircle className="w-5 h-5 text-lime-400" /> Requirements
                </h3>
                <ul className="text-xs space-y-1 text-lime-200">
                  <li>• Complete <strong>onboarding task</strong></li>
                  <li>• Min <strong>${MIN_WITHDRAWAL_USD.toFixed(2)} after fee</strong></li>
                  <li>• Complete <strong>{MIN_COMPLETED_TASKS} tasks</strong></li>
                  <li>• Available <strong>daily</strong></li>
                </ul>
              </div>
              {/* Referral Earnings Card - WITH ID FOR SCROLLING */}
              <div id="referral-card" className="bg-green-900/80 backdrop-blur p-6 rounded-2xl shadow-xl border border-lime-400/20 transition-all duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-green-700">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                      <Sparkles className="w-6 h-6 text-green-950" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white">Referral Earnings</h3>
                      <p className="text-xs text-green-400">Invite friends & earn real money</p>
                    </div>
                  </div>
                  <span className="text-3xl font-black text-lime-400">
                    ${((profile?.referralEarnings || 0)).toFixed(2)}
                  </span>
                </div>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-green-800/50 rounded-xl p-4 text-center border border-green-600">
                    <p className="text-2xl font-black text-white">
                      {profile?.totalReferrals || 0}
                    </p>
                    <p className="text-xs text-green-400 mt-1">Total Referrals</p>
                  </div>
                  <div className="bg-emerald-500/20 rounded-xl p-4 text-center border border-emerald-400">
                    <p className="text-2xl font-black text-emerald-400">
                      {profile?.vipReferrals || 0}
                    </p>
                    <p className="text-xs text-green-400 mt-1">VIP Referrals</p>
                  </div>
                </div>
                {/* Earnings Info */}
                <div className="bg-lime-400/20 border border-lime-400/50 rounded-xl p-4 mb-5 text-center">
                  <p className="text-sm font-semibold text-lime-300">
                    Earn <span className="font-black">$5</span> per friend •
                    <span className="font-black text-emerald-400"> $15</span> when they go VIP
                  </p>
                </div>
                {/* Recent Referrals - CORRECTLY SHOWS VIP + $15 */}
                {(profile?.recentReferrals && profile.recentReferrals.length > 0) ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-5">
                    {profile.recentReferrals.slice(0, 5).map((ref, i) => {
                      const isVIP = ref.isVIP || ref.vipUpgraded === true;
                      const reward = isVIP ? 15 : 5;
                      return (
                        <div
                          key={i}
                          className={`flex justify-between items-center rounded-lg px-4 py-3 border transition-all ${
                            isVIP
                              ? 'bg-emerald-500/20 border-emerald-400 shadow-sm'
                              : 'bg-green-800/50 border-green-600'
                          }`}
                        >
                          <div className="text-left">
                            <p className="font-semibold text-white text-sm">
                              ***{ref.phone?.slice(-4)}
                            </p>
                            <p className={`text-xs font-medium flex items-center gap-1.5 ${isVIP ? 'text-emerald-300' : 'text-green-400'}`}>
                              {isVIP ? (
                                <>
                                  <Crown className="w-3.5 h-3.5" /> VIP Member
                                </>
                              ) : (
                                'Standard User'
                              )}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`font-black text-lg ${isVIP ? 'text-emerald-400' : 'text-lime-400'}`}>
                              +${reward}
                            </span>
                            {isVIP && (
                              <p className="text-xs text-emerald-400 font-medium">VIP Bonus!</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 mb-5 bg-green-800/50 rounded-xl border border-dashed border-green-600">
                    <Sparkles className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <p className="text-sm font-medium text-green-300">No referrals yet</p>
                    <p className="text-xs text-green-400 mt-1">Invite friends and start earning!</p>
                  </div>
                )}
                {/* Share Button */}
                <button
                  onClick={async () => {
                    const myCode = profile?.referralCode || 'LOADING';
                    const baseUrl = window.location.origin;
                    const referralLink = `${baseUrl}/signup?ref=${myCode}`;
                    const message = `Join Remote Tasks and earn real money training AI!\n\nStart here: ${referralLink}\n\nI'll earn $5 when you sign up — and $15 when you go VIP!`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: 'Earn Money Training AI!',
                          text: 'Join me on Remote Tasks!',
                          url: referralLink,
                        });
                      } catch (err) {}
                    } else {
                      const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`;
                      const choice = window.confirm("Share your link:\n\nOK → WhatsApp\nCancel → Copy Link");
                      if (choice) {
                        window.open(whatsapp, '_blank');
                      } else {
                        navigator.clipboard.writeText(referralLink);
                        toast.success('Referral link copied!', { icon: 'Check' });
                      }
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-green-950 font-bold py-3.5 rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 text-base"
                >
                  <Sparkles className="w-5 h-5" />
                  Invite Friends & Earn $15
                </button>
                {/* Your Personal Link */}
                <div className="mt-4 bg-green-800/50 border border-green-600 rounded-xl p-4">
                  <p className="text-xs font-semibold text-green-300 text-center mb-2">
                    Your Personal Link
                  </p>
                  <div className="flex items-center gap-3 bg-green-950 rounded-lg px-4 py-3 border border-green-700">
                    <span className="flex-1 font-mono text-xs text-green-300 break-all select-all">
                      {window.location.origin}/signup?ref={profile?.referralCode || '...'}
                    </span>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/signup?ref=${profile?.referralCode || ''}`;
                        navigator.clipboard.writeText(link);
                        toast.success('Copied!', { icon: 'Check', autoClose: 2000 });
                      }}
                      className="p-2.5 hover:bg-green-800 rounded-lg transition"
                      title="Copy link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              {/* Recent Withdrawals Section */}
              <div className="bg-green-900/80 backdrop-blur p-5 rounded-2xl shadow border border-lime-400/20">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-white">Recent Withdrawals</h3>
                  <button
                    onClick={refreshWithdrawals}
                    disabled={refreshingWithdrawals}
                    className="p-1 hover:bg-green-800 rounded-lg transition"
                    title="Refresh withdrawals"
                  >
                    <RefreshCw className={`w-4 h-4 text-green-400 ${refreshingWithdrawals ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {withdrawals.length > 0 ? (
                  <div className="space-y-3">
                    {withdrawals.map((w) => (
                      <div key={w.id} className="border-b border-green-700 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <p className="font-bold text-white">${w.amount?.toFixed(2)}</p>
                            <p className="text-xs text-green-400">{formatKES(w.amount)}</p>
                            <p className="text-xs text-green-400 capitalize">
                              {w.method === 'mpesa' && w.phone
                                ? `M-Pesa •••${w.phone?.slice(-4)}`
                                : w.method === 'paypal' && w.paypalEmail
                                ? `PayPal •••@${w.paypalEmail?.split('@')[1]}`
                                : w.method === 'bank' && w.bankDetails
                                ? `Bank •••${w.bankDetails?.accountNumber?.slice(-4)}`
                                : w.method}
                            </p>
                            <p className="text-xs text-green-500 mt-0.5">
                              {w.requestedAt?.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="ml-2">
                            {getStatusIcon(w.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-green-400 text-sm mb-2">No withdrawals yet</p>
                    <p className="text-xs text-green-500">
                      Your withdrawal history will appear here
                    </p>
                    <button
                      onClick={refreshWithdrawals}
                      className="mt-3 text-xs text-lime-400 hover:text-lime-300 font-medium"
                    >
                      Refresh
                    </button>
                  </div>
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