// Local, in-browser demo store for chat/messaging.
// No backend calls — everything is persisted to localStorage.

export type DemoMsg = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type DemoConversation = {
  id: string;
  other_user_id: string;
  other_first_name: string | null;
  other_last_name: string | null;
  other_company: string | null;
  messages: DemoMsg[];
  unread_count: number;
};

const KEY = "ajbn_demo_conversations_v1";
const SEEDED_KEY = "ajbn_demo_conversations_seeded_v1";
const ASSISTANT_ID = "ajbn-concierge";

function read(): Record<string, DemoConversation> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch { return {}; }
}

function write(map: Record<string, DemoConversation>) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

function uid() {
  return `demo-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function nowShift(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60_000).toISOString();
}

export function ensureSeeded() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  const map = read();

  const seeds: DemoConversation[] = [
    {
      id: uid(),
      other_user_id: "demo-russell",
      other_first_name: "Russell",
      other_last_name: "Bahar",
      other_company: "AJBN — Membership",
      unread_count: 1,
      messages: [
        { id: uid(), sender_id: "demo-russell", body: "Welcome to AJBN Connect 👋 great to have you on the platform.", created_at: nowShift(120) },
        { id: uid(), sender_id: "demo-russell", body: "Any questions on membership, referrals or the next event — just reply here.", created_at: nowShift(115) },
      ],
    },
    {
      id: uid(),
      other_user_id: "demo-salil",
      other_first_name: "Salil",
      other_last_name: "Patankar",
      other_company: "Capital Connect & Deal Matching",
      unread_count: 0,
      messages: [
        { id: uid(), sender_id: "demo-salil", body: "Hi 👋 I run Capital Connect for AJBN — happy to intro you to investors or dealflow when you're ready.", created_at: nowShift(60) },
      ],
    },
  ];

  for (const c of seeds) map[c.id] = c;
  write(map);
  localStorage.setItem(SEEDED_KEY, "1");
}

export function listInbox(): DemoConversation[] {
  ensureSeeded();
  const map = read();
  return Object.values(map).sort((a, b) => {
    const at = a.messages[a.messages.length - 1]?.created_at ?? "";
    const bt = b.messages[b.messages.length - 1]?.created_at ?? "";
    return bt.localeCompare(at);
  });
}

export function getConversation(id: string): DemoConversation | null {
  ensureSeeded();
  return read()[id] ?? null;
}

export function startOrGetConversation(other: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
}): string {
  ensureSeeded();
  const map = read();
  const existing = Object.values(map).find((c) => c.other_user_id === other.id);
  if (existing) return existing.id;
  const id = uid();
  map[id] = {
    id,
    other_user_id: other.id,
    other_first_name: other.first_name ?? "Member",
    other_last_name: other.last_name ?? "",
    other_company: other.company ?? null,
    unread_count: 1,
    messages: [
      {
        id: uid(),
        sender_id: other.id,
        body: `Hi 👋 thanks for reaching out via AJBN Connect. Great to link with a fellow member — how can I help?`,
        created_at: nowShift(2),
      },
    ],
  };
  write(map);
  return id;
}

export function markRead(id: string) {
  const map = read();
  if (!map[id]) return;
  map[id].unread_count = 0;
  write(map);
}

export function sendMessage(id: string, senderId: string, body: string): DemoMsg | null {
  const map = read();
  const convo = map[id];
  if (!convo) return null;
  const msg: DemoMsg = { id: uid(), sender_id: senderId, body, created_at: new Date().toISOString() };
  convo.messages.push(msg);

  // Simulate a friendly canned reply so the demo feels alive.
  const replyBody = pickReply(body);
  setTimeout(() => {
    const m2 = read();
    if (!m2[id]) return;
    m2[id].messages.push({
      id: uid(),
      sender_id: convo.other_user_id,
      body: replyBody,
      created_at: new Date().toISOString(),
    });
    write(m2);
    window.dispatchEvent(new CustomEvent("ajbn-demo-message", { detail: { conversationId: id } }));
  }, 900);

  write(map);
  return msg;
}

function pickReply(_body: string) {
  const options = [
    "Great — noted 👍 I'll get back with more shortly.",
    "Thanks for the message! Let me follow up on that.",
    "Appreciate you reaching out — happy to connect further at the next AJBN event.",
    "Sounds good. Let's line up a call this week.",
  ];
  return options[Math.floor(Math.random() * options.length)];
}

export const DEMO_ASSISTANT_ID = ASSISTANT_ID;