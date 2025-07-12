import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const linkId = params.id;

  // TODO: Fetch link data from Supabase using linkId

  return NextResponse.json({ message: `Link ID: ${linkId}` });
}