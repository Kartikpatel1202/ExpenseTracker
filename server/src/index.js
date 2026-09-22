import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/db.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { initializeSocket } from "./sockets/socket.js";

dotenv.config();

// Connect Database
connectDB();
const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/expenses", expenseRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is Running 🚀");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully",
  });
});
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
initializeSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
app.use(notFound);
app.use(errorHandler);
