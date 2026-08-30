import { NextRequest, NextResponse } from "next/server";
import { lookupAustinProperty } from "@/lib/providers/austin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();

  if (!address) {
    return NextResponse.json({ error: "address is required" }, { status: 400 });
  }

  try {
    const property = await lookupAustinProperty(address);

    if (!property) {
      return NextResponse.json(
        {
          supported: false,
          reason: "No high-confidence match was found in the City of Austin locator.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ supported: true, property });
  } catch (error) {
    console.error("Austin property lookup failed", error);
    return NextResponse.json(
      { error: "Austin property data is temporarily unavailable." },
      { status: 502 },
    );
  }
}
