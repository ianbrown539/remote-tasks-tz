import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

function AdminDashboard() {
  const { currentUser } = useAuth();

  return (
    <>
      <main className="flex-grow bg-blue-50 text-blue-900">
        <section className="max-w-7xl mx-auto py-12 px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h2>
          <p className="text-lg text-center">
            Welcome, {currentUser?.email}! This is your admin dashboard for managing tasks and users.
          </p>
          {/* Add task management, user management, etc. here */}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default AdminDashboard;