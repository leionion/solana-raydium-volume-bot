import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";

// Configuration Settings from config file, .env file
import { PORT } from "./config/config";

// Mutex for API Rate limit protection functionality
import { Mutex } from "async-mutex";

// Swagger UI implementation
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

// API endpoint Routers
import DifferentAmountRouter from "./routes/AirdropRoute/different-amount.route";
import RedeemRunestoneFeeRouter from "./routes/SubRoute/runestone-fee.route";
import SameAmountRouter from "./routes/AirdropRoute/same-amount.route";
import EstimateDifferentAmountRouter from "./routes/EstimateRoute/different-amount-estimate.route";
import EstimateSameAmountRouter from "./routes/EstimateRoute/same-amount-estimate.route";
import LargeDifferentAmountRouter from "./routes/AirdropRoute/large-different-amount.route";
import DifferentAmountAirdropRouter from "./routes/AirdropRoute/large-different-amount-airdrop.route";
import RBFRouter from "./routes/RbfRouer/RBFRouter";

// Mutex Variable setting for API Rate Limit functionality
export const flagMutex = new Mutex();
export const iterator = new Mutex();

// Load environment variables from .env file
dotenv.config();

// Initialize Swgger UI
let swaggerDocument: any = YAML.load("swagger.yaml");

// Create an instance of the Express application
const app = express();

// Set up Cross-Origin Resource Sharing (CORS) options
app.use(cors());

// Parse incoming JSON requests using body-parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const server = http.createServer(app);

// Define a route to check if the backend server is running
app.get("/", async (req: any, res: any) => {
  res.send("Rune Airdrop Backend is Running now!");
});

// Define routes for different API endpoints
app.use("/api", RedeemRunestoneFeeRouter);
app.use("/api", SameAmountRouter);
app.use("/api", DifferentAmountRouter);
app.use("/api", LargeDifferentAmountRouter)
app.use("/api", DifferentAmountAirdropRouter)

// Define routes for estimate airdrop transaction fee
app.use("/api/estimate", EstimateSameAmountRouter);
app.use("/api/estimate", EstimateDifferentAmountRouter);

// RBF
app.use("/api/rbf", RBFRouter)

// Swagger endpoint Settings
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true })
);

// Set Global Variable Iterator for Wallet management
app.locals.walletIndex = 0;

// Set Global Variable Iterator for unisat api distribution
app.locals.iterator = 0;

// Start the Express server to listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
