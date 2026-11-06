import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StoreProvider from "../redux/StoreProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Superadmin Terminal | Kalki Sena Command Center",
  description: "Restricted Level-5 Command Console & Administrative Management Portal",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof document !== 'undefined' && document.documentElement) {
                    document.documentElement.removeAttribute('crxemulator');
                    document.documentElement.removeAttribute('crxemulator-bridged');
                    var origSetAttr = Element.prototype.setAttribute;
                    Element.prototype.setAttribute = function(name, val) {
                      if (name === 'crxemulator' || name === 'crxemulator-bridged') return;
                      return origSetAttr.apply(this, arguments);
                    };
                    if (typeof MutationObserver !== 'undefined') {
                      var observer = new MutationObserver(function(mutations) {
                        for (var i = 0; i < mutations.length; i++) {
                          var attr = mutations[i].attributeName;
                          if (attr === 'crxemulator' || attr === 'crxemulator-bridged') {
                            document.documentElement.removeAttribute(attr);
                          }
                        }
                      });
                      observer.observe(document.documentElement, { attributes: true });
                    }
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
