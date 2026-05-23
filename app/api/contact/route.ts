import { NextResponse } from "next/server";

const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MAX_NAME = 100;

export async function POST(request: Request) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;

  if (!token || !repo) {
    console.error("Missing GITHUB_TOKEN or GITHUB_REPO");
    return NextResponse.json(
      { error: "Contact form is not configured yet." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { message, name, website } = body as {
    message?: string;
    name?: string;
    website?: string;
  };

  if (website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  if (typeof message !== "string") {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const trimmedMessage = message.trim();
  if (
    trimmedMessage.length < MIN_MESSAGE ||
    trimmedMessage.length > MAX_MESSAGE
  ) {
    return NextResponse.json(
      { error: `Message must be between ${MIN_MESSAGE} and ${MAX_MESSAGE} characters.` },
      { status: 400 },
    );
  }

  const trimmedName =
    typeof name === "string" ? name.trim().slice(0, MAX_NAME) : "";

  const title = trimmedName
    ? `Contact from motempo.com — ${trimmedName}`
    : "Contact from motempo.com";

  const issueBody = [
    trimmedName ? `**Name:** ${trimmedName}` : null,
    `**Submitted:** ${new Date().toISOString()}`,
    "",
    trimmedMessage,
  ]
    .filter(Boolean)
    .join("\n");

  const ghRes = await fetch(`https://api.github.com/repos/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body: issueBody }),
  });

  if (!ghRes.ok) {
    console.error("GitHub API error", ghRes.status, await ghRes.text());
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
