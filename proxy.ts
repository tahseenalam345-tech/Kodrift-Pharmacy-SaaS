import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Let all traffic pass through freely. No forced logins!
  return NextResponse.next();
}