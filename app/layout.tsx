import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Resume Builder - Create Professional Resumes in Minutes",
  description: "Build your professional resume with our easy-to-use, modern resume builder. Create, customize, and download your resume in minutes.",
  keywords: "resume builder, cv maker, professional resume, job application, career tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        {children}
      </body>
    </html>
  );
}
