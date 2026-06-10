export const dynamic = "force-dynamic";

import { computeAnalytics } from "@/lib/computeAnalytics";

const PUSH_INTERVAL = 60_000; // push an update every 60 seconds

// GET /api/dashboard/analytics/stream?transport=slug|all&period=week|month|6month|year
//
// Server-Sent Events endpoint. The client opens one persistent connection and
// receives pushed updates instead of polling. Server-side caching in
// computeAnalytics means all connected users share a single DB query per minute.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const transport = searchParams.get("transport") || "all";
  const period    = searchParams.get("period")    || "month";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (payload) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {}
      };

      // Send initial data immediately on connect (usually served from cache)
      try {
        send(await computeAnalytics(transport, period));
      } catch (err) {
        send({ error: err.message });
      }

      // Push a fresh result every 60s — cache means this is cheap
      const interval = setInterval(async () => {
        try {
          send(await computeAnalytics(transport, period));
        } catch (err) {
          send({ error: err.message });
        }
      }, PUSH_INTERVAL);

      // Clean up when the client disconnects or changes filters
      req.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(interval);
        try { controller.close(); } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":      "text/event-stream",
      "Cache-Control":     "no-cache, no-transform",
      "Connection":        "keep-alive",
      "X-Accel-Buffering": "no", // prevent nginx from buffering SSE chunks
    },
  });
}
