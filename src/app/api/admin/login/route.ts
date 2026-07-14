import { NextResponse } from "next/server";
import { adminCookieName, adminSessionMaxAge, createAdminSession, verifyAdminPassword } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (!await verifyAdminPassword(password)) return NextResponse.json({ message: "密碼不正確" }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, createAdminSession(), {
    httpOnly: true,
    maxAge: adminSessionMaxAge,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
