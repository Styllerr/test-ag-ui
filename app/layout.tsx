import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { CopilotKit, CopilotSidebar } from "@copilotkit/react-core/v2";
import "@copilotkit/react-core/v2/styles.css";

import "./globals.css";

import { Sidebar } from "@/components/SideBar/SideBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AG-UI presentation",
  description: "Test app AG-UI Framework",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CopilotKit runtimeUrl="/api/copilotkit" useSingleEndpoint={false}>
          <header className="flex items-center justify-center h-16">
            <h1 className="flex items-center justify-center m-0">AG-UI presentation</h1>
          </header>
          <div className="h-[calc(100vh-128px)] w-full flex">
            <Sidebar />
            <main className="flex w-full  px-4 bg-white dark:bg-black sm:items-start">
              {children}
            </main>
            <CopilotSidebar />
          </div>
          <footer className="h-16"></footer>
        </CopilotKit>
      </body>
    </html>
  );
}
