import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  // Example: fetch link data by ID
  return NextResponse.json({ message: `Link ID is ${id}` });
}
