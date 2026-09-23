import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsent } from "@/components/cookie-consent";

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-display",
    display: "swap",
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-body",
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Studio Command Center – Fitness Studio Management",
        template: "%s | Studio Command Center",
    },
    description: "Die Management-Plattform für Fitness Studios. Inventar, Maschinen, Team, Kursplanung und Finanzen – zentralisiert und übersichtlich.",
    keywords: ["Fitness Studio", "Studio Management", "Inventar", "Maschinen Wartung", "Team Management", "Kursplanung", "Studio Command Center", "Mokka Agentur"],
    authors: [{ name: "Mokka Agentur GbR", url: "https://mokka-agentur.de" }],
    creator: "Mokka Agentur GbR",
    publisher: "Mokka Agentur GbR",
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://studio-command-center.de"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        type: "website",
        locale: "de_DE",
        siteName: "Studio Command Center",
        title: "Studio Command Center – Fitness Studio Management",
        description: "Die Management-Plattform für Fitness Studios. Inventar, Maschinen, Team, Kursplanung und Finanzen – zentralisiert und übersichtlich.",
    },
    twitter: {
        card: "summary_large_image",
        title: "Studio Command Center – Fitness Studio Management",
        description: "Die Management-Plattform für Fitness Studios. Inventar, Maschinen, Team, Kursplanung und Finanzen – zentralisiert und übersichtlich.",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de" className="dark" suppressHydrationWarning>
            <head>
                {/* eslint-disable-next-line @next/next/no-page-custom-font */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-body antialiased`}>
                <ThemeProvider defaultTheme="dark">
                    {children}
                    <Toaster richColors position="top-right" />
                    <CookieConsent />
                </ThemeProvider>
                <Script
                    src="https://rybbit.mokka-dev.de/api/script.js"
                    data-site-id="8b218b459764"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    )
}
