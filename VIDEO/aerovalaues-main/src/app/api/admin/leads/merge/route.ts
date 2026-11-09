import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ message: "Unauthorized. Admin role required." }, { status: 401 });
    }

    const body = await request.json();
    const { primaryLeadId, duplicateLeadId } = body;

    if (!primaryLeadId || !duplicateLeadId) {
      return NextResponse.json({ message: "Missing primaryLeadId or duplicateLeadId" }, { status: 400 });
    }

    if (primaryLeadId === duplicateLeadId) {
      return NextResponse.json({ message: "Cannot merge a lead into itself" }, { status: 400 });
    }

    await connectToDatabase();

    const primaryLead = await Lead.findById(primaryLeadId);
    const duplicateLead = await Lead.findById(duplicateLeadId);

    if (!primaryLead || !duplicateLead) {
      return NextResponse.json({ message: "Primary or duplicate lead not found" }, { status: 404 });
    }

    // Merge notes
    primaryLead.notes.push(...duplicateLead.notes);

    // Merge history logs
    primaryLead.history.push(...duplicateLead.history);

    // Merge attachments
    primaryLead.attachments.push(...duplicateLead.attachments);

    // Add merge history entry to primary lead
    primaryLead.history.push({
      action: "Duplicate Lead Merged",
      performedBy: session.user?.name || "System",
      details: `Merged duplicate lead of ${duplicateLead.name} (Phone: ${duplicateLead.phone}, Email: ${duplicateLead.email}) into this lead.`,
      timestamp: new Date(),
    });

    // Merge tags
    const combinedTags = new Set([...primaryLead.tags, ...duplicateLead.tags]);
    primaryLead.tags = Array.from(combinedTags);

    // Preserve the highest priority
    const priorityOrder = { Low: 0, Medium: 1, High: 2, Urgent: 3 };
    const primaryPriorityVal = priorityOrder[primaryLead.priority] || 1;
    const dupPriorityVal = priorityOrder[duplicateLead.priority] || 1;
    if (dupPriorityVal > primaryPriorityVal) {
      primaryLead.priority = duplicateLead.priority;
    }

    // Preserve Booked/Won status if duplicate was booked
    if (duplicateLead.status === "Booked" && primaryLead.status !== "Booked") {
      primaryLead.status = "Booked";
    }

    // Save primary lead changes
    await primaryLead.save();

    // Delete duplicate lead record
    await Lead.findByIdAndDelete(duplicateLeadId);

    return NextResponse.json({
      success: true,
      message: "Leads merged successfully!",
      lead: primaryLead,
    });
  } catch (error: any) {
    console.error("API admin/leads/merge error:", error);
    return NextResponse.json({ message: "Failed to merge leads", error: error.message }, { status: 500 });
  }
}
