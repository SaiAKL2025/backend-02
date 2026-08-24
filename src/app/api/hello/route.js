import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";

// Handle the browser's preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  const message = {
    message: "hello world",
  };

  return NextResponse.json(message, {
    headers: corsHeaders,
  });
}