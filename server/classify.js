// Loads variables from .env into process.env, quiet suppresses dotenv's own promotional output
require("dotenv").config({ quiet: true });

// Handles sending a ticket to Gemini and getting back a category and urgency
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function classifyTicket(subject, body) {
  // Flash is Gemini's fastest, cheapest model, more than enough for a short classification task
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `
You are classifying a support ticket. Read the subject and body, then respond with ONLY two lines, nothing else:

category: one of [technical, billing, account, general]
urgency: one of [low, medium, high]

Subject: ${subject}
Body: ${body}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Pulls the category and urgency out of the AI's plain text reply
  const categoryMatch = text.match(/category:\s*(\w+)/i);
  const urgencyMatch = text.match(/urgency:\s*(\w+)/i);

  return {
    category: categoryMatch ? categoryMatch[1].toLowerCase() : "general",
    urgency: urgencyMatch ? urgencyMatch[1].toLowerCase() : "low",
  };
}

module.exports = { classifyTicket };
