export function assertAdmin(req: Request) {
    const got = req.headers.get("x-admin-key") || "";
    const want = process.env.ADMIN_PASSWORD || "";
    if (!want || got !== want) {
      const e: any = new Error("Unauthorized");
      e.status = 401;
      throw e;
    }
  }
  