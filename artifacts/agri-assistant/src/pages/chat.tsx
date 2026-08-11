import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare, Plus, Trash2, Loader2,
  Bot, User, Sprout, AlertCircle, Zap,
  ChevronDown, Copy, Check, Menu, X, ArrowUp,
  RotateCcw, Sparkles, Leaf
} from "lucide-react";

const BASE_URL = (import.meta.env.BASE_URL ?? "").replace(/\/+$/, "");

interface ChatMessage {
  id: number | string;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  updatedAt?: string;
}

const STARTERS_EN = [
  {
    title: "Rice Farming",
    desc: "Best high-yield rice varieties for my region",
    prompt: "🌾 What rice varieties grow best in my region and season?",
  },
  {
    title: "Pest & Blight Control",
    desc: "Identify and treat bacterial leaf blight & armyworm",
    prompt: "🐛 How do I identify, prevent, and treat bacterial leaf blight in rice?",
  },
  {
    title: "Fertilizer Schedule",
    desc: "Basal & top-dress nutrient timing recommendations",
    prompt: "🧪 Create a complete fertilizer application schedule for my current crops.",
  },
  {
    title: "Weather & Irrigation",
    desc: "Watering schedule based on weather forecast",
    prompt: "💧 How should I adjust my irrigation based on the current weather forecast?",
  },
];

const STARTERS_FIL = [
  {
    title: "Pagtatanim ng Palay",
    desc: "Pinakamagandang uri ng palay na mataas ang ani",
    prompt: "🌾 Anong uri ng palay ang pinakamagandang itanim sa aking rehiyon at panahon?",
  },
  {
    title: "Pagsugpo sa Peste at Sakit",
    desc: "Pagtukoy at paggamot sa bacterial leaf blight at armyworm",
    prompt: "🐛 Paano matutukoy, maiiwasan, at magagamot ang bacterial leaf blight sa palay?",
  },
  {
    title: "Iskedyul ng Pag-aabono",
    desc: "Rekomendasyon sa tamang oras ng paglalagay ng pataba",
    prompt: "🧪 Gumawa ng kumpletong iskedyul ng paglalagay ng abono para sa aking pananim.",
  },
  {
    title: "Panahon at Pagpapatubig",
    desc: "Iskedyul ng pagpapatubig batay sa ulat ng panahon",
    prompt: "💧 Paano ko dapat iakma ang aking pagpapatubig batay sa ulat ng panahon?",
  },
];

function cleanErrorMessage(raw: string): string {
  if (!raw) return "Grownox AI is currently unavailable. Please try again.";
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("Quota exceeded") || raw.includes("quota")) {
    return "Grownox AI rate limit reached. Please wait a few seconds and try again.";
  }
  if (raw.includes("503") || raw.includes("UNAVAILABLE") || raw.includes("Overloaded")) {
    return "Grownox AI is currently high in demand. Please try again in a moment.";
  }
  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.message) return cleanErrorMessage(parsed.message);
      if (parsed.error?.message) return cleanErrorMessage(parsed.error.message);
    } catch {}
  }
  return raw.length > 180 ? raw.slice(0, 180) + "..." : raw;
}

function MarkdownText({ text }: { text: string }) {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const renderInline = (raw: string, i: number) => {
    if (raw.startsWith("**") && raw.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{raw.slice(2, -2)}</strong>;
    }
    if (raw.startsWith("`") && raw.endsWith("`")) {
      return (
        <code key={i} className="bg-muted dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono">
          {raw.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{raw}</span>;
  };

  // Handle code blocks (```code```)
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks: { type: "code" | "text"; content: string; lang?: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    blocks.push({ type: "code", lang: match[1] ?? "code", content: match[2].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    blocks.push({ type: "text", content: text.slice(lastIndex) });
  }

  let codeBlockCounter = 0;

  return (
    <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
      {blocks.map((block, blockIdx) => {
        if (block.type === "code") {
          const currentCounter = codeBlockCounter++;
          return (
            <div key={blockIdx} className="my-3 rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 text-zinc-100 overflow-hidden shadow-sm font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 dark:bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px]">
                <span>{block.lang || "code"}</span>
                <button
                  onClick={() => handleCopyCode(block.content, currentCounter)}
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                >
                  {copiedCodeIndex === currentCounter ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto leading-normal whitespace-pre">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text lines
        const lines = block.content.split("\n");
        const elements: React.ReactNode[] = [];
        let listItems: string[] = [];

        const flushList = () => {
          if (listItems.length) {
            elements.push(
              <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2 pl-1">
                {listItems.map((item, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="text-emerald-500 font-bold mt-1 shrink-0 text-xs">•</span>
                    <span className="flex-1">
                      {item.replace(/^[-•*]\s*/, "").split(/(\*\*[^*]+\*\*|`[^`]+`)/).map(renderInline)}
                    </span>
                  </li>
                ))}
              </ul>
            );
            listItems = [];
          }
        };

        lines.forEach((line, i) => {
          if (!line.trim()) {
            flushList();
            if (elements.length > 0) elements.push(<div key={`sp-${i}`} className="h-1.5" />);
          } else if (line.match(/^#{1,3}\s/)) {
            flushList();
            const level = (line.match(/^(#{1,3})/) || [])[1]?.length ?? 1;
            const txt = line.replace(/^#{1,3}\s/, "");
            elements.push(
              <h3 key={i} className={`font-semibold text-foreground tracking-tight ${
                level === 1 ? "text-base mt-4 mb-2 font-bold" : level === 2 ? "text-sm mt-3 mb-1 font-semibold" : "text-sm mt-2 font-semibold"
              }`}>
                {txt.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map(renderInline)}
              </h3>
            );
          } else if (line.match(/^\d+\.\s/)) {
            flushList();
            elements.push(
              <div key={i} className="flex gap-2.5 items-start my-1">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium shrink-0 text-xs min-w-[1.2rem] mt-0.5">
                  {line.match(/^\d+/)?.[0]}.
                </span>
                <span className="flex-1">
                  {line.replace(/^\d+\.\s/, "").split(/(\*\*[^*]+\*\*|`[^`]+`)/).map(renderInline)}
                </span>
              </div>
            );
          } else if (line.match(/^[-•*]\s/)) {
            listItems.push(line);
          } else {
            flushList();
            elements.push(
              <p key={i} className="my-0.5">
                {line.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map(renderInline)}
              </p>
            );
          }
        });
        flushList();

        return <div key={blockIdx}>{elements}</div>;
      })}
    </div>
  );
}

export default function Chat() {
  const { settings } = useSettings();
  const [, navigate] = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [aiReady, setAiReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<number | string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Check AI status
  useEffect(() => {
    fetch(`${BASE_URL}/api/chat/status`)
      .then(r => r.json())
      .then(d => setAiReady(d.ready))
      .catch(() => {});
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/conversations`);
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    fetch(`${BASE_URL}/api/chat/conversations/${activeId}/messages`)
      .then(r => r.ok ? r.json() : [])
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(() => {});
  }, [activeId]);

  const createConversation = useCallback(async (): Promise<number | null> => {
    try {
      const res = await fetch(`${BASE_URL}/api/chat/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (!res.ok) return null;
      const conv: Conversation = await res.json();
      setConversations(prev => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setSidebarOpen(false);
      return conv.id;
    } catch { return null; }
  }, []);

  const startNewChat = () => {
    setActiveId(null);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
    if (textareaRef.current) textareaRef.current.focus();
  };

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`${BASE_URL}/api/chat/conversations/${id}`, { method: "DELETE" }).catch(() => {});
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  const selectConversation = (id: number) => {
    setActiveId(id);
    setSidebarOpen(false);
    setError(null);
  };

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setError(null);

    let convId = activeId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) { setError("Failed to create conversation session."); return; }
    }

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: tempId,
      conversationId: convId,
      role: "user",
      content: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamingContent("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }

    const context = {
      cityName: settings.cityName,
      provinceName: settings.provinceName,
      regionName: settings.regionName,
      regionCode: settings.regionCode,
      provinceCode: settings.provinceCode,
      cityCode: settings.cityCode,
      preferredCrops: settings.preferredCrops,
      language: settings.language,
    };

    try {
      const abort = new AbortController();
      abortRef.current = abort;

      const res = await fetch(`${BASE_URL}/api/chat/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: msg, context }),
        signal: abort.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "AI unavailable. Please try again.");
        setMessages(prev => prev.filter(m => m.id !== tempId));
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }

      const decoder = new TextDecoder();
      let buf = "";
      let raw = "";
      let streamErr: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const ev = JSON.parse(line.slice(6));
            if (ev.error) {
              streamErr = ev.error;
              break;
            }
            if (ev.done) break;
            if (ev.content) {
              raw += ev.content;
              setStreamingContent(raw);
            }
          } catch {}
        }
        if (streamErr) break;
      }

      if (streamErr) {
        setError(cleanErrorMessage(streamErr));
        if (!raw) {
          setMessages(prev => prev.filter(m => m.id !== tempId));
        }
      } else if (raw) {
        const assistantMsg: ChatMessage = {
          id: Date.now(),
          conversationId: convId,
          role: "assistant",
          content: raw.trim(),
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        loadConversations();
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError("Connection issue. Please try sending your message again.");
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } finally {
      setStreaming(false);
      setStreamingContent("");
      abortRef.current = null;
    }
  }, [input, streaming, activeId, createConversation, settings, loadConversations]);

  const handleCopyMessage = (id: number | string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasPsgc = !!(settings.regionCode || settings.provinceCode || settings.cityName);
  const activeConv = conversations.find(c => c.id === activeId);
  const isFil = settings.language === "fil";
  const starters = isFil ? STARTERS_FIL : STARTERS_EN;

  return (
    <div className="flex h-full w-full bg-background text-foreground overflow-hidden font-sans">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - ChatGPT Style */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        flex flex-col w-72 md:w-64 bg-zinc-900 text-zinc-200 border-r border-zinc-800
        transition-transform duration-200 ease-in-out md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-800/80">
          <Button
            onClick={startNewChat}
            variant="ghost"
            className="flex-1 justify-start gap-2.5 h-10 text-sm font-medium text-zinc-200 hover:text-white hover:bg-zinc-800 rounded-lg px-3"
          >
            <Plus className="h-4 w-4 text-zinc-400" />
            <span>{isFil ? "Bagong Chat" : "New chat"}</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 text-zinc-400 hover:text-white md:hidden ml-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1 px-2 py-3">
          <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
            {isFil ? "Mga Nakaraang Chat" : "Recent Chats"}
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8 px-4">
              {isFil ? "Wala pang mga pag-uusap." : "No conversations yet."}
            </p>
          ) : (
            <div className="space-y-0.5">
              {conversations.map(conv => {
                const isActive = activeId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "bg-zinc-800 text-white font-medium"
                        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                    }`}
                  >
                    <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-cyan-400" : "text-zinc-500"}`} />
                    <span className="flex-1 truncate leading-relaxed">{conv.title === "New Chat" && isFil ? "Bagong Chat" : conv.title}</span>
                    <button
                      onClick={e => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-zinc-500 transition-opacity"
                      title={isFil ? "Burahin ang chat" : "Delete chat"}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* User / Farm Info Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-zinc-400">
            <div className="h-7 w-7 rounded-full bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0 border border-blue-500/30 font-semibold text-xs">
              🌾
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-zinc-200 truncate">
                {settings.cityName || settings.provinceName || (isFil ? "Magsasakang Pilipino" : "Filipino Farmer")}
              </div>
              <div className="text-[10px] text-zinc-500 truncate">
                {settings.preferredCrops.slice(0, 2).join(", ") || (isFil ? "Agrikultura sa Pilipinas" : "Philippine Agri")}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative h-full overflow-hidden">

        {/* Top Navbar */}
        <header className="h-14 border-b border-border/60 px-4 flex items-center justify-between bg-background/80 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-muted-foreground md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Model selector badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/30 text-xs font-semibold hover:bg-muted/60 transition-colors cursor-default">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-cyan-400" />
              <span>Grownox 3.5 Flash Lite</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5 opacity-60" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!hasPsgc && (
              <button
                onClick={() => navigate("/settings")}
                className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg hover:bg-amber-500/20 transition-colors flex items-center gap-1"
              >
                <AlertCircle className="h-3 w-3" />
                <span>{isFil ? "I-set ang lokasyon" : "Set location"}</span>
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="h-8 text-xs gap-1.5 rounded-lg border-border"
            >
              <Plus className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
              <span className="hidden sm:inline">{isFil ? "Bagong Chat" : "New Chat"}</span>
            </Button>
          </div>
        </header>

        {/* Scrollable Conversation Container */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {!activeId && messages.length === 0 ? (
            /* Empty State / ChatGPT Starter Screen */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] px-4 max-w-2xl mx-auto text-center animate-in fade-in duration-300">
              <div className="h-16 w-16 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-5 border border-violet-500/20 shadow-xs">
                <Sprout className="h-8 w-8" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-stone-900 dark:text-stone-100">
                {isFil ? "Ano ang maipaglilingkod ko ngayon?" : "What can I help with today?"}
              </h1>
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-8 max-w-md leading-relaxed">
                {isFil ? (
                  <>Ako si <span className="font-semibold text-stone-900 dark:text-stone-100">Grownox</span>, ang iyong AI agronomy assistant na dalubhasa sa mga pananim sa Pilipinas, pagsugpo sa peste, at pagsasaka sa rehiyon.</>
                ) : (
                  <>I am <span className="font-semibold text-stone-900 dark:text-stone-100">Grownox</span>, your AI agronomy assistant specialized in Philippine crops, pest management, and regional farming.</>
                )}
              </p>

              {/* Quick starter tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                {starters.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(s.prompt)}
                    className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-card hover:bg-violet-50/50 dark:hover:bg-violet-950/20 hover:border-violet-300 dark:hover:border-violet-700/50 transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-stone-900 dark:text-stone-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                        {s.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Messages Stream */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-semibold text-xs">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble Container */}
                  <div className={`group relative max-w-[88%] sm:max-w-[82%] ${
                    msg.role === "user" ? "space-y-1" : "space-y-2 flex-1 min-w-0"
                  }`}>
                    {msg.role === "user" ? (
                      <div className="bg-muted dark:bg-stone-800 text-foreground px-4 py-3 rounded-2xl rounded-tr-xs text-sm leading-relaxed border border-border/50">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="py-1">
                        <MarkdownText text={msg.content} />

                        {/* Message Action Bar (Copy, etc.) */}
                        <div className="flex items-center gap-1 mt-3 text-muted-foreground opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1.5 rounded-lg hover:bg-muted text-xs flex items-center gap-1 transition-colors"
                            title={isFil ? "Kopyahin ang mensahe" : "Copy message"}
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-violet-500" />
                                <span className="text-[11px] text-violet-500">{isFil ? "Na-kopyang" : "Copied"}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {msg.role === "user" && (
                    <div className="h-8 w-8 rounded-full bg-stone-200 dark:bg-stone-700 text-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming AI Response */}
              {streaming && (
                <div className="flex gap-3 sm:gap-4 justify-start">
                  <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-semibold text-xs">
                    <Bot className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    {streamingContent ? (
                      <MarkdownText text={streamingContent} />
                    ) : (
                      <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground font-medium">
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="ml-1 text-violet-600 dark:text-violet-400 font-semibold animate-pulse">{isFil ? "Naghahanda ng sagot si Grownox..." : "Grownox is working..."}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center justify-between gap-3 max-w-full overflow-hidden break-words mx-auto">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="flex-1 min-w-0 break-words">{cleanErrorMessage(error)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setError(null);
                      const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
                      if (lastUserMsg?.content) {
                        sendMessage(lastUserMsg.content);
                      }
                    }}
                    className="h-7 px-2.5 text-xs shrink-0 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                  >
                    {isFil ? "Subukan Ulit" : "Retry"}
                  </Button>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ChatGPT Style Floating Prompt Input Bar */}
        <div className="p-3 sm:p-4 bg-background border-t border-border/60 shrink-0">
          <div className="max-w-3xl mx-auto relative">

            {/* Rounded Pill Container */}
            <div className="relative flex items-end gap-2 bg-muted/40 dark:bg-stone-900 border border-border rounded-[24px] focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-xs p-1.5 sm:p-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
                placeholder={
                  aiReady
                    ? isFil
                      ? "Magtanong kay Grownox tungkol sa iyong mga pananim, peste, lupa, o panahon..."
                      : "Ask Grownox about your crops, pests, soil, or weather..."
                    : isFil
                    ? "Kumokonekta sa AI..."
                    : "Connecting to AI..."
                }
                rows={1}
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground focus:outline-none disabled:opacity-50 min-h-[40px] max-h-[160px] leading-relaxed"
                onInput={e => {
                  const el = e.currentTarget;
                  el.style.height = "40px";
                  el.style.height = Math.min(el.scrollHeight, 160) + "px";
                }}
              />

              {/* Submit / Send Button */}
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || streaming}
                size="icon"
                className={`h-9 w-9 rounded-full shrink-0 transition-all ${
                  input.trim() && !streaming
                    ? "bg-violet-600 hover:bg-violet-700 text-white shadow-xs"
                    : "bg-muted text-muted-foreground opacity-50"
                }`}
              >
                {streaming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                )}
              </Button>
            </div>

            {/* Disclaimer footer text */}
            <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
              {isFil
                ? "Nagbibigay ang Grownox AI ng gabay sa agrikultura. Sumangguni sa lokal na agronomista para sa mahahalagang desisyon."
                : "Grownox AI provides agricultural guidance. Verify important decisions with local agronomists."}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
