import { NextRequest, NextResponse } from "next/server";

export interface Lead {
  id: string;
  vehicleId: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  channel: "vehicle_detail" | "chat";
  createdAt: string;
}

const _leads: Lead[] = [];

const MAX_NAME_LEN = 100;
const MAX_PHONE_LEN = 20;
const MAX_EMAIL_LEN = 200;
const MAX_MESSAGE_LEN = 2000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, MAX_NAME_LEN) : "";
    const phone = typeof body.phone === "string" ? body.phone.trim().slice(0, MAX_PHONE_LEN) : "";
    const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_EMAIL_LEN) : undefined;
    const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LEN) : undefined;
    const channel = body.channel === "chat" ? "chat" : "vehicle_detail";

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }
    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name is required (min 2 chars)" }, { status: 400 });
    }
    if (!phone || phone.length < 6) {
      return NextResponse.json({ error: "Phone is required (min 6 chars)" }, { status: 400 });
    }

    // Basic phone validation: digits, spaces, dashes, plus
    if (!/^[\d\s\-+()]+$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone format" }, { status: 400 });
    }

    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      vehicleId,
      name,
      phone,
      email: email || undefined,
      message: message || undefined,
      channel,
      createdAt: new Date().toISOString(),
    };

    _leads.push(lead);

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      message: "Votre demande a été envoyée. Nous vous contacterons rapidement !",
    });
  } catch (error) {
    console.error("Erreur POST /api/leads:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    total: _leads.length,
    leads: _leads.slice(-50).reverse(),
  });
}
