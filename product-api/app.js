const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const config = require("./config/config");
const logger = require("./middleware/logger");
const sanitizeInput = require("./middleware/sanitize");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// ---- Security ----
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));

// ---- Middleware ----
app.use(express.json());
app.use(sanitizeInput);

// Tests me logs ka shor na ho
if (config.nodeEnv !== "test") {
  app.use(logger);
  app.use(morgan("dev"));
}

// ---- Routes ----
app.get("/", (req, res) => {
  res.send("Hello! Mera pehla Express server chal raha hai 🚀");
});

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// ---- Error handling ----
app.use(notFound);
app.use(errorHandler);

module.exports = app;