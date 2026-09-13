import { useState, useEffect } from "react";

// Maps a category or urgency value to Tailwind classes for its badge color
function badgeClasses(value) {
  const colors = {
    technical: "bg-violet-100 text-violet-700",
    billing: "bg-blue-100 text-blue-700",
    account: "bg-pink-100 text-pink-700",
    general: "bg-gray-100 text-gray-700",
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-green-100 text-green-700",
  };

  // Falls back to a neutral style if the value doesn't match a known key,
  // covers the legacy ticket with no category or urgency set
  return colors[value] || "bg-gray-100 text-gray-700";
}

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
    <div className="flex h-screen font-sans bg-gray-100">
      {/* Left panel, scrollable list of every ticket */}
      <div className="w-96 border-r border-gray-200 p-6 overflow-y-auto bg-white">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">
          Ticket Queue
        </h1>
        <p className="text-xs text-gray-500 mb-4">
          {tickets.filter((t) => t.status === "open").length} tickets require
          human review before approval.
        </p>

        <ul>
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              onClick={() => {
                setSelectedId(ticket.id);
                setDraftText(ticket.draftReply || "");
              }}
              className="p-4 border-b border-gray-100 cursor-pointer flex flex-col gap-1.5 hover:bg-gray-50"
            >
              <strong className="text-sm text-gray-900">
                {ticket.subject}
              </strong>

              <div className="flex gap-1">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${badgeClasses(ticket.category)}`}
                >
                  {ticket.category || "Uncategorized"}
                </span>
                {ticket.urgency && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${badgeClasses(ticket.urgency)}`}
                  >
                    {ticket.urgency}
                  </span>
                )}
              </div>

              <div className="text-xs text-gray-500">{ticket.status}</div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right panel, full detail of whichever ticket is selected */}
      <div className="flex-1 p-8 overflow-y-auto">
        {selectedTicket ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedTicket.subject}
            </h2>

            <div className="flex gap-1 mb-2">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${badgeClasses(selectedTicket.category)}`}
              >
                {selectedTicket.category || "Uncategorized"}
              </span>
              {selectedTicket.urgency && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${badgeClasses(selectedTicket.urgency)}`}
                >
                  {selectedTicket.urgency}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Assigned to: {selectedTicket.assignedTeam || "Unassigned"}
            </p>

            <h3 className="text-xs font-semibold uppercase text-gray-400 mt-6 mb-2">
              Original Ticket Body
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {selectedTicket.body}
            </p>

            <h3 className="text-xs font-semibold uppercase text-gray-400 mt-6 mb-2">
              AI Generated Draft Reply
            </h3>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-md p-3 text-sm font-sans resize-y"
            />

            {selectedTicket.status === "open" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleSaveDraft(selectedTicket.id)}
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-gray-100 text-gray-900 hover:bg-gray-200"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleApprove(selectedTicket.id)}
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Approve
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-500">Select a ticket to view details</p>
        )}
      </div>
    </div>
  );
}

export default App;
