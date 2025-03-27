export const BidTable = ({ bids }: { bids: [string, string][] }) => {
  let currentTotal = 0;
  const relevantBids = bids.slice(-10);

  relevantBids.reverse();

  const bidsWithTotal: [string, string, number][] = [];
  for (const bid of relevantBids) {
    currentTotal += Number(bid[1]);
    bidsWithTotal.push([bid[0], bid[1], currentTotal]);
  }
  const maxTotal = relevantBids.reduce((acc, bid) => acc + Number(bid[1]), 0);

  return (
    <div>
      {bidsWithTotal.map(([price, quantity, total]) => (
        <Bid
          key={price}
          price={price}
          quantity={quantity}
          total={total}
          maxTotal={maxTotal}
        />
      ))}
    </div>
  );
};

function Bid({
  price,
  quantity,
  total,
  maxTotal,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
}) {
  return (
    <div className="relative flex w-full bg-transparent overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full bg-green-400/30 transition-all duration-300"
        style={{ width: `${(100 * total) / maxTotal}%` }}
      ></div>
      <div className="flex justify-between text-xs w-full p-1">
        <div>{price}</div>
        <div>{quantity}</div>
        <div>{total.toFixed(2)}</div>
      </div>
    </div>
  );
}
