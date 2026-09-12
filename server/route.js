// Maps a ticket's category to the team responsible for handling it
function routeTicket(category) {
  const routingMap = {
    technical: "Technical Support",
    billing: "Billing Team",
    account: "Account Support",
    general: "General Support",
  };

  // Falls back to General Support if the category is missing or unrecognized
  return routingMap[category] || "General Support";
}

module.exports = { routeTicket };
