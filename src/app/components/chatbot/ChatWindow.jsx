"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";
import { FaCameraRetro } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";

const CHAT_SESSION_KEY = "photography_workshop_chat_session_id";

const API_BASE =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "")) ||
  "http://localhost:5000";

const CHAT_URL = `${API_BASE}/chat`;

function ChatWindow({ onClose }) {
  //   const { toast } = useToast();

  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(CHAT_SESSION_KEY);
      return stored?.trim() || null;
    } catch {
      return null;
    }
  });

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your workshop assistant. Ask me about registration, payment, schedule, or photography workshop details.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const body = {
      messages: [userMessage],
    };
    if (sessionId) {
      body.sessionId = sessionId;
    }

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errText =
          typeof data?.error === "string"
            ? data.error
            : "Failed to get AI response";
        throw new Error(errText);
      }

      if (typeof data?.reply !== "string" || !data.reply.trim()) {
        throw new Error("Empty response from assistant.");
      }

      if (typeof data.sessionId === "string" && data.sessionId.trim()) {
        const nextId = data.sessionId.trim();
        setSessionId(nextId);
        try {
          localStorage.setItem(CHAT_SESSION_KEY, nextId);
        } catch {
          /* ignore */
        }
      }

      const assistantMessage = { role: "assistant", content: data.reply.trim() };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't reach the assistant right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="h-[min(620px,calc(100vh-2rem))] w-[calc(100vw-2.5rem)] overflow-hidden rounded-sm border border-[#F07A10]/25 bg-[#071020] shadow-[0_24px_80px_rgba(0,0,0,0.58)] sm:w-[410px]">
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(240,100,0,0.18),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(20,70,180,0.18),transparent_40%),linear-gradient(180deg,#0B1628_0%,#071020_100%)]">
      <span className="pointer-events-none absolute right-0 top-0 bottom-0 w-[5px] bg-[repeating-linear-gradient(to_bottom,#060E1A_0px,#060E1A_5px,rgba(240,122,16,0.18)_5px,rgba(240,122,16,0.18)_7px,#060E1A_7px,#060E1A_13px)]" />
      <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l border-t border-[#F07A10]/60" />
      <span className="pointer-events-none absolute bottom-3 right-4 h-5 w-5 border-b border-r border-[#F07A10]/60" />
      {/* Header */}
      <div className="relative border-b border-[#F07A10]/15 p-4">
        <div className="absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-[#F07A10]/55 to-transparent" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#F07A10]/35 bg-[#F07A10]/10 text-[#F07A10]">
              <FaCameraRetro className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[#F07A10]">
                Workshop Help
              </p>
              <h3 className="truncate font-semibold text-white">
                FocusCraft Assistant
              </h3>
            </div>
          </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
            className="h-9 w-9 shrink-0 rounded-full text-white/80 hover:bg-[#F07A10]/10 hover:text-[#F07A10]"
            aria-label="Close chat"
        >
          <X className="h-4 w-4" />
        </Button>
        </div>
      </div>

      {/* Messages — native scroll so ref + scrollTop work; min-h-0 lets flex child shrink */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#071020]/55 p-4"
      >
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                  message.role === "user"
                    ? "rounded-br-sm bg-[#F07A10] text-[#071020] shadow-orange-950/20"
                    : "rounded-bl-sm border border-[#F07A10]/15 bg-[#0E1D35] text-white/90 shadow-black/20"
                }`}
              >
                {message.role !== "user" && (
                  <span className="mb-1 flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-[#F07A10]">
                    <Bot className="h-3 w-3" />
                    Assistant
                  </span>
                )}
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#F07A10]/15 bg-[#0E1D35] px-4 py-3 text-sm text-white/90">
                <Loader2 className="h-4 w-4 animate-spin text-[#F07A10]" />
                Typing...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[#F07A10]/15 bg-[#0B1628]/95 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            className="h-11 rounded-sm border-[#F07A10]/20 bg-[#1A2A40] px-4 text-white placeholder:text-[#4A6080] focus-visible:border-[#F07A10]/60 focus-visible:ring-[#F07A10]/20"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the workshop..."
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-sm bg-[#F07A10] text-[#071020] hover:bg-[#ff8a22] disabled:bg-[#4A6080]"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[0.65rem] text-[#4A6080]">
          Responses are generated by the workshop assistant.
        </p>
      </div>
      </div>
    </div>
  );
}

export default ChatWindow;
