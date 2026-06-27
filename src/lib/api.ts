import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Thrown anywhere in a route to short-circuit with a specific status. The message is
// safe to expose (keep it generic — see CRITICAL RULE #7).
export class HttpError extends Error {
  constructor(
    public status: number,
    message = "Error",
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

// Map any thrown error to a generic external response. Never leak internals/stack/db
// details to the client; log server-side instead.
export function toErrorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ ok: false, message: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ ok: false, message: "Invalid input" }, { status: 400 });
  }
  console.error("Unhandled API error:", err);
  return NextResponse.json({ ok: false, message: "Something went wrong" }, { status: 500 });
}

type RouteCtx = { params: Promise<Record<string, string>> };
type Handler = (req: Request, ctx: RouteCtx) => Promise<Response>;

// Wrap a Route Handler so thrown HttpError / ZodError become clean JSON responses.
export function route(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return toErrorResponse(err);
    }
  };
}

// Parse + Zod-validate a JSON body, throwing HttpError(400) on bad JSON.
export async function parseJson<T>(req: Request, schema: { parse: (v: unknown) => T }): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "Invalid request body");
  }
  return schema.parse(body); // ZodError → 400 via toErrorResponse
}
