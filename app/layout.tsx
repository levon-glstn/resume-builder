import type { Metadata } from "next";
import { Rubik, Poppins, Roboto, Open_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Load the fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rubik',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: "Resume Builder - Create Professional Resumes in Minutes",
  description: "Build your professional resume with our easy-to-use, modern resume builder. Create and customize your resume with beautiful templates and styling options.",
  keywords: "resume builder, cv maker, professional resume, job application, career tools",
  icons: {
    icon: [
      {
        url: '/images/favicon.ico',
        sizes: 'any',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${rubik.variable} ${roboto.variable} ${openSans.variable}`}>
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <title>Resume Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.1, user-scalable=yes" />
        <meta name="description" content="Create professional resumes in minutes" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
