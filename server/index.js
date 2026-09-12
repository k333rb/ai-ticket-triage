// Minimal Express server, sample backend for the ticket triage project
const express = require("express");
const app = express();
const cors = require("cors");

// Allows the React dashboard, running on a different port, to fetch from this API
app.use(cors());

// Prisma client, generated from our schema, this is how we talk to the database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { classifyTicket, draftReply } = require("./classify");

const { routeTicket } = require("./route");

// Lets Express parse incoming JSON request bodies automatically
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Liveness check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Creates a new ticket, classifies it, and stores the result
app.post("/tickets", async (req, res) => {
  const { subject, body } = req.body;

  if (!subject || !body) {
    return res.status(400).json({ error: "subject and body are required" });
  }

  // Save the ticket first, so it exists even if classification fails
  const ticket = await prisma.ticket.create({
    data: { subject, body },
  });

  try {
    const { category, urgency } = await classifyTicket(subject, body);
    const assignedTeam = routeTicket(category);
    const draft = await draftReply(subject, body, category);

    // Update the same ticket with the classification results
    const classifiedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: { category, urgency, assignedTeam, draftReply: draft },
    });

    res.status(201).json(classifiedTicket);
  } catch (error) {
    // Classification failed, but the ticket itself was saved successfully,
    // return it as is rather than losing the submission entirely
    console.error("Classification failed:", error.message);
    res.status(201).json(ticket);
  }
});

// Returns every ticket, newest first, this is what the dashboard loads on open
app.get("/tickets", async (req, res) => {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(tickets);
});

// Marks a ticket as reviewed and approved by a human, the only way status changes from "open"
app.patch("/tickets/:id/approve", async (req, res) => {
  const ticket = await prisma.ticket.update({
    where: { id: Number(req.params.id) },
    data: { status: "approved" },
  });
  res.json(ticket);
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
