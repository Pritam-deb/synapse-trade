import express from "express";
import cors from "cors";
import { depthRouter } from "./routes/depth";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

app.use("/depth", depthRouter);


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});