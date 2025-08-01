import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function UserDashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <Header />
      <main className="flex-grow bg-blue-50 text-blue-900">
        <section className="max-w-7xl mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">User Dashboard</h2>
          <p className="text-lg text-center">
            Welcome, {currentUser?.email}! This is your user dashboard for browsing and applying to tasks.
          </p>
          {/* Add task listing, profile, etc. here */}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default UserDashboard;