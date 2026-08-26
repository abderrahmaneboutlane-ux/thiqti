import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const make = searchParams.get("make") || "Dacia";
  const model = searchParams.get("model") || "Sandero";
  const cleanMake = encodeURIComponent(make.trim());
  const cleanModel = encodeURIComponent(model.trim());

  const cdnUrl = `https://cdn.imagin.studio/getimage?customer=ma-thiqti&make=${cleanMake}&modelFamily=${cleanModel}&angle=23&width=800`;

  return NextResponse.json({
    make,
    model,
    imageUrl: cdnUrl,
    sources: [cdnUrl]
  });
}
