import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, MapPin, CreditCard } from "lucide-react";
import Footer from "../../components/Footer";

export const metadata = {
  title: "Privacy Policy | Kalki Sena Drive",
  description:
    "Official Privacy Policy and Data Protection standards for Kalki Sena Drive mobile platform and superadmin ecosystem.",
};

export default function PrivacyPolicyPage() {
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
              <Shield className="h-5 w-5 text-[#38bdf8]" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8]">
              Legal & Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-200">
            Last Updated: {lastUpdated} • Effective Date: January 1, 2026
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm leading-relaxed text-slate-600 text-sm sm:text-base">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <FileText className="h-5 w-5 text-[#0266b3]" />
              <h2>1. Introduction</h2>
            </div>
            <p>
              Welcome to <strong>Kalki Sena Drive</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
              We are dedicated to safeguarding your privacy and ensuring the security of your personal information across our mobile application, driver portal, emergency dispatch services, and online platforms.
            </p>
            <p>
              This Privacy Policy explains how we collect, process, store, and share your data when you use the Kalki Sena mobile application and web console, including ride-booking, medical emergency dispatch, and our exclusive e-book marketplace.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <Database className="h-5 w-5 text-[#0266b3]" />
              <h2>2. Information We Collect</h2>
            </div>
            <p>We collect information to provide, maintain, and optimize our community and transport services:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Account Information:</strong> Name, email address, phone number, date of birth, gender, and profile photo when registering.
              </li>
              <li>
                <strong>Location & GPS Data:</strong> Precise GPS coordinates while using ride navigation, tracking nearest medical clinics, dispatching emergency SOS responders, or selecting book pickup clinics.
              </li>
              <li>
                <strong>Driver & KYC Verification:</strong> Government identification, driver&apos;s license, vehicle registration, and background verification records.
              </li>
              <li>
                <strong>Transaction & Payment Records:</strong> Order IDs, amounts, timestamps, and eSewa payment gateway transaction reference codes. <em>(We do not store your private eSewa MPIN or bank passwords).</em>
              </li>
              <li>
                <strong>Device & Network Identifiers:</strong> Operating system version, IP address, device model, push notification tokens, and crash telemetry.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <MapPin className="h-5 w-5 text-[#0266b3]" />
              <h2>3. Location Services & Background Tracking</h2>
            </div>
            <p>
              Our application utilizes real-time foreground and background location services strictly for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Matching passengers with the nearest available drivers and clinics.</li>
              <li>Providing turn-by-turn navigation and live trip progress to passengers.</li>
              <li>Dispatching urgent SOS medical emergency assistance to your exact physical location.</li>
              <li>Estimating distances to designated physical book collection centers.</li>
            </ul>
            <p>
              You can grant or revoke location access at any time via your device settings, although disabling location may restrict active ride dispatch and emergency SOS response features.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <CreditCard className="h-5 w-5 text-[#0266b3]" />
              <h2>4. Payments & Financial Data Protection</h2>
            </div>
            <p>
              All online payments within Kalki Sena Drive (including the official book purchase) are processed via our licensed payment partner, <strong>eSewa (eSewa F1Soft International)</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>All transaction requests are signed using cryptographic HMAC-SHA256 algorithms.</li>
              <li>Independent server-to-server verification confirms payment authenticity directly with eSewa servers before granting digital access or physical collection vouchers.</li>
              <li>We never view, log, or store your credit card numbers, CVVs, or eSewa login credentials.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <Eye className="h-5 w-5 text-[#0266b3]" />
              <h2>5. Sharing of Your Information</h2>
            </div>
            <p>We do not sell, rent, or trade your personal data. We only share information under strict necessity:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>With Drivers & Passengers:</strong> Limited ride coordinates, vehicle information, and first names necessary to fulfill active bookings.
              </li>
              <li>
                <strong>Emergency First Responders:</strong> Location and critical contact details during activated SOS alerts.
              </li>
              <li>
                <strong>Service Partners:</strong> Secure cloud storage (Cloudinary for media assets), eSewa for transaction settlement, and mapping providers.
              </li>
              <li>
                <strong>Legal Requirements:</strong> When mandated by applicable laws, court orders, or law enforcement within Nepal.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <Lock className="h-5 w-5 text-[#0266b3]" />
              <h2>6. Data Security & Storage</h2>
            </div>
            <p>
              Your data is secured using end-to-end industry-standard encryption (TLS/HTTPS), salted bcrypt password hashing, and encrypted JWT authentication tokens. Database clusters are protected by firewalls, automated audits, and role-based access control.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#0f172a]">
              <Shield className="h-5 w-5 text-[#0266b3]" />
              <h2>7. Your Rights & Account Deletion</h2>
            </div>
            <p>
              You maintain full control over your information. You have the right to request access to your stored records, correct inaccurate details, or request permanent account deletion by contacting our privacy officer at{" "}
              <a
                href="mailto:support@kalkisena.org"
                className="text-[#0266b3] font-medium underline"
              >
                support@kalkisena.org
              </a>
              .
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3 border-t border-slate-100 pt-6">
            <h2 className="text-base sm:text-lg font-bold text-[#0f172a]">
              8. Contact Our Privacy Team
            </h2>
            <p>If you have any questions or concerns regarding our privacy practices, please contact us:</p>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 text-xs sm:text-sm space-y-1">
              <p><strong>Kalki Sena Drive Support & Compliance</strong></p>
              <p>Email: <a href="mailto:support@kalkisena.org" className="text-[#0266b3] underline">support@kalkisena.org</a></p>
              <p>Headquarters: Kathmandu, Nepal</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
