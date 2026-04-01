import { NextRequest } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return Response.json(
      { error: "GEMINI_API_KEY が設定されていません" },
      { status: 500 }
    );
  }

  const { input, systemPrompt } = await request.json();

  if (!input || typeof input !== "string") {
    return Response.json(
      { error: "入力テキストが必要です" },
      { status: 400 }
    );
  }

  const defaultSystemPrompt = `あなたは経験豊富な看護師です。
以下の患者情報・観察内容をもとに、SOAP形式の看護記録を作成してください。

## 出力形式
S（主観的データ）: 患者の訴え、言葉をそのまま記載
O（客観的データ）: バイタルサイン、観察所見、検査データなど客観的事実
A（アセスメント）: S・Oを統合した看護判断・分析
P（計画）: 具体的な看護計画・介入内容

## 注意事項
- 医療用語を適切に使用すること
- 簡潔かつ正確に記載すること
- 推測と事実を明確に区別すること`;

  const prompt = systemPrompt?.trim() || defaultSystemPrompt;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: prompt }],
        },
        contents: [
          {
            parts: [{ text: input }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return Response.json(
        { error: `Gemini API エラー: ${errorData.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "応答を生成できませんでした";

    return Response.json({ result: text });
  } catch (error) {
    return Response.json(
      { error: `リクエスト失敗: ${error instanceof Error ? error.message : "不明なエラー"}` },
      { status: 500 }
    );
  }
}
