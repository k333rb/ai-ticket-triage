import { useState, useEffect } from "react";

function App() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data));
  }, []);

  // Sends the approval request, then updates just that one ticket locally
  function handleApprove(id) {
    fetch(`http://localhost:3000/tickets/${id}/approve`, {
      method: "PATCH",
    })
      .then((res) => res.json())
      .then((updatedTicket) => {
        setTickets((prevTickets) =>
          prevTickets.map((ticket) =>
            ticket.id === updatedTicket.id ? updatedTicket : ticket,
          ),
        );
      });
  }

  return (
    <div>
      <h1>AI Ticket Triage Dashboard</h1>
      <ul>
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <strong>{ticket.subject}</strong> — {ticket.category} /{" "}
            {ticket.urgency} — {ticket.status}
            <p>{ticket.draftReply}</p>
            {ticket.status === "open" && (
              <button onClick={() => handleApprove(ticket.id)}>Approve</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
