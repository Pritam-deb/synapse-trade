import express from "express";
import cors from "cors";
import { depthRouter } from "./routes/depth";
import { orderRouter } from "./routes/order";
import { userRouter } from "./routes/user";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/depth", depthRouter);
app.use("/order", orderRouter);
app.use("/user", userRouter)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});