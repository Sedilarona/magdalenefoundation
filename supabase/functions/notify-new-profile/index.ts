import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTIFICATION_EMAIL = "olefile.poane@gmail.com";

interface ProfileNotificationRequest {
  profileId: string;
  fullName: string;
  email?: string;
  location?: string;
  generation?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const { profileId, fullName, email, location, generation }: ProfileNotificationRequest = await req.json();

    console.log("Sending notification for new profile:", fullName);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Magdalene Family <onboarding@resend.dev>",
        to: [NOTIFICATION_EMAIL],
        subject: `New Family Member Profile: ${fullName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Georgia', serif; background-color: #f8f6f3; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #5a8a6a 0%, #3d6b4f 100%); padding: 30px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; }
              .content { padding: 30px; }
              .profile-card { background: #f0f5f1; border-radius: 12px; padding: 20px; margin: 20px 0; }
              .profile-name { font-size: 22px; color: #2d4a36; margin: 0 0 15px; }
              .detail { margin: 10px 0; color: #555; }
              .detail strong { color: #3d6b4f; }
              .footer { background: #f8f6f3; padding: 20px; text-align: center; color: #888; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌳 Magdalene Family</h1>
                <p>New Family Member Registered</p>
              </div>
              <div class="content">
                <p>Good day,</p>
                <p>A new family member has joined the Magdalene family app:</p>
                
                <div class="profile-card">
                  <h2 class="profile-name">${fullName}</h2>
                  ${email ? `<p class="detail"><strong>Email:</strong> ${email}</p>` : ''}
                  ${location ? `<p class="detail"><strong>Location:</strong> ${location}</p>` : ''}
                  ${generation ? `<p class="detail"><strong>Generation:</strong> ${generation}</p>` : ''}
                  <p class="detail"><strong>Profile ID:</strong> ${profileId}</p>
                </div>
                
                <p>Please welcome them to our family circle!</p>
                
                <p>Warm regards,<br><em>MAGGIE - Your Family AI</em></p>
              </div>
              <div class="footer">
                <p>The Magdalene Foundation | Connecting Generations</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);