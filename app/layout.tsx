import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../src/app/Navbar";

export const metadata: Metadata = {
  title: "AI Career Agent",
  description: "Your personalized AI Job Search Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
