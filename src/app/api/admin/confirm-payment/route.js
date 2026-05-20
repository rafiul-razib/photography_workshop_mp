import { getServerSession } from "next-auth";
import axios from "axios";
import { authOptions } from "@/lib/auth";

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const adminKey = process.env.ADMIN_API_KEY?.trim();
  if (!adminKey) {
    return Response.json(
      { message: "Admin API is not configured (ADMIN_API_KEY)" },
      { status: 503 },
    );
  }

  const apiBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/$/, "");

  try {
    const body = await request.json();
    const { data, status } = await axios.post(
      `${apiBaseUrl}/admin/confirm-payment`,
      body,
      {
        headers: { "x-admin-key": adminKey },
      },
    );

    return Response.json(data, { status });
  } catch (error) {
    const status = error?.response?.status || 500;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to verify participant";

    return Response.json({ message }, { status });
  }
}
