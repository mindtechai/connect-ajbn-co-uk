import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MESH_API_KEY = Deno.env.get("MESH_API_KEY") || "";

serve(async (req) => {
  try {
    // Get the user from the JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user ID from the request body
    const { userId } = await req.json();
    
    // Call Mesh API to generate Link Token
    const response = await fetch("https://sandbox-integration-api.meshconnect.com/api/v1/linktoken", {
      method: "POST",
      headers: {
        "X-Client-Id": "your-client-id",
        "X-Client-Secret": MESH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        transferOptions: {
          destination: "member_wallet",
          asset: "USDC",
        },
      }),
    });

    const data = await response.json();
    
    // Return the link token to the client
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
