import { NextRequest, NextResponse } from "next/server";
import { handleChatService } from "@/lib/backend-db";

const MAX_MESSAGE_LEN = 500;
const MAX_HISTORY_LEN = 20;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawMessage = body.message || (body.messages && body.messages[body.messages.length - 1]?.content) || "";
    const message = typeof rawMessage === "string" ? rawMessage.trim().slice(0, MAX_MESSAGE_LEN) : "";
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim().slice(0, 100) : "session_" + Date.now();

    const rawHistory = body.history || body.messages || [];
    const history = Array.isArray(rawHistory)
      ? rawHistory.slice(-MAX_HISTORY_LEN).map((h: Record<string, unknown>) => ({
          role: typeof h.role === "string" ? h.role : "user",
          content: typeof h.content === "string" ? h.content.slice(0, MAX_MESSAGE_LEN) : "",
        }))
      : [];

    const advisorState = body.advisorState && typeof body.advisorState === "object" ? body.advisorState : {};

    const result = await handleChatService({ message, sessionId, history, advisorState });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur POST /api/chat:", error);
    return NextResponse.json({
      reply: "Désolé, je rencontre une petite difficulté technique. Comment puis-je vous aider ?",
      criteria: {},
      vehicles: [],
      quickReplies: ["SUV moins de 250 000 DH", "Citadine hybride", "Voitures d'occasion"],
      intent: "search",
      advisorState: { progress: 0 }
    });
  }
}
