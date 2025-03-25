"use client";
import { useParams } from "next/navigation";
import { MarketBar } from "@/app/components/MarketBar";

export default function Page() {
  const { market } = useParams();
  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-1">
        <MarketBar market={market as string} />
      </div>
      <div className="w-[1px] flex-col border-slate-700 border-l"></div>
      <div>here will swap ui</div>
    </div>
  );
}
