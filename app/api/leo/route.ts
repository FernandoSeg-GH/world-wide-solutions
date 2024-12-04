import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt, max_tokens = 512, temperature = 0.7 } = await req.json();

  const response = await fetch(`http://localhost:11434/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2:3b",
      prompt,
      max_tokens,
      temperature,
      stream: false,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: response.statusText },
      { status: response.status }
    );
  }

  const data = await response.json();
  const generatedText = data.response || "No response received.";

  return NextResponse.json({ response: generatedText });
}
