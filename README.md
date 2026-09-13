# AI Ticket Triage

A support ticket dashboard that reads incoming tickets, figures out what
they're about, decides how urgent they are, and drafts a first reply, all
automatically. A human still reviews and approves everything before it
would ever be considered final, nothing is sent without a person checking
it first.

## What it actually does

1. A ticket comes in, with a subject and a body
2. An AI model reads it and decides its category (technical, billing,
   account, or general) and how urgent it is (low, medium, high)
3. Based on the category, the ticket is automatically assigned to the
   right team
4. The AI also drafts a suggested reply
5. Everything shows up on a dashboard, where a human can read the
   original ticket, edit the draft reply if needed, and approve it

## Why a human always reviews first

The AI is genuinely good at reading a ticket and figuring out what it's
about, but it can misjudge tone, get details wrong, or misunderstand an
edge case. Letting a draft go out completely unreviewed is a real risk,
so this project deliberately never auto sends anything. The AI's job is
to make the first draft, not the final decision.

## Tech stack

- Backend: Node.js, Express
- Database: SQLite, via Prisma
- AI: Google Gemini API
- Frontend: React, built with Vite, styled with Tailwind CSS
- Testing: Jest, with the AI calls mocked so tests never hit the real
  API or use real quota

## Project structure

    ai-ticket-triage/
      server/     backend API, database, AI integration
      client/     React dashboard

## Running it locally

**Backend**

    cd server
    npm install
    npx prisma migrate dev
    node index.js

You'll need a free Gemini API key from https://aistudio.google.com/apikey,
placed in `server/.env` as:

    GEMINI_API_KEY=your-key-here

**Frontend**

    cd client
    npm install
    npm run dev

## Running the tests

    cd server
    npm test

Tests cover the routing logic and the AI classification logic. The AI
calls are mocked, so running tests doesn't use any real API quota.

## Continuous integration

Every push to main automatically runs the backend tests and confirms
the frontend builds successfully, using GitHub Actions. A broken commit
is caught immediately, not discovered later.

## API endpoints

| Method | Path                 | What it does                                             |
| ------ | -------------------- | -------------------------------------------------------- |
| GET    | /health              | Confirms the server is running                           |
| POST   | /tickets             | Creates a ticket, classifies and routes it automatically |
| GET    | /tickets             | Lists every ticket                                       |
| GET    | /tickets/:id         | Gets one ticket by id                                    |
| PATCH  | /tickets/:id/draft   | Updates a ticket's draft reply                           |
| PATCH  | /tickets/:id/approve | Marks a ticket as approved                               |

## A note on the data

Tickets are stored in a local SQLite file. This is intentional for a
project this size, not a shortcut, a production version handling real
customer data would use a proper hosted database.
