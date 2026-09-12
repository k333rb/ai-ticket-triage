import { useState, useEffect } from "react";

function App() {
  // Holds the list of tickets once fetched from the backend
  const [tickets, setTickets] = useState([]);

  // Runs once when the page first loads, fetches the ticket list
  useEffect(() => {
    fetch("http://localhost:3000/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data));
  }, []);

  return (
    <div>
      <h1>AI Ticket Triage Dashboard</h1>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <strong>{ticket.subject}</strong> — {ticket.category} /{" "}
            {ticket.urgency} — {ticket.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
