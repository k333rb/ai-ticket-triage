import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // Holds the list of tickets fetched from the backend
  const [tickets, setTickets] = useState([]);

  // Tracks which ticket is currently shown in the detail panel
  const [selectedId, setSelectedId] = useState(null);

  // Holds the editable draft text while a ticket is selected
  const [draftText, setDraftText] = useState("");

  // Runs once when the page first loads, fetches every ticket
  useEffect(() => {
    fetch("http://localhost:3000/tickets")
      .then((res) => res.json())
      .then((data) => setTickets(data));
  }, []);

  // Finds the full ticket object matching whichever id is currently selected
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId);

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

  // Saves the edited draft reply back to the server, then updates it locally
  function handleSaveDraft(id) {
    fetch(`http://localhost:3000/tickets/${id}/draft`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draftReply: draftText }),
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
    <div className="app">
      <div className="ticket-list">
        <h1>Ticket Queue</h1>
        <ul>
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              onClick={() => {
                setSelectedId(ticket.id);
                setDraftText(ticket.draftReply || "");
              }}
            >
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
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={8}
              style={{ width: "100%" }}
            />

            {selectedTicket.status === "open" && (
              <div>
                <button onClick={() => handleSaveDraft(selectedTicket.id)}>
                  Save Draft
                </button>
                <button onClick={() => handleApprove(selectedTicket.id)}>
                  Approve
                </button>
              </div>
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
