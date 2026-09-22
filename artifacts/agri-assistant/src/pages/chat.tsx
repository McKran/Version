import { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "@/hooks/use-settings";
import { useLocation } from "wouter";
import { GrownoxAiAvatar } from "@/components/grownox-ai-avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  MessageSquare, Plus, Trash2, Loader2,
  AlertCircle, Copy, Check, Menu, X, ArrowUp,
  History, Share2, Sparkles, Send,
  Calendar, Video, SlidersHorizontal, ArrowUpRight,
  HelpCircle, ChevronRight
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
    icon: "🌾",
    category: "Rice & Palay Prep",
    title: "How do I prepare soil for wet-season palay planting?",
    desc: "Land preparation, puddle depth, and certified seed selection",
    prompt: "How do I prepare soil for wet-season palay planting and what high-yield certified varieties suit my region?",
    bgColor: "bg-[#E8F5E9]",
    textColor: "text-[#166534]",
  },
  {
    icon: "🐛",
    category: "Pest & Disease",
    title: "How can I manage onion armyworms & leaf blast?",
    desc: "Early biological prevention, threshold counts, and chemical intervention",
    prompt: "How can I identify, manage, and prevent armyworms and fungal leaf blast in my fields?",
    bgColor: "bg-[#FEF9C3]",
    textColor: "text-[#854D0E]",
  },
  {
    icon: "🧪",
    category: "Nutrient Timing",
    title: "What fertilizer computation should I use per hectare?",
    desc: "Basal Complete (14-14-14) and calibrated Urea split topdressing",
    prompt: "What is the recommended fertilizer dosage computation and timing schedule per hectare for my crops?",
    bgColor: "bg-[#E8F5E9]",
    textColor: "text-[#166534]",
  },
  {
    icon: "💧",
    category: "Water Optimization",
    title: "How do I optimize field water with PhilRice AWD tubes?",
    desc: "Alternate Wetting and Drying protocol to avoid nitrogen leaching",
    prompt: "How do I implement the PhilRice Alternate Wetting and Drying (AWD) tube protocol to conserve water?",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0369A1]",
  },
];

const STARTERS_FIL = [
  {
    icon: "🌾",
    category: "Palay at Paghahanda",
    title: "Paano ihanda ang lupa para sa tag-ulang pagtatanim?",
    desc: "Pag-aararo, pagpapatubig, at tamang barayti ng binhi",
    prompt: "Paano ang wastong paghahanda ng lupa sa palayan para sa tag-ulan at anong binhi ang angkop sa aming lugar?",
    bgColor: "bg-[#E8F5E9]",
    textColor: "text-[#166534]",
  },
  {
    icon: "🐛",
    category: "Peste at Sakit",
    title: "Paano sugpuin ang harabas (armyworm) at leaf blast?",
    desc: "Sintomas, bio-control, at wastong gamot sa pag-spray",
    prompt: "Paano matutukoy at masusugpo ang armyworm (harabas) at leaf blast sa aking mga pananim?",
    bgColor: "bg-[#FEF9C3]",
    textColor: "text-[#854D0E]",
  },
  {
    icon: "🧪",
    category: "Pag-aabono",
    title: "Ano ang tamang dosis ng pataba kada ektarya?",
    desc: "Iskedyul ng basal Complete (14-14-14) at Urea topdress",
    prompt: "Ano ang tamang kalkulasyon at iskedyul ng abono (Complete at Urea) bawat ektarya para sa aking pananim?",
    bgColor: "bg-[#E8F5E9]",
    textColor: "text-[#166534]",
  },
  {
    icon: "💧",
    category: "AWD Pagpapatubig",
    title: "Paano gamitin ang PhilRice AWD tubes sa patubig?",
    desc: "Alternate Wetting and Drying para makatipid at maiwasan ang leaching",
    prompt: "Paano ang tamang paggamit ng PhilRice AWD tubes sa pagpapatubig ng palay?",
    bgColor: "bg-[#E0F2FE]",
    textColor: "text-[#0369A1]",
  },
];

function cleanErrorMessage(raw: string): string {
  if (!raw) return "Grownox is currently unavailable. Please try again.";
  if (raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.includes("Quota exceeded") || raw.includes("quota")) {
    return "Grownox rate limit reached. Please wait a few seconds and try again.";
  }
  if (raw.includes("503") || raw.includes("UNAVAILABLE") || raw.includes("Overloaded")) {
    return "Grownox is currently in high demand. Please try again in a moment.";
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

function MarkdownViewer({ text }: { text: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopySnippet = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="text-sm sm:text-[15px] leading-relaxed text-[#26332A] dark:text-stone-100 font-sans space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-[#26332A] dark:text-white mt-4 mb-2 tracking-tight">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-[#166534] dark:text-emerald-400 mt-3.5 mb-1.5 tracking-tight flex items-center gap-1.5">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-bold text-[#26332A] dark:text-stone-200 mt-3 mb-1">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="leading-relaxed my-2 text-[#26332A] dark:text-stone-200 break-words">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-[#26332A] dark:text-white">
              {children}
            </strong>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1.5 my-2.5 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 my-2.5 pl-1 counter-reset-item">
              {children}
            </ol>
          ),
          li: ({ children, ...props }: any) => {
            const isOrdered = props.ordered;
            return (
              <li className="flex items-start gap-2.5 my-1 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] mt-2 shrink-0"></span>
                <span className="flex-1 min-w-0">{children}</span>
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#2E7D32] bg-[#E8F5E9]/60 dark:bg-emerald-950/20 p-3 my-2.5 rounded-r-xl text-xs sm:text-sm text-[#26332A] dark:text-stone-200">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded-xl border border-[#DDE5DE] dark:border-stone-800 shadow-2xs">
              <table className="w-full divide-y divide-[#DDE5DE] dark:divide-stone-800 text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#F0F4F1] dark:bg-stone-800 text-[#475549] dark:text-stone-300 font-semibold uppercase text-[11px] tracking-wider">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[#DDE5DE] dark:divide-stone-800 bg-white dark:bg-stone-900">
              {children}
            </tbody>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 text-left font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-[#26332A] dark:text-stone-200">{children}</td>
          ),
          code: ({ inline, className, children, ...props }: any) => {
            const codeString = String(children).replace(/\n$/, "");
            if (inline) {
              return (
                <code className="bg-[#F0F4F1] dark:bg-stone-800 text-[#166534] dark:text-emerald-400 px-1.5 py-0.5 rounded text-xs font-mono font-medium">
                  {children}
                </code>
              );
            }
            return (
              <div className="my-3 rounded-xl border border-[#DDE5DE] dark:border-stone-800 bg-[#F8FAF7] dark:bg-stone-950 text-[#26332A] dark:text-stone-100 overflow-hidden font-mono text-xs shadow-2xs">
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#F0F4F1] dark:bg-stone-900 border-b border-[#DDE5DE] dark:border-stone-800 text-[#6B756D] text-[11px]">
                  <span>Field Prescription / Data</span>
                  <button
                    type="button"
                    onClick={() => handleCopySnippet(codeString, 1)}
                    className="flex items-center gap-1 hover:text-[#26332A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedIndex === 1 ? (
                      <>
                        <Check className="h-3 w-3 text-[#2E7D32]" />
                        <span className="text-[#2E7D32] font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                  <code>{children}</code>
                </pre>
              </div>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default function Chat() {
  const { settings, t } = useSettings();
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

  // Auto-scroll to bottom on update
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

  // Auto-resize textarea smoothly with content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const targetHeight = Math.min(Math.max(scrollHeight, 38), 140);
      textareaRef.current.style.height = `${targetHeight}px`;
      textareaRef.current.style.overflowY = scrollHeight > 140 ? "auto" : "hidden";
    }
  }, [input]);

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
      textareaRef.current.style.height = "38px";
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

  const isFil = settings.language === "fil";
  const starters = isFil ? STARTERS_FIL : STARTERS_EN;

  const locationLabel = settings.cityName
    ? `${settings.cityName}${settings.provinceName ? `, ${settings.provinceName}` : ""}`
    : settings.provinceName || "Cabugao, Ilocos Sur";

  const cropsLabel = settings.preferredCrops && settings.preferredCrops.length > 0
    ? settings.preferredCrops.join(" & ")
    : "Rice & High-Value Crops";

  const userInitials = (settings.userName || "Eduardo Ramos")
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full w-full bg-[#F8FAF7] dark:bg-background text-[#26332A] dark:text-foreground overflow-hidden font-sans relative">

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* History Drawer - Clean Grownox Style */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        flex flex-col w-72 sm:w-80 bg-white dark:bg-stone-900 border-r border-[#DDE5DE] dark:border-stone-800
        transition-transform duration-200 ease-in-out shadow-xl
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#DDE5DE] dark:border-stone-800 bg-[#F8FAF7] dark:bg-stone-950">
          <div className="flex items-center gap-2">
            <GrownoxAiAvatar size="xs" />
            <span className="font-bold text-sm text-[#26332A] dark:text-white">
              {isFil ? "Kasaysayan ng Konsulta" : "Consultation History"}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-muted text-[#6B756D] hover:text-[#26332A] dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-[#DDE5DE] dark:border-stone-800">
          <Button
            onClick={startNewChat}
            className="w-full bg-[#2E7D32] hover:bg-[#1b5e20] text-white font-semibold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 h-9"
          >
            <Plus className="h-4 w-4" />
            <span>{isFil ? "Bagong Paksa / Chat" : "New Topic / Chat"}</span>
          </Button>
        </div>

        {/* Conversation List */}
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="px-2 pb-2 text-[10px] font-bold tracking-wider uppercase text-[#6B756D]">
            {isFil ? "Mga Nakaraang Pag-uusap" : "Recent Sessions"}
          </div>
          {conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-[#6B756D] space-y-2">
              <MessageSquare className="h-8 w-8 mx-auto text-[#DDE5DE] dark:text-stone-700" />
              <p>{isFil ? "Wala pang mga nakaraang pag-uusap." : "No previous consult sessions yet."}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map(conv => {
                const isActive = activeId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[#E8F5E9] text-[#166534] font-bold border border-[#C8E6C9] shadow-2xs"
                        : "text-[#26332A] dark:text-stone-300 hover:bg-[#F0F4F1] dark:hover:bg-stone-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[#2E7D32]" : "text-[#6B756D]"}`} />
                      <span className="truncate">{conv.title === "New Chat" && isFil ? "Bagong Chat" : conv.title}</span>
                    </div>
                    <button
                      onClick={e => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#D32F2F] text-[#6B756D] transition-opacity"
                      title={isFil ? "Burahin ang chat" : "Delete session"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-[#DDE5DE] dark:border-stone-800 bg-[#F8FAF7] dark:bg-stone-950">
          <div className="flex items-center gap-2 px-2 py-1 text-xs text-[#6B756D]">
            <div className="w-7 h-7 rounded-full bg-[#E8F5E9] text-[#166534] flex items-center justify-center font-bold text-xs border border-[#C8E6C9]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#26332A] dark:text-white truncate">
                {settings.userName || "Eduardo Ramos"}
              </p>
              <p className="text-[10px] text-[#6B756D] truncate">
                {locationLabel}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">

        {/* ==================== DEDICATED CHAT HEADER ==================== */}
        <header className="bg-white/90 dark:bg-stone-900/90 backdrop-blur border-b border-[#DDE5DE] dark:border-stone-800 shadow-2xs shrink-0 z-20">
          <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
            
            {/* Assistant Emblem & Identity */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <GrownoxAiAvatar size="md" showOnlineStatus={true} statusOnline={true} />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-sm sm:text-base text-[#26332A] dark:text-white tracking-tight">
                    Grownox
                  </h1>
                  <span className="hidden xs:inline-flex px-2 py-0.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-bold text-[10px] uppercase tracking-wider">
                    Grownox AI
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-[#6B756D] flex items-center gap-1.5 truncate">
                  <span>{isFil ? "AI Assistant sa Agrikultura" : "Agriculture AI Assistant"}</span>
                  <span className="inline-block w-1 h-1 rounded-full bg-[#707a6f]"></span>
                  <span className="text-[#2E7D32] font-semibold truncate">
                    {isFil ? `Iniakma para sa ${locationLabel}` : `Tailored for ${locationLabel}`}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* New Topic Button */}
              <button
                type="button"
                onClick={startNewChat}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DE] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#26332A] dark:text-stone-200 hover:bg-[#F0F4F1] dark:hover:bg-stone-700 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Start a new consultation topic"
              >
                <Plus className="h-3.5 w-3.5 text-[#2E7D32]" />
                <span className="hidden sm:inline">{isFil ? "Bagong Paksa" : "New Topic"}</span>
              </button>

              {/* History Drawer Toggle Button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(prev => !prev)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#DDE5DE] dark:border-stone-700 bg-white dark:bg-stone-800 text-[#26332A] dark:text-stone-200 hover:bg-[#F0F4F1] dark:hover:bg-stone-700 transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="View consultation history"
              >
                <History className="h-3.5 w-3.5 text-[#6B756D]" />
                <span className="hidden md:inline">{isFil ? "Kasaysayan" : "History"}</span>
              </button>

              {/* Quick Field Settings */}
              <button
                type="button"
                onClick={() => navigate("/settings")}
                className="w-8 h-8 rounded-xl border border-[#DDE5DE] dark:border-stone-700 flex items-center justify-center text-[#6B756D] hover:text-[#2E7D32] hover:bg-[#F0F4F1] dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Farm Station Settings"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

          </div>
        </header>

        {/* ==================== SCROLLABLE CHAT CANVAS ==================== */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 sm:px-6 py-4 sm:py-6 scroll-smooth">
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-32">

            {/* Context Tag / Field Geolocation Pill */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#166534] text-xs font-semibold shadow-2xs max-w-full text-center truncate">
                <span className="w-2 h-2 rounded-full bg-[#43A047] shrink-0 animate-pulse"></span>
                <span className="truncate">
                  {isFil ? "Pinag-uusapan:" : "Discussing:"} <strong>{cropsLabel}</strong> ({locationLabel} • Soil Clay-Loam)
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="ml-0.5 text-[#166534] hover:text-[#004b1e] shrink-0"
                  title="Change Field Context"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Empty State / Welcome Screen */}
            {!activeId && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 sm:py-10 max-w-3xl mx-auto text-center animate-in fade-in duration-300">
                
                {/* Large Grownox AI Avatar */}
                <div className="mb-4">
                  <GrownoxAiAvatar size="xl" showOnlineStatus={true} statusOnline={true} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#26332A] dark:text-white tracking-tight">
                    Grownox
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] border border-[#86EFAC] text-[#15803D] font-bold text-[10px] uppercase">
                    Grownox AI
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#6B756D] dark:text-stone-300 max-w-md mb-8 leading-relaxed">
                  {isFil
                    ? "Ang iyong AI Agronomy Assistant na nagbibigay ng praktikal na payo sa mga pananim ng Pilipinas, pagsugpo sa peste, at pamamahala ng sakahan."
                    : "Your AI Agronomy Assistant for Philippine crops, localized pest management, and farm guidance."}
                </p>

                {/* Suggested Inquiries Section */}
                <div className="w-full text-left">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B756D] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#2E7D32]" />
                      {isFil ? `Mga Rekomendadong Tanong para sa ${settings.cityName || "Pilipinas"}` : `Suggested Inquiries for ${locationLabel} Farmers`}
                    </span>
                    <span className="text-[11px] text-[#6B756D] hidden sm:inline">
                      {isFil ? "Pindutin para magtanong agad" : "Tap to ask instant question"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {starters.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => sendMessage(item.prompt)}
                        className="text-left p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-[#DDE5DE] dark:border-stone-800 hover:border-[#2E7D32] hover:bg-[#F8FAF8] dark:hover:bg-stone-850 transition-all duration-150 group shadow-2xs flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl ${item.bgColor} ${item.textColor} flex items-center justify-center flex-shrink-0 text-base shadow-2xs group-hover:scale-105 transition-transform`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B756D] block mb-0.5">
                              {item.category}
                            </span>
                            <span className="font-semibold text-xs sm:text-[13px] text-[#26332A] dark:text-stone-100 group-hover:text-[#2E7D32] dark:group-hover:text-emerald-400 transition-colors line-clamp-1 block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-[#6B756D] truncate block mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-[#BFC9BD] group-hover:text-[#2E7D32] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              /* Active Conversation Messages */
              messages.map(msg => (
                <div key={msg.id} className="space-y-1">
                  {msg.role === "user" ? (
                    /* USER MESSAGE */
                    <div className="flex justify-end gap-2.5 sm:gap-3 max-w-2xl ml-auto">
                      <div className="flex flex-col items-end min-w-0">
                        <div className="bg-[#2E7D32] text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-xs sm:text-sm font-normal leading-relaxed break-words">
                          {msg.content}
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-[#6B756D] mt-1 mr-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Sent from Field Station
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white dark:ring-stone-800">
                        {userInitials}
                      </div>
                    </div>
                  ) : (
                    /* GROWNOX AI RESPONSE */
                    <div className="flex items-start gap-2.5 sm:gap-3 max-w-3xl mr-auto w-full">
                      {/* Grownox AI Avatar beside response */}
                      <GrownoxAiAvatar size="sm" className="mt-1 shrink-0" />

                      {/* Response Container */}
                      <div className="flex-1 bg-white dark:bg-stone-900 border border-[#DDE5DE] dark:border-stone-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-[#26332A] dark:text-stone-100 min-w-0 break-words">
                        {/* Protocol Header Badge */}
                        <div className="flex items-center justify-between border-b border-[#DDE5DE] dark:border-stone-800 pb-2.5 mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#43A047] animate-pulse"></span>
                            <span className="font-bold text-xs sm:text-sm text-[#166534] dark:text-emerald-400">
                              Agronomic Diagnosis & Protocol
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-mono text-[#6B756D] bg-[#F0F4F1] dark:bg-stone-800 px-2 py-0.5 rounded">
                            Grownox AI
                          </span>
                        </div>

                        {/* Rich Markdown Response */}
                        <MarkdownViewer text={msg.content} />

                        {/* Quick Context Action Buttons */}
                        <div className="pt-3 mt-3 border-t border-[#DDE5DE] dark:border-stone-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate("/farming-plan")}
                              className="px-2.5 py-1 rounded-lg bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#166534] font-semibold text-xs flex items-center gap-1.5 transition-colors border border-[#A5D6A7] cursor-pointer"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{isFil ? "Itala sa Farm Planner" : "Log in Farm Planner"}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate("/tutorials")}
                              className="px-2.5 py-1 rounded-lg bg-[#F8FAF7] dark:bg-stone-800 hover:bg-[#F0F4F1] text-[#26332A] dark:text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-colors border border-[#DDE5DE] dark:border-stone-700 cursor-pointer"
                            >
                              <Video className="h-3.5 w-3.5 text-[#2E7D32]" />
                              <span>{isFil ? "Tingnan ang Mga Tutorial" : "View Agri Tutorials"}</span>
                            </button>
                          </div>

                          {/* Copy Action */}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="p-1.5 rounded-lg text-[#6B756D] hover:text-[#26332A] hover:bg-[#F0F4F1] dark:hover:bg-stone-800 text-xs flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                            title={isFil ? "Kopyahin ang reseta" : "Copy prescription notes"}
                          >
                            {copiedMsgId === msg.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-[#2E7D32]" />
                                <span className="text-[11px] text-[#2E7D32] font-semibold">{t.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="text-[11px]">{t.copy}</span>
                              </>
                            )}
                          </button>
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Streaming Indicator */}
            {streaming && (
              <div className="flex items-start gap-2.5 sm:gap-3 max-w-3xl mr-auto w-full">
                <GrownoxAiAvatar size="sm" className="mt-1 shrink-0" />
                <div className="flex-1 bg-white dark:bg-stone-900 border border-[#DDE5DE] dark:border-stone-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs text-[#26332A] dark:text-stone-100 min-w-0">
                  <div className="flex items-center justify-between border-b border-[#DDE5DE] dark:border-stone-800 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-ping"></span>
                      <span className="font-bold text-xs sm:text-sm text-[#166534] dark:text-emerald-400">
                        {isFil ? "Nagsusuri si Grownox..." : "Grownox Analyzing Field Context..."}
                      </span>
                    </div>
                  </div>

                  {streamingContent ? (
                    <MarkdownViewer text={streamingContent} />
                  ) : (
                    <div className="flex items-center gap-2 py-2 text-xs text-[#6B756D] font-medium">
                      <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-bounce" style={{ animationDelay: "300ms" }} />
                      <span className="ml-1 text-[#166534] font-semibold animate-pulse">
                        {isFil ? "Kumokonsulta sa Grownox AI..." : "Consulting agronomic database for your crops..."}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 rounded-xl text-xs flex items-center justify-between gap-3 max-w-full overflow-hidden break-words">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span className="flex-1 min-w-0 break-words">{cleanErrorMessage(error)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError(null);
                    const lastUser = [...messages].reverse().find(m => m.role === "user");
                    if (lastUser?.content) sendMessage(lastUser.content);
                  }}
                  className="h-7 px-2.5 text-xs shrink-0 border-rose-300 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/40 cursor-pointer"
                >
                  {isFil ? "Subukan Ulit" : "Retry"}
                </Button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ==================== FIXED FLOATING COMPOSER ==================== */}
        <footer className="fixed sm:sticky bottom-0 left-0 right-0 z-30 pointer-events-none pb-3 pt-2 bg-gradient-to-t from-[#F8FAF7] via-[#F8FAF7]/95 to-transparent dark:from-background dark:via-background/95">
          <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pointer-events-auto">
            
            {/* Rounded Composer Box */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-[#DDE5DE] dark:border-stone-800 shadow-md p-1.5 sm:p-2 transition-all focus-within:border-[#2E7D32] focus-within:ring-2 focus-within:ring-[#2E7D32]/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-end gap-1.5 sm:gap-2"
              >
                {/* Textarea Input */}
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={streaming}
                    rows={1}
                    placeholder={
                      aiReady
                        ? isFil
                          ? "Tanungin ang Grownox AI..."
                          : "Ask Grownox AI..."
                        : isFil
                        ? "Kumokonekta sa AI..."
                        : "Connecting to AI..."
                    }
                    className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none text-xs sm:text-sm text-[#26332A] dark:text-stone-100 placeholder-[#6B756D] py-2 px-2.5 outline-none resize-none leading-relaxed block overflow-y-hidden"
                    style={{ minHeight: "38px", maxHeight: "140px" }}
                  />
                </div>

                {/* Field Crop Context Pill */}
                <div className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase bg-[#F0F4F1] dark:bg-stone-800 text-[#475549] dark:text-stone-300 px-2.5 py-2 rounded-lg shrink-0 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43A047]"></span>
                  <span>{settings.preferredCrops?.[0] || "Block 2-A"}</span>
                </div>

                {/* Submit / Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || streaming}
                  className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs sm:text-sm shadow-xs transition-all shrink-0 cursor-pointer mb-0.5 ${
                    input.trim() && !streaming
                      ? "bg-[#2E7D32] hover:bg-[#1b5e20] text-white active:scale-95"
                      : "bg-[#F0F4F1] dark:bg-stone-800 text-[#6B756D] opacity-60 cursor-not-allowed"
                  }`}
                >
                  {streaming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">{isFil ? "Ipadala" : "Send"}</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Regulatory & Safety Disclaimer */}
            <div className="text-center mt-1.5">
              <p className="text-[10px] sm:text-[11px] text-[#6B756D] font-medium flex items-center justify-center gap-1.5 px-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F9A825] shrink-0"></span>
                <span className="truncate">
                  {isFil
                    ? "Nagbibigay ang Grownox ng gabay sa agrikultura para sa sanggunian. Kumonsulta sa lokal na eksperto para sa aplikasyon ng kemikal."
                    : "Grownox provides agronomic guidance for reference. Always consult local agricultural experts for field chemical applications."}
                </span>
              </p>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}
