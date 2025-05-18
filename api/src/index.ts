import express from "express";
import cors from "cors";
import { depthRouter } from "./routes/depth";
import { orderRouter } from "./routes/order";
import { userRouter } from "./routes/user";
import { klineRouter } from "./routes/kline";
import { tradesRouter } from "./routes/trades";
import { tickersRouter } from "./routes/ticker";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/depth", depthRouter);
app.use("/order", orderRouter);
app.use("/user", userRouter)
app.use("/kline", klineRouter)
app.use("/trades", tradesRouter);
app.use("/tickers", tickersRouter);
app.use("/ticker", tickersRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});