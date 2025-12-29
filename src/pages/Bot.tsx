import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { Play, Send, Sparkles, Video, LogIn, Pin, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { coachMedia } from "@/lib/coachMedia";

interface Msg { id: string; role: "user" | "assistant"; content: string }

const seedAssistant = `Kies je taal / Choose your language: Nederlands of English?

Yo! Ik ben je DNB Coach Bot. Zullen we starten met een korte intake?
- Wat is je doel (cut / bulk / recomp)?
- Huidig niveau & blessures?
- Hoeveel dagen per week wil je trainen en hoeveel tijd per sessie?
- Materiaal (gym / home / beperkt)?`;

function uid() { return Math.random().toString(36).slice(2) }

type Lang = 'nl' | 'en';

export default function Bot() {
  const [userCode, setUserCode] = useState<string>(localStorage.getItem("bot_user_code") || "");
  const [userName, setUserName] = useState<string>(localStorage.getItem("bot_user_name") || "");
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem("bot_user_code"));
  const [loginCode, setLoginCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [name, setName] = useState<string>(localStorage.getItem("bot_name") || "");
  const [inputName, setInputName] = useState(name);
  const [messages, setMessages] = useState<Msg[]>(() => {
    const saved = localStorage.getItem("bot_chat");
    return saved ? JSON.parse(saved) : [{ id: uid(), role: "assistant", content: seedAssistant }];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>((localStorage.getItem("bot_lang") as Lang) || 'nl');
  const [pinnedMessages, setPinnedMessages] = useState<Msg[]>(() => {
    const saved = localStorage.getItem("bot_pinned");
    return saved ? JSON.parse(saved) : [];
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => { localStorage.setItem("bot_chat", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (name) localStorage.setItem("bot_name", name); }, [name]);
  useEffect(() => { if (lang) localStorage.setItem("bot_lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("bot_pinned", JSON.stringify(pinnedMessages)); }, [pinnedMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function handleLogin() {
    if (!loginCode.trim()) {
      toast.error("Please enter a code");
      return;
    }
    
    setLoginLoading(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: loginCode.trim(), validateOnly: true }),
      });
      const data = await resp.json().catch(() => ({}));
      
      if (!resp.ok || !data.valid) {
        throw new Error(data.message || "Invalid or expired code");
      }
      
      localStorage.setItem("bot_user_code", loginCode.trim());
      localStorage.setItem("bot_user_name", data.userName || "");
      setUserCode(loginCode.trim());
      setUserName(data.userName || "");
      setAuthenticated(true);
      toast.success(`Welcome, ${data.userName}!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid code';
      toast.error(msg);
    } finally {
      setLoginLoading(false);
    }
  }

  async function send(msg?: string) {
    const text = (msg ?? input).trim();
    if (!text) return;
    const next: Msg = { id: uid(), role: "user", content: text };
    setMessages(m => [...m, next]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode, name: userName || name, lang, messages: [...messages, next].map(({ role, content }) => ({ role, content })) }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.message || "Chat failed");
      const content: string = data.message ?? "";
      setMessages(m => [...m, { id: uid(), role: "assistant", content }]);
    } catch (e: unknown) {
      console.error(e);
      const msg = e instanceof Error ? e.message : 'Er ging iets mis. Probeer later opnieuw.';
      toast(msg);
    } finally {
      setLoading(false);
    }
  }

  const assistantBlocks = useMemo(() => messages.map(m => ({ ...m, blocks: parseBlocks(m.content) })), [messages]);
  const pinnedBlocks = useMemo(() => pinnedMessages.map(m => ({ ...m, blocks: parseBlocks(m.content) })), [pinnedMessages]);

  function togglePin(msg: Msg) {
    setPinnedMessages(prev => {
      const exists = prev.find(p => p.id === msg.id);
      if (exists) {
        return prev.filter(p => p.id !== msg.id);
      } else {
        return [...prev, msg];
      }
    });
  }

  function isPinned(msgId: string) {
    return pinnedMessages.some(p => p.id === msgId);
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn size={24} /> Bot Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your access code to use the DNB Coach Bot.
            </p>
            <div>
              <Label htmlFor="code">Access Code</Label>
              <Input
                id="code"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter your code"
                className="uppercase font-mono"
              />
            </div>
            <Button onClick={handleLogin} disabled={loginLoading} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">DNB Coach Bot</h1>
            <p className="text-muted-foreground">Persoonlijk plan • Voeding • Mindset • Progressie • Community</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Jouw naam (optioneel)"
              value={inputName}
              onChange={e => setInputName(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" onClick={() => setName(inputName.trim())}>Opslaan</Button>
            <div className="flex items-center gap-1">
              <LangButton active={lang==='nl'} onClick={() => setLang('nl')}>NL</LangButton>
              <LangButton active={lang==='en'} onClick={() => setLang('en')}>EN</LangButton>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {pinnedMessages.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Pin size={14} /> Pinned Messages
                </h3>
                <div className="space-y-2">
                  {pinnedBlocks.map(m => (
                    <div key={m.id} className="rounded-xl border border-primary/30 bg-card p-4 relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => togglePin(m)}
                      >
                        <X size={14} />
                      </Button>
                      <div className="pr-8">
                        {m.blocks.map((b, i) =>
                          b.type === "video" ? (
                            <VideoBlock key={i} id={b.id} />
                          ) : (
                            <p key={i} className="whitespace-pre-wrap leading-relaxed text-sm">{b.text}</p>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4 h-[70vh] flex flex-col">
              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {assistantBlocks.map(m => (
                  <MessageBubble key={m.id} role={m.role} onPin={() => togglePin(m)} isPinned={isPinned(m.id)}>
                    {m.blocks.map((b, i) =>
                      b.type === "video" ? (
                        <VideoBlock key={i} id={b.id} />
                      ) : (
                        <p key={i} className="whitespace-pre-wrap leading-relaxed">{b.text}</p>
                      )
                    )}
                  </MessageBubble>
                ))}
                {loading && <MessageBubble role="assistant"><p>Even denken…</p></MessageBubble>}
                <div ref={bottomRef} />
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex gap-2 flex-wrap">
                  <QuickAction onClick={() => send("Maak een persoonlijk trainingsplan voor mij.")}>Trainingsplan</QuickAction>
                  <QuickAction onClick={() => send("Bereken mijn macro's voor cut/bulk met voorbeeld dagmenu.")}>Macro's + menu</QuickAction>
                  <QuickAction onClick={() => send("Dagelijkse check-in: hoe ging het vandaag?")}>Check-in</QuickAction>
                  <QuickAction onClick={() => send("Ik mis motivatie")}>Motivatie</QuickAction>
                </div>

                <div className="flex items-end gap-2">
                  {isMobile ? (
                    <Textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Typ je bericht…"
                      className="min-h-[44px]"
                    />
                  ) : (
                    <Input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Typ je bericht…"
                    />
                  )}
                  <Button onClick={() => send()} disabled={loading} className="shrink-0" variant="hero">
                    <Send className="mr-2" size={16} /> Stuur
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border bg-card/50 p-4">
              <h3 className="font-semibold mb-2">Gamification</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Consistentie: 0 dagen streak</li>
                <li>PR badges: 0</li>
                <li>Weekscore: 0%</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-card/50 p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Sparkles size={16}/> Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                <li>Begin met je doel en beschikbaarheid.</li>
                <li>De bot past je plan automatisch aan.</li>
                <li>Typ "intake" om opnieuw te starten.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ role, children, onPin, isPinned }: { role: "user"|"assistant"; children: React.ReactNode; onPin?: () => void; isPinned?: boolean }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}> 
      <div className={cn(
        "max-w-[85%] rounded-lg px-4 py-3 text-sm shadow-sm relative",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted/30 border border-border"
      )}>
        {children}
        {!isUser && onPin && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute -top-2 -right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
              isPinned && "opacity-100"
            )}
            onClick={onPin}
            title={isPinned ? "Unpin" : "Pin this message"}
          >
            <Pin size={14} className={cn(isPinned && "fill-current")} />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuickAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <Button onClick={onClick} variant="outline" size="sm" className="rounded-full">
      {children}
    </Button>
  );
}

function LangButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button onClick={onClick} variant={active ? 'hero' : 'outline'} size="sm" className="rounded-full px-3">
      {children}
    </Button>
  );
}

function parseBlocks(text: string): Array<{type: 'text'; text: string} | {type:'video'; id: keyof typeof coachMedia}> {
  const parts: Array<{type: 'text'; text: string} | {type:'video'; id: keyof typeof coachMedia}> = [];
  const re = /\[video:([a-zA-Z0-9_-]+)\]/g;
  let lastIndex = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > lastIndex) parts.push({ type: 'text', text: text.slice(lastIndex, m.index) });
    const id = m[1] as keyof typeof coachMedia;
    if (coachMedia[id]) parts.push({ type: 'video', id });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push({ type: 'text', text: text.slice(lastIndex) });
  return parts;
}

function VideoBlock({ id }: { id: keyof typeof coachMedia }) {
  const media = coachMedia[id];
  if (!media) return null;
  return (
    <div className="my-2">
      <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground"><Video size={14}/> Coach video: {media.title}</div>
      {media.type === 'youtube' && (
        <div className="aspect-video w-full rounded-lg overflow-hidden border">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${media.youtubeId}`}
            title={media.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}