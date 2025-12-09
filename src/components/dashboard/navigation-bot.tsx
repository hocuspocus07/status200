"use client";

import * as React from "react";
import { ArrowUp, Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

type Message = {
    id: string;
    from: "system" | "user" | "bot";
    text: string;
};

export function NavigationBot() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [messages, setMessages] = React.useState<Message[]>(() => [
        {
            id: "system",
            from: "system",
            text:
                "I can jump you to sections, explain your stats, and suggest what to complete next.",
        },
    ]);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement | null>(null);
    const [isTyping, setIsTyping] = React.useState(false);

    const quickActions = [
        "Show my credentials",
        "What should I complete next?",
        "Explain my skill score",
        "Show jobs I’m eligible for",
        "Summarize my progress",
    ];

    React.useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    function pushMessage(from: Message["from"], text: string) {
        setMessages((m) => [
            ...m,
            { id: String(Date.now()) + Math.random().toFixed(3), from, text },
        ]);
    }

    const routesMap: { keywords: string[]; path: string; reply?: string }[] = [
        {
            keywords: ["credential", "credentials", "my credentials", "show my credentials"],
            path: "/dashboard/my-credentials",
            reply: "Opening your credentials.",
        },
        {
            keywords: ["profile", "my profile", "show my profile"],
            path: "/dashboard/my-profile",
            reply: "Going to your profile.",
        },
        {
            keywords: ["inbox", "messages", "my inbox"],
            path: "/dashboard/inbox",
            reply: "Opening your inbox.",
        },
        {
            keywords: ["jobs posted", "jobs-posted", "posted jobs"],
            path: "/dashboard/jobs-posted",
            reply: "Showing jobs you've posted.",
        },
        {
            keywords: ["jobs", "show jobs", "eligible for jobs", "show jobs i'm eligible"],
            path: "/dashboard/jobs",
            reply: "Here are jobs for you.",
        },
        {
            keywords: ["learning path", "paths", "learning paths", "my pathways"],
            path: "/dashboard/my-pathways",
            reply: "Navigating to your learning paths.",
        },
        {
            keywords: ["network", "connections"],
            path: "/dashboard/network",
            reply: "Opening your network.",
        },
        {
            keywords: ["upload", "upload credential", "upload certificate"],
            path: "/dashboard/upload",
            reply: "Take me to the upload page.",
        },
        {
            keywords: ["certificates", "certificate", "my certificates"],
            path: "/dashboard/certificates",
            reply: "Showing certificates.",
        },
        {
            keywords: ["dashboard", "home"],
            path: "/dashboard",
            reply: "Going to the dashboard.",
        },
    ];

    function findRouteForText(text: string) {
        const normalized = text.toLowerCase();
        for (const entry of routesMap) {
            for (const kw of entry.keywords) {
                if (normalized.includes(kw)) {
                    return entry;
                }
            }
        }
        return null;
    }

    function sleep(ms: number) {
        return new Promise((res) => setTimeout(res, ms));
    }

    // bot simulation
    async function typeBotReply(fullText: string, charDelay = 18) {
        setIsTyping(true);
        const id = String(Date.now()) + Math.random().toFixed(3);
        setMessages((prev) => [...prev, { id, from: "bot", text: "" }]);

        for (let i = 1; i <= fullText.length; i++) {
            const partial = fullText.slice(0, i);
            setMessages((prev) =>
                prev.map((m) => (m.id === id ? { ...m, text: partial } : m))
            );
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            const lastChar = fullText[i - 1];
            const extra = /[.,!?]/.test(lastChar) ? 40 : 0;
            await sleep(charDelay + extra);
        }

        setIsTyping(false);
    }

    async function handleSendText(text: string) {
        const trimmed = text.trim();
        if (!trimmed || isTyping) return;

        pushMessage("user", trimmed);
        setMessage("");

        const match = findRouteForText(trimmed);

        // Special intents
        const lower = trimmed.toLowerCase();
        if (match) {
            await typeBotReply(match.reply ?? "Opening that for you.");
            await sleep(120);
            router.push(match.path);
            return;
        }

        if (lower.includes("what should i complete") || lower.includes("what should i complete next")) {
            await typeBotReply(
                "I recommend finishing any in-progress learning paths and uploading certificates for completed courses. Want me to open Learning Paths?"
            );
            return;
        }

        if (lower.includes("explain my skill") || lower.includes("explain skill score")) {
            await typeBotReply(
                "Your skill score aggregates verified certificates, endorsements and course progress. Open your profile to view the detailed breakdown."
            );
            return;
        }

        if (lower.includes("summarize") && lower.includes("progress")) {
            await typeBotReply(
                "You have 3 completed certificates, 1 in-progress learning path, and 2 recommended jobs. Open your dashboard to see more."
            );
            return;
        }

        await typeBotReply(
            "Sorry, I didn't quite get that. Try: 'Show my credentials', 'Open Inbox', 'Go to Learning Paths', or 'Show jobs I'm eligible for'."
        );
    }

    function handleQuickAction(label: string) {
        setMessage(label);
        setTimeout(() => handleSendText(label), 50);
    }

    function handleSubmit(e?: React.FormEvent) {
        e?.preventDefault();
        handleSendText(message);
    }

    return (
        <div className="fixed bottom-18 right-8 z-50 flex flex-col items-end gap-3">
            {/* Chatbox */}
            {open && (
                <Card className="w-[360px] overflow-y-scroll h-[520px] flex flex-col border border-slate-200/70 shadow-xl shadow-slate-900/5 bg-slate-950/95 text-slate-50 backdrop-blur-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/40">
                                <Bot className="h-5 w-5 text-emerald-400" />
                            </span>
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    Navigation Assistant
                                </CardTitle>
                                <p className="text-xs text-slate-400">
                                    Ask anything about your credentials & dashboard.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-full"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-3 pt-0">
                        <div className="flex-1 min-h-0">
                            <ScrollArea className="h-full pr-1">
                                <div className="flex flex-col gap-3 py-2 px-2">
                                    {messages.map((m) => (
                                        <div
                                            key={m.id}
                                            className={`max-w-[82%] ${m.from === "user" ? "self-end" : "self-start"
                                                }`}
                                            aria-live={m.from === "bot" ? "polite" : undefined}
                                        >
                                            <div
                                                className={`rounded-2xl px-3 py-2 break-words ${m.from === "user"
                                                    ? "bg-emerald-500 text-slate-950"
                                                    : m.from === "bot"
                                                        ? "bg-slate-900/80 border border-slate-800 text-slate-200"
                                                        : "bg-slate-900/60 text-slate-400"
                                                    }`}
                                            >
                                                <div className="text-sm">{m.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Quick actions */}
                        <div className="mt-1">
                            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-2">
                                Quick actions
                            </p>
                            <ScrollArea className="h-24 pr-1">
                                <div className="flex flex-wrap gap-2 px-2">
                                    {quickActions.map((label) => (
                                        <Button
                                            key={label}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs rounded-full border-slate-700/80 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-slate-50"
                                            onClick={() => handleQuickAction(label)}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Example state indicator */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <Badge
                                variant="outline"
                                className="border-emerald-500/40 text-emerald-300 bg-emerald-500/5 rounded-full px-2 py-0 text-[10px]"
                            >
                                Beta
                            </Badge>
                            <span>Connected to your dashboard context.</span>
                        </div>
                    </CardContent>

                    <CardFooter className="pt-2 border-t border-slate-800/80">
                        <form
                            className="flex items-center gap-2 w-full"
                            onSubmit={handleSubmit}
                        >
                            <Input
                                ref={inputRef}
                                className="h-10 text-sm bg-slate-900/70 border-slate-700/80 placeholder:text-slate-500 focus-visible:ring-emerald-500/60"
                                placeholder="Ask to navigate: e.g. “Go to Learning Paths”"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                aria-label="Navigation assistant input"
                                disabled={isTyping}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="h-10 w-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                                aria-label="Send"
                                disabled={isTyping}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Floating toggle button */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-2xl shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300/70"
                        onClick={() => setOpen((prev) => !prev)}
                        aria-expanded={open}
                        aria-label="Toggle navigation assistant"
                    >
                        <ArrowUp
                            className={`h-5 w-5 transition-transform duration-300 ${open ? "rotate-180" : ""
                                }`}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    Navigation Bot
                </TooltipContent>
            </Tooltip>
        </div>
    );
}