export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 10);
  relevantAsks.reverse();

  const asksWithTotal: [string, string, number][] = [];
  for (const ask of relevantAsks) {
    currentTotal += Number(ask[1]);
    asksWithTotal.push([ask[0], ask[1], currentTotal]);
  }
  const maxTotal = relevantAsks.reduce((acc, ask) => acc + Number(ask[1]), 0);

  return (
    <div>
      {asksWithTotal.map(([price, quantity, total]) => (
        <Ask
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

function Ask({
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
        className="absolute top-0 left-0 h-full bg-red-400/30 transition-all duration-300"
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
