import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/policy-acceptance - Get policy acceptance status
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch policy acceptance (RLS protected)
    const { data, error } = await supabase
      .from("policy_acceptance")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("[API Policy] Error:", error);
      return NextResponse.json(
        { error: "Failed to fetch policy acceptance" },
        { status: 500 },
      );
    }

    return NextResponse.json({ policyAcceptance: data });
  } catch (error) {
    console.error("[API Policy] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/policy-acceptance - Accept policy
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { policyType } = body;

    if (!policyType) {
      return NextResponse.json(
        { error: "Policy type is required" },
        { status: 400 },
      );
    }

    // Insert or update policy acceptance
    const { data, error } = await supabase
      .from("policy_acceptance")
      .upsert(
        {
          user_id: user.id,
          policy_type: policyType,
          accepted: true,
          accepted_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,policy_type",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("[API Policy] Error accepting policy:", error);
      return NextResponse.json(
        { error: "Failed to accept policy" },
        { status: 500 },
      );
    }

    return NextResponse.json({ policyAcceptance: data }, { status: 200 });
  } catch (error) {
    console.error("[API Policy] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
