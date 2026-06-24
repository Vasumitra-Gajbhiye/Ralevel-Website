export const metadata = {
  title: "Resource Hub | r/alevel",
  description:
    "Free, open source notes, past papers, study guides and worksheets from r/alevel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
