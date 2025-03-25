import { redirect } from "next/navigation";

export default function Home() {
  const defaultMarket = "SOL_USDC";
  redirect(`/trade/${defaultMarket}`);
}
