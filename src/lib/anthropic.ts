import Anthropic from "@anthropic-ai/sdk";
import { PERSONAS, type PersonaId } from "./personas";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY가 설정되어 있지 않습니다. .env.local에 키를 추가하세요."
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateBlogDraft(input: {
  topic: string;
  persona: PersonaId;
}): Promise<{ title: string; content: string }> {
  const persona = PERSONAS[input.persona];
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2000,
    system: `${persona.systemPrompt}

출력 형식은 반드시 아래와 같이 지키세요:
제목: <블로그 글 제목>
---
<본문, 최소 600자 이상, 문단 구분은 빈 줄로>`,
    messages: [
      {
        role: "user",
        content: `아래 주제로 블로그 글 초안을 작성해주세요.\n\n주제: ${input.topic}`,
      },
    ],
  });

  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  const separatorIndex = text.indexOf("---");
  let title = input.topic;
  let content = text;

  if (separatorIndex !== -1) {
    const titleLine = text.slice(0, separatorIndex).trim();
    title = titleLine.replace(/^제목\s*:\s*/, "").trim() || input.topic;
    content = text.slice(separatorIndex + 3).trim();
  }

  return { title, content };
}
