import { BOARD_SLUGS, isValidBoardSlug } from "@/lib/boards";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return BOARD_SLUGS.map((board) => ({ board }));
}

export default async function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ board: string }>;
}) {
  const { board } = await params;
  if (!isValidBoardSlug(board)) notFound();
  return children;
}
