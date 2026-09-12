const { routeTicket } = require("./route");

// Confirms each known category maps to the correct team
test("routes billing category to Billing Team", () => {
  expect(routeTicket("billing")).toBe("Billing Team");
});

test("routes technical category to Technical Support", () => {
  expect(routeTicket("technical")).toBe("Technical Support");
});

// Confirms an unrecognized category safely falls back, rather than crashing
test("falls back to General Support for unknown category", () => {
  expect(routeTicket("something-unexpected")).toBe("General Support");
});
