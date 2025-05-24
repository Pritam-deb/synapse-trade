"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker, getTrades } from "@/app/utils/httpClients";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";
import { SignalingManager } from "@/app/utils/signallingManager";

export const Depth = ({ market }: { market: string }) => {
  const [asks, setAsks] = useState<[string, string][]>();
  const [bids, setBids] = useState<[string, string][]>();
  const [price, setPrice] = useState<string>();
  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        console.log("depth has been updated");
        console.log(data);

        setBids((originalBids) => {
          // Create a new Map from the current bids array for efficient updates
          const bidsMap = new Map<string, string>(originalBids || []);

          if (data.bids) { // Ensure data.bids exists
            data.bids.forEach(([price, quantity]) => {
              if (Number(quantity) === 0) {
                // If quantity is "0", remove the price level
                bidsMap.delete(price);
              } else {
                // Otherwise, add or update the price level
                bidsMap.set(price, quantity);
              }
            });
          }

          // Convert the Map back to an array and sort it
          // Bids are sorted in descending order of price
          const updatedBidsArray: [string, string][] = Array.from(bidsMap.entries());
          updatedBidsArray.sort((a, b) => Number(b[0]) - Number(a[0])); // Sort descending by price

          return updatedBidsArray;
        });


        setAsks((originalAsks) => {
          // Create a new Map from the current asks array for efficient updates
          const asksMap = new Map<string, string>(originalAsks || []);

          if (data.asks) { // Ensure data.asks exists
            data.asks.forEach(([price, quantity]) => {
              if (Number(quantity) === 0) {
                // If quantity is "0", remove the price level
                asksMap.delete(price);
              } else {
                // Otherwise, add or update the price level
                asksMap.set(price, quantity);
              }
            });
          }

          // Convert the Map back to an array and sort it
          // Asks are sorted in ascending order of price
          const updatedAsksArray: [string, string][] = Array.from(asksMap.entries());
          updatedAsksArray.sort((a, b) => Number(a[0]) - Number(b[0])); // Sort ascending by price

          return updatedAsksArray;
        });
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth@${market}`],
    });

    getDepth(market).then((d) => {
      setAsks(
        d.asks.filter((ask: string[]) => ask.length === 2) as [string, string][]
      );
      setBids(
        d.bids.filter((bid: string[]) => bid.length === 2) as [string, string][]
      );
    });

    getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => setPrice(t[0].price));

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth@${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
    };
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
