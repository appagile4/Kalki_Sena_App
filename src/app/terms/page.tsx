import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, BookOpen, ShieldAlert, FileText, HelpCircle } from "lucide-react";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Terms & Conditions | Kalki Sena Drive",
  description:
    "Terms of Service, user agreement, and operational guidelines for Kalki Sena Drive and affiliated mobile services.",
};

export default function TermsAndConditionsPage() {
  const lastUpdated = "November 18, 2026";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Kalki Sena Drive"
              width={160}
              height={44}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0266b3] hover:text-[#031b33] transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Terminal
          </Link>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 flex-1 w-full">
        {/* Document Header Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#031b33] via-[#083358] to-[#02569b] p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <Scale className="h-5 w-5 text-[#38bdf8]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8]">
              Legal Agreement
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-slate-200">
            Last Updated: {lastUpdated} • Applicable to all passengers, drivers, and book purchasers
          </p>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-600 text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <CheckCircle2 className="h-5 w-5 text-[#0266b3]" />
              <h2>1. Agreement to Terms</h2>
            </div>
            <p>
              By downloading, installing, registering, or using the <strong>Kalki Sena Drive</strong> mobile application, superadmin command console, or related services, you agree to be bound by these Terms &amp; Conditions. If you do not agree, please discontinue using our platform immediately.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <FileText className="h-5 w-5 text-[#0266b3]" />
              <h2>2. User Accounts &amp; Security</h2>
            </div>
            <p>
              To access core features including ride dispatch, emergency response, and our bookstore, you must register an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Providing accurate, current, and verifiable contact details (Email, Phone number).</li>
              <li>Safeguarding your password and authentication tokens.</li>
              <li>Promptly notifying us at <code>support@kalkisena.org</code> if you suspect unauthorized access to your account.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <BookOpen className="h-5 w-5 text-[#0266b3]" />
              <h2>3. Book Purchases &amp; E-Book Marketplace</h2>
            </div>
            <p>
              Kalki Sena Drive hosts the exclusive publication <em>&quot;Economic Revolution to make Nepal A World Leader&quot;</em> by Jay Sah (MR. 666):
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Official Price:</strong> All transactions are settled in Nepalese Rupees (NPR 1,000/-) including applicable taxes.
              </li>
              <li>
                <strong>Digital Access:</strong> Upon successful confirmation from our payment gateway, the reader immediately gains verified digital access in the &quot;My Book&quot; section of the mobile application.
              </li>
              <li>
                <strong>Physical Edition &amp; Clinic Pickup:</strong> If the physical format is selected, users may choose an authorized Kalki Clinic branch pickup location (e.g. Baneshwor, Maitighar, Putalisadak, or Jawalakhel) with a verified digital receipt.
              </li>
              <li>
                <strong>Intellectual Property:</strong> All text, artwork, and chapters remain the exclusive intellectual property of the author and publisher. Re-distribution, unauthorized copying, or resale is strictly prohibited.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <Scale className="h-5 w-5 text-[#0266b3]" />
              <h2>4. Payment Gateway Terms (eSewa)</h2>
            </div>
            <p>
              Online payments are powered by official <strong>eSewa Native and Web Gateway</strong> integrations:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Every transaction is verified server-side with eSewa servers before order fulfillment.</li>
              <li>If a transaction fails or is cancelled in eSewa, the pending order remains inactive until a successful payment confirmation is recorded.</li>
              <li>Chargebacks and disputed transactions are subject to eSewa standard merchant terms and the consumer protection laws of Nepal.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <AlertTriangle className="h-5 w-5 text-[#0266b3]" />
              <h2>5. Ride-Hailing &amp; Emergency SOS Transport</h2>
            </div>
            <p>
              Kalki Sena connects passengers with independent licensed drivers and medical emergency responders:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Drivers must hold valid licenses, pass background and vehicle KYC verification, and comply with safety regulations.</li>
              <li>SOS Emergency response requests are prioritized to connect with the closest available medical support branch.</li>
              <li>Kalki Sena is a technology platform connecting users with transport and clinic facilities; users must exercise ordinary caution and obey local traffic and transport regulations.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <ShieldAlert className="h-5 w-5 text-[#0266b3]" />
              <h2>6. Prohibited Conduct</h2>
            </div>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Use the application for illegal purposes, fraudulent transactions, or payment spoofing.</li>
              <li>Attempt to decompile, reverse-engineer, or compromise the server APIs or superadmin command panel.</li>
              <li>Harass, abuse, or engage in disruptive behavior with drivers, healthcare partners, or administrators.</li>
              <li>Submit false SOS emergency medical requests.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <HelpCircle className="h-5 w-5 text-[#0266b3]" />
              <h2>7. Limitation of Liability</h2>
            </div>
            <p>
              To the maximum extent permitted by applicable law, Kalki Sena Drive and its affiliates shall not be liable for indirect, incidental, punitive, or consequential damages resulting from platform downtime, third-party network outages, or road conditions beyond our reasonable control.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
              8. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These terms are governed by and construed in accordance with the laws of Nepal. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the competent courts in Kathmandu, Nepal.
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs sm:text-sm space-y-1">
              <p><strong>Questions about our Terms?</strong></p>
              <p>Contact: <a href="mailto:support@kalkisena.org" className="text-[#0266b3] underline">support@kalkisena.org</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
