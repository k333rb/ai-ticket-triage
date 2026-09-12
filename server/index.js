// Minimal Express server, sample backend for the ticket triage project
const express = require("express");
const app = express();

// Prisma client, generated from our schema, this is how we talk to the database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Lets Express parse incoming JSON request bodies automatically
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Liveness check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Creates a new ticket, storing it in the database
app.post("/tickets", async (req, res) => {
  const { subject, body } = req.body;

  // A ticket without a subject or body isn't valid, reject it early
  if (!subject || !body) {
    return res.status(400).json({ error: "subject and body are required" });
  }

  const ticket = await prisma.ticket.create({
    data: { subject, body },
  });

  res.status(201).json(ticket);
});

// Retrieves a single ticket by its id
app.get("/tickets/:id", async (req, res) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!ticket) {
    return res.status(404).json({ error: "ticket not found" });
  }

  res.json(ticket);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
