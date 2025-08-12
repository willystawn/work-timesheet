import { GoogleGenAI } from "@google/genai";
import type { TimesheetEntry } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const formatEntriesForPrompt = (entries: TimesheetEntry[]): string => {
  return entries
    .map(
      (entry) =>
        `- Tanggal: ${entry.date}, Waktu Kerja: ${entry.startTime}-${entry.endTime}\n  Rangkuman: ${entry.task}`
    )
    .join("\n\n");
};

export const generatePerformanceReview = async (
  entries: TimesheetEntry[]
): Promise<string> => {
  const formattedEntries = formatEntriesForPrompt(entries);

  const systemInstruction = `
    Anda adalah asisten AI yang bertugas merangkum poin-poin penting dari catatan kerja.
    Analisis data timesheet berikut dan buat ringkasan singkat dalam bentuk poin-poin (bullet points).
    Fokus hanya pada pencapaian utama dan hasil konkret. Hindari kalimat yang panjang dan bertele-tele.
    Tujuannya adalah untuk memberikan inti sari dari pekerjaan yang telah dilakukan.
    Format output dalam Markdown.
  `;

  const contents = `
    Berikut adalah data catatan kerja harian yang perlu diringkas:
    ${formattedEntries}
  `;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating performance review:", error);
    throw new Error(
      "Gagal berkomunikasi dengan AI. Pastikan koneksi dan konfigurasi Anda benar."
    );
  }
};