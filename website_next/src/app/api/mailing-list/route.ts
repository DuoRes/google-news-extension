import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    await sql`CREATE TABLE IF NOT EXISTS mailing_list (email TEXT PRIMARY KEY)`;
    const result =
      await sql`INSERT INTO mailing_list (email) VALUES (${email}) ON CONFLICT DO NOTHING`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
