"use client";
import { useParams } from "next/navigation";
import { MarketBar } from "@/app/components/MarketBar";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { SwapUI } from "@/app/components/SwapUI";

export default function Page() {
  const { market } = useParams();
  console.log("market in market page is====>", market);
  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-4">
        <MarketBar market={market as string} />
        <div className="flex flex-row h-[620px] border-y border-slate-800">
          <div className="flex flex-col flex-3">
            <TradeView market={market as string} />
          </div>
          <div className="w-[1px] flex-col border-slate-800 border-l"></div>
          <div className="flex flex-col w-[250px] overflow-hidden flex-1">

            <Depth market={market as string} />
          </div>
        </div>
      </div>
      <div className="w-[1px] flex-col border-slate-700 border-l"></div>
      <div className="flex flex-col flex-1 p-4">
        <SwapUI market={market as string}></SwapUI>
      </div>
    </div>
  );
}
