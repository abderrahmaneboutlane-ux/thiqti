import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ make: string; model: string }> }
) {
  try {
    const { make, model } = await params;
    const cleanMake = encodeURIComponent(make.trim());
    const cleanModel = encodeURIComponent(model.trim());

    // Cascade 1: Auto24.ma CDN
    // Cascade 2: Imagin Studio CDN fallback
    const cdnUrl = `https://cdn.imagin.studio/getimage?customer=ma-thiqti&make=${cleanMake}&modelFamily=${cleanModel}&angle=23&width=800`;

    return NextResponse.json({
      make,
      model,
      imageUrl: cdnUrl,
      sources: [
        cdnUrl,
        `https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80`
      ]
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur récupération image" }, { status: 500 });
  }
}
