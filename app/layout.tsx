import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
  weight: ["100", "300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "کوییز تلگرام",
  description: "بازی آنلاین اطلاعات عمومی 1v1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-950 text-white overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}

