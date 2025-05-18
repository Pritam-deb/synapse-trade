"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker } from "@/app/utils/httpClients";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";

export const Depth = ({ market }: { market: string }) => {
  const [asks, setAsks] = useState<[string, string][]>();
  const [bids, setBids] = useState<[string, string][]>();
  const [price, setPrice] = useState<string>();
  useEffect(() => {
    getDepth(market).then((data) => {
      console.log("depth", data);
      setAsks(
        data.asks.filter((ask: string[]) => ask.length === 2) as [
          string,
          string
        ][]
      );
      setBids(
        data.bids.filter((bid: string[]) => bid.length === 2) as [
          string,
          string
        ][]
      );
    });
    getTicker(market).then((t) => setPrice(t?.lastPrice));
  }, []);
  return (
    <div className="p-2">
      <TableHeader />
      {asks && <AskTable asks={asks} />}
      {price && <div className="text-white text-xl"> {price}</div>}
      {bids && <BidTable bids={bids} />}
    </div>
  );
};

function TableHeader() {
  return (
    <div className="flex justify-between text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-400">Size</div>
      <div className="text-slate-400">Total</div>
    </div>
  );
}
