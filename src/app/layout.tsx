import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mini Game Quiz | Thử thách kiến thức 20 ngày",
  description:
    "Tham gia thử thách quiz 20 ngày - trả lời câu hỏi, dự đoán kết quả và giành giải thưởng hấp dẫn mỗi ngày!",
  keywords: ["quiz", "mini game", "trivia", "thử thách", "kiến thức"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="vi"
      className="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
