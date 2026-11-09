import fs from "fs";
import path from "path";

interface CallLogData {
  date: Date;
  from: string;
  to: string;
  forwardedTo: string;
  duration: number;
  status: string;
  buyerName?: string;
  earnings?: number;
}

export function logCallToCSV(data: CallLogData) {
  try {
    const csvDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }
    const csvPath = path.join(csvDir, "calls_log.csv");
    const headers = "Date,Caller Number,Tracking Number,Buyer Number,Duration (sec),Status,Buyer Name,Earnings ($)\n";

    if (!fs.existsSync(csvPath)) {
      fs.writeFileSync(csvPath, headers);
    }

    const dateStr = data.date.toISOString();
    const fromStr = data.from || "Unknown";
    const toStr = data.to || "Unknown";
    const forwardedToStr = data.forwardedTo || "Unknown";
    const durationStr = data.duration;
    const statusStr = data.status || "Unknown";
    const buyerNameStr = data.buyerName || "None";
    const earningsStr = data.earnings || 0;

    const row = `"${dateStr}","${fromStr}","${toStr}","${forwardedToStr}",${durationStr},"${statusStr}","${buyerNameStr}",${earningsStr}\n`;
    fs.appendFileSync(csvPath, row);
    console.log(`[CSV Logger] Logged call to ${csvPath}`);
  } catch (error) {
    console.error("[CSV Logger Error]", error);
  }
}
