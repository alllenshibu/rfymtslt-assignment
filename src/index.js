const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();

const port = process.env.PORT || 80;

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

// Configure body-parser to accept very large files
// Without this, larger csv uploads will fail
app.use(
  bodyParser.json({
    limit: "100mb",
  })
);

app.get("/", (req, res) => {
  return res.send("Mathongo API");
});

app.get("/health", (req, res) => {
  try {
    return res.status(200).json({
      resource: "Mathongo API",
      uptime: process.uptime(),
      responseTime: process.hrtime(),
      message: "OK",
      timestamp: Date.now(),
    });
  } catch (error) {
    return res.status(500).json({ error: err.message });
  }
});

const router = require("./routes");

app.use("/", router);

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
