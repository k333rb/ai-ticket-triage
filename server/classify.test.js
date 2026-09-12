// A shared fake function that stands in for Gemini's real generateContent call,
// created before the mock below so classify.js always references this same one
const mockGenerateContent = jest.fn();

// Replaces the entire Gemini SDK with a fake version, so tests never make real API calls
jest.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

const { classifyTicket } = require("./classify");

// Confirms the code correctly reads category and urgency when Gemini
// responds in the exact format requested
test("extracts category and urgency from a well formatted response", async () => {
  mockGenerateContent.mockResolvedValue({
    response: { text: () => "category: billing\nurgency: high" },
  });

  const result = await classifyTicket("Overcharged", "I was billed twice");

  expect(result.category).toBe("billing");
  expect(result.urgency).toBe("high");
});

// Confirms the fallback logic kicks in safely if Gemini ever responds
// in an unexpected format, rather than crashing the request
test("falls back to safe defaults when the response is unexpected", async () => {
  mockGenerateContent.mockResolvedValue({
    response: { text: () => "I'm not sure how to classify this." },
  });

  const result = await classifyTicket("Vague ticket", "Something is weird");

  expect(result.category).toBe("general");
  expect(result.urgency).toBe("low");
});
