// @/app/api/sheets/route.ts

import { NextResponse } from "next/server";
import { createSpreadsheet } from "@/lib/services/googleSheets";
import { z } from "zod";

// Input validation schema
const requestSchema = z.object({
  title: z.string().min(1).max(100),
  data: z.array(z.array(z.any())),
});

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json();
    const { title, data } = requestSchema.parse(body);

    // Create spreadsheet
    const url = await createSpreadsheet(title, data);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Sheets API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create spreadsheet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
