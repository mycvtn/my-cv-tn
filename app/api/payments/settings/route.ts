import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "payment_settings.json");

const DEFAULT_SETTINGS = {
  d17PhoneNumber: "98 123 456",
  d17AccountHolder: "my-cv.tn Administration",
  d17Instructions: "Effectuez le transfert vers ce numéro D17 puis téléversez la capture d'écran du reçu.",
  d17Enabled: true,
  flouciAccount: "flouci.me/mycv_tn / RIB: 08 000 000123456789 20",
  flouciAccountHolder: "MY-CV TUNISIE",
  flouciInstructions: "Envoyez le montant via l'application Flouci ou par virement bancaire puis attachez le justificatif.",
  flouciEnabled: true,
  customMethods: [
    {
      id: "meth-rib-01",
      name: "Virement Bancaire (RIB)",
      icon: "🏦",
      accountNumber: "RIB: 08 014 000123456789 54 (Attijari Bank)",
      accountHolder: "MY-CV TUNISIE SARL",
      instructions: "Effectuez un virement bancaire vers notre RIB, puis téléversez l'avis d'opération ou le reçu.",
      enabled: true,
    }
  ],
};

function readSettings() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      return JSON.parse(data);
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf-8");
    return DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {}
}

export async function GET() {
  const settings = readSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    writeSettings(body);
    return NextResponse.json({ success: true, settings: body });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
