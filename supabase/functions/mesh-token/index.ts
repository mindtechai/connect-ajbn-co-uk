import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MESH_API_KEY = Deno.env.get("MESH_API_KEY") || "";
const MESH_CLIENT_ID = Deno.env.get("MESH_CLIENT_ID") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller's JWT and derive the userId from it — never trust
    // a userId supplied by the client, or one member could mint a Mesh link
    // token for another member's account.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    if (!MESH_CLIENT_ID || !MESH_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Mesh integration is not configured" }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Drain the body so the request stream is consumed; we ignore any
    // client-supplied userId on purpose.
    try {
      await req.json();
    } catch (_) {
      // body is optional
    }

    const response = await fetch(
      "https://sandbox-integration-api.meshconnect.com/api/v1/linktoken",
      {
        method: "POST",
        headers: {
          "X-Client-Id": MESH_CLIENT_ID,
          "X-Client-Secret": MESH_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          transferOptions: {
            destination: "member_wallet",
            asset: "USDC",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Mesh linktoken failed [${response.status}]: ${errorBody}`);
      return new Response(
        JSON.stringify({ error: "Failed to create Mesh link token" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mesh-token error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
