import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tickets, setTickets] = useState([]);
  // Tracks which ticket is currently shown in the detail panel
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data));
  }, []);

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

  // Finds the full ticket object matching whichever id is currently selected
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

  return (
    <div className="app">
      <div className="ticket-list">
        <h1>Ticket Queue</h1>
        <ul>
          {tickets.map((ticket) => (
            <li key={ticket.id} onClick={() => setSelectedId(ticket.id)}>
              <strong>{ticket.subject}</strong>
              <div>
                {ticket.category || "Uncategorized"} — {ticket.urgency || "n/a"}
              </div>
              <div>{ticket.status}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="ticket-detail">
        {selectedTicket ? (
          <>
            <h2>{selectedTicket.subject}</h2>
            <p>
              {selectedTicket.category || "Uncategorized"} —{" "}
              {selectedTicket.urgency || "n/a"}
            </p>
            <p>Assigned to: {selectedTicket.assignedTeam || "Unassigned"}</p>
            <h3>Original Ticket Body</h3>
            <p>{selectedTicket.body}</p>
            <h3>AI Generated Draft Reply</h3>
            <p>{selectedTicket.draftReply}</p>
            {selectedTicket.status === "open" && (
              <button onClick={() => handleApprove(selectedTicket.id)}>
                Approve
              </button>
            )}
          </>
        ) : (
          <p>Select a ticket to view details</p>
        )}
      </div>
    </div>
  );
}

export default App;
