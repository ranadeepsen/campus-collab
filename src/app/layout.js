import { Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "Campus Collab",
  description: "Meet Your Campus. Build Your Community.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6337E8',
          colorText: '#17203D',
          colorTextSecondary: '#6B7280',
          borderRadius: '0.75rem',
          fontFamily: 'var(--font-manrope)',
        },
        layout: {
          socialButtonsPlacement: 'top',
        },
        elements: {
          card: "bg-white/95 backdrop-blur-sm shadow-2xl border border-white/40 rounded-[24px] p-0 sm:p-0 w-full max-w-md overflow-hidden",
          headerTitle: "text-2xl font-bold text-[#17203D] mb-2 px-8 pt-8",
          headerSubtitle: "text-gray-500 mb-6 px-8",
          main: "px-8",
          socialButtonsBlockButton: "w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm mb-4 font-semibold text-base",
          formButtonPrimary: "w-full bg-gradient-to-r from-[#5B35E8] to-[#A855F7] text-white py-3 rounded-xl font-bold text-base hover:opacity-90 transition-opacity shadow-md h-[52px] mt-2",
          formFieldInput: "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-[#6337E8]/20 focus:border-[#6337E8] transition-all h-[52px] autofill:shadow-[inset_0_0_0px_1000px_white] autofill:bg-white",
          dividerRow: "my-6",
          footer: "bg-transparent border-t border-gray-100",
          footerAction: "bg-transparent py-4",
          footerPages: "bg-transparent",
          identityPreview: "bg-gray-50 border border-gray-200 rounded-xl",
        }
      }}
      localization={{
        signIn: {
          start: {
            title: "Sign in to Campus Collab",
            subtitle: "Welcome back! Please sign in to continue",
          }
        },
        signUp: {
          start: {
            title: "Sign up for Campus Collab",
            subtitle: "Join your campus community",
          }
        }
      }}
    >
      <html lang="en" className={`${manrope.variable} antialiased`}>
        <body className="min-h-screen flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
