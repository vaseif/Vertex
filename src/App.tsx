/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import JobBoard from './components/JobBoard';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import PaymentNotification from "./components/PaymentNotification";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* الصفحة الرئيسية */}
        <Route path="/" element={
          <div className="min-h-screen bg-background selection:bg-brand selection:text-background">
            <Navbar />
            <main>
              <Hero />
              <JobBoard />
            </main>
            <Footer />
            <PaymentNotification />
          </div>
        } />

        {/* Admin Panel */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}