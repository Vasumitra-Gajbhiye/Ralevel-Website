import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Certificates | r/alevel",
  description: "World's Largest A-Level Community",
  // keywords:
  // "alevel, a-level, a level, alevel community, a-level community, cambridge, edexcel",

  openGraph: {
    images: ["https://r-alevel.netlify.app/opengraph-image.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    
      <main>
        {children}
      </main>
  );
}
