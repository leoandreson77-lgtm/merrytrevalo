export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Call } from "@/models/Call";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import twilio from "twilio";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const calls = await Call.find()
      .sort({ createdAt: -1 })
      .populate("leadId", "name email phone");

    // Auto-sync missing recordings directly from Twilio API for recent calls
    const recentCallsWithMissingRecordings = calls.filter(
      (c) =>
        c.twilioCallSid &&
        !c.recordingUrl &&
        Date.now() - new Date(c.createdAt).getTime() < 24 * 60 * 60 * 1000
    ).slice(0, 10);

    if (recentCallsWithMissingRecordings.length > 0) {
      const twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID || "",
        process.env.TWILIO_AUTH_TOKEN || ""
      );

      await Promise.all(
        recentCallsWithMissingRecordings.map(async (call) => {
          try {
            const recs = await twilioClient.recordings.list({
              callSid: call.twilioCallSid,
            });
            if (recs && recs.length > 0) {
              // Direct MP3 URL format for direct HTML5 audio player playbacks
              const mp3Url = `https://api.twilio.com${recs[0].uri.replace(
                ".json",
                ""
              )}.mp3`;
              call.recordingUrl = mp3Url;
              await Call.updateOne({ _id: call._id }, { recordingUrl: mp3Url });
            }
          } catch (err) {
            console.error(
              `[Recording Sync Fallback] Failed for ${call.twilioCallSid}:`,
              err
            );
          }
        })
      );
    }

    return NextResponse.json(calls);
  } catch (error: any) {
    console.error("API admin/calls GET error:", error);
    return NextResponse.json({ message: "Failed to fetch calls log", error: error.message }, { status: 500 });
  }
}
