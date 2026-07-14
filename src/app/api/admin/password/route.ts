import { NextResponse } from "next/server";
import { isAdminAuthenticated, updateAdminPassword, verifyAdminPassword } from "../../../../lib/admin-auth";

export async function PUT(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ message: "請先登入管理後台" }, { status: 401 });
  const body = await request.json().catch(() => null) as { currentPassword?: unknown; newPassword?: unknown } | null;
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!await verifyAdminPassword(currentPassword)) return NextResponse.json({ message: "目前密碼不正確" }, { status: 400 });
  if (newPassword.length < 10) return NextResponse.json({ message: "新密碼至少需要 10 個字元" }, { status: 400 });
  if (newPassword === currentPassword) return NextResponse.json({ message: "新密碼不能和目前密碼相同" }, { status: 400 });

  await updateAdminPassword(newPassword);
  return NextResponse.json({ ok: true });
}
