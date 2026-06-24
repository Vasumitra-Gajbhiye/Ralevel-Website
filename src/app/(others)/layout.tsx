import ContactUs from "@/components/site/ContactUs";
import Navigation from "@/components/site/Navigation";
import "../globals.css";

export const metadata = {
  title: "r/alevel ",
  description:
    "Free A Level notes, past papers, and resources by top students from r/alevel. Study smarter with community-made materials and discussion groups.",
  metadataBase: new URL("https://ralevel.com"),
  openGraph: {
    title: "r/alevel - Notes & Past Papers",
    description:
      "Join 100k+ students sharing free A Level notes, past papers, and advice. For Students. By Students.",
    url: "https://ralevel.com",
    siteName: "r/alevel",
    images: ["/opengraph-image-2.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "r/alevel - Notes, Past Papers & Resources",
    description: "By Students. For Students.",
    images: ["/opengraph-image-2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="tracking-widest pt-5">
      <Navigation />
      <div className="pt-11 min-h-screen">{children}</div>
      <ContactUs />
    </main>
  );
}
