"use client";
import { useState } from "react";

export function SwapUI({ market }: { market: string }) {
  const [amount, setAmount] = useState("");
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("limit");

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-row h-[60px]">
          <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
          <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-3">
            <div className="flex flex-row flex-0 gap-5 undefined">
              <LimitButton type={type} setType={setType} />
              <MarketButton type={type} setType={setType} />
            </div>
          </div>
          <div className="flex flex-col px-3">
            {type === "limit" ? (
              <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                {/* Available Balance */}
                <div className="flex items-center justify-between flex-row">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Balance
                  </p>
                  <p className="font-medium text-xs text-baseTextHighEmphasis">
                    0 USDC
                  </p>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Price
                  </p>
                  <div className="relative">
                    <input
                      step="0.01"
                      placeholder="0"
                      className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-left text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <div className="absolute right-1 top-1 p-2">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Quantity
                  </p>
                  <div className="relative">
                    <input
                      step="0.01"
                      placeholder="0"
                      className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-left text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      defaultValue="0"
                    />
                    <div className="absolute right-1 top-1 p-2">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex justify-between items-center">
                  <p className="text-xs">0</p>
                  <div className="flex-1 mx-2">
                    <input type="range" className="w-full" />
                  </div>
                  <p className="text-xs">100%</p>
                </div>

                {/* Order Value */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Order Value
                  </p>
                  <div className="relative">
                    <input
                      className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-left text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      defaultValue="0"
                    />
                    <div className="absolute right-1 top-1 p-2">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                </div>

                {/* Buy/Sell button will follow below */}
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
                {/* Available Balance */}
                <div className="flex items-center justify-between flex-row">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Balance
                  </p>
                  <p className="font-medium text-xs text-baseTextHighEmphasis">
                    0 USDC
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Quantity
                  </p>
                  <div className="relative">
                    <input
                      step="0.01"
                      placeholder="0"
                      className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-left text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      value="0"
                    />
                    <div className="absolute right-1 top-1 p-2">
                      {/* Icon placeholder */}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <p className="text-xs text-baseTextMedEmphasis">
                      ≈ 0.00 USDC
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex justify-between items-center">
                  <p className="text-xs">0</p>
                  <div className="flex-1 mx-2">
                    <input type="range" className="w-full" />
                  </div>
                  <p className="text-xs">100%</p>
                </div>

                {/* Max Slippage */}
                <div className="flex justify-between items-center">
                  <p className="text-xs font-normal text-baseTextMedEmphasis">
                    Max Slippage
                  </p>
                  <p className="text-xs text-accentBlue cursor-pointer">
                    Enable
                  </p>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className={`font-semibold focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 active:scale-98 ${
              activeTab === "buy"
                ? "bg-green-500 text-green-950"
                : "bg-red-500 text-red-950"
            }`}
            data-rac=""
          >
            {activeTab === "buy" ? "Buy" : "Sell"}
          </button>
          <div className="flex justify-between flex-row mt-1">
            <div className="flex flex-row gap-2">
              {type === "limit" && (
                <>
                  <div className="flex items-center">
                    <input
                      className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5"
                      id="postOnly"
                      type="checkbox"
                      data-rac=""
                    />
                    <label className="ml-2 text-xs">Post Only</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5"
                      id="ioc"
                      type="checkbox"
                      data-rac=""
                    />
                    <label className="ml-2 text-xs">IOC</label>
                  </div>
                </>
              )}

              <div className="flex items-center">
                <input
                  className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5"
                  id="margin"
                  type="checkbox"
                  data-rac=""
                />
                <label className="ml-2 text-xs">Margin</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("limit")}
    >
      <div
        className={`text-sm font-medium py-1 border-b-2 ${
          type === "limit"
            ? "border-accentBlue text-baseTextHighEmphasis"
            : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"
        }`}
      >
        Limit
      </div>
    </div>
  );
}

function MarketButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("market")}
    >
      <div
        className={`text-sm font-medium py-1 border-b-2 ${
          type === "market"
            ? "border-accentBlue text-baseTextHighEmphasis"
            : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"
        } `}
      >
        Market
      </div>
    </div>
  );
}

function BuyButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  const isActive = activeTab === "buy";
  return (
    <div
      className={`flex flex-1 justify-center items-center cursor-pointer px-4 py-2 rounded-full ${
        isActive ? "bg-[#1f2623]" : ""
      }`}
      onClick={() => setActiveTab("buy")}
    >
      <p
        className={`text-sm font-medium ${
          isActive ? "text-[#6aff95]" : "text-baseTextMedEmphasis"
        }`}
      >
        Buy
      </p>
    </div>
  );
}

function SellButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  const isActive = activeTab === "sell";
  return (
    <div
      className={`flex flex-1 justify-center items-center cursor-pointer px-4 py-2 rounded-full ${
        isActive ? "bg-[#2e1f1f]" : ""
      }`}
      onClick={() => setActiveTab("sell")}
    >
      <p
        className={`text-sm font-medium ${
          isActive ? "text-[#ff6a6a]" : "text-baseTextMedEmphasis"
        }`}
      >
        Sell
      </p>
    </div>
  );
}
