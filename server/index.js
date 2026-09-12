// Minimal Express server, sample backend for the ticket triage project
const express = require("express");
const app = express();

// Lets Express parse incoming JSON request bodies automatically
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Liveness check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
