import { useState, useEffect } from "react";

const FORM_ID = "mjgareey";
const MAX_SPOTS = 30;

const PROJECTS = [
  {
    icon: "⚙️",
    name: "CLI Task Manager",
    day: "Day 1",
    desc: "Build a fully working command-line task manager from scratch. Add, complete, and delete tasks — stored in memory, driven by os.Args.",
    tags: ["slices", "functions", "os.Args", "error handling"],
  },
  {
    icon: "🕷️",
    name: "Concurrent Web Scraper",
    day: "Day 2",
    desc: "Fetch 6 live websites in parallel with goroutines. Extract titles, count words, handle failures gracefully, print a sorted timing report.",
    tags: ["goroutines", "channels", "WaitGroup", "net/http"],
  },
  {
    icon: "🔗",
    name: "URL Shortener API",
    day: "Day 2 — Capstone",
    desc: "A production-structured REST API. Shorten URLs, redirect, track click counts, log every request. Real endpoints, real JSON, real middleware.",
    tags: ["REST API", "JSON", "routing", "middleware", "RWMutex"],
    isCapstone: true,
  },
];

const SCHEDULE = [
  {
    day: "Day 1",
    label: "The Foundations",
    color: "#00ACD7",
    modules: [
      { time: "9:00 AM", title: "Welcome to the Forge", sub: "Go's origin, philosophy, why Go exists" },
      { time: "9:30 AM", title: "Setup & Hello, Gopher!", sub: "Install, VS Code, go mod init, first program" },
      { time: "10:00 AM", title: "Variables, Types & Constants", sub: "Declarations, zero values, type safety, iota" },
      { time: "11:00 AM", title: "Control Flow", sub: "for loops, switch, defer — the Go way" },
      { time: "12:00 PM", title: "Functions & Error Handling", sub: "Multiple returns, errors, closures, first-class functions" },
      { time: "1:30 PM", title: "Arrays, Slices & Maps", sub: "Internals, append, shared arrays, comma-ok" },
      { time: "2:30 PM", title: "🔨 Project #1: CLI Task Manager", sub: "Build it from scratch — all Day 1 concepts combined" },
    ],
  },
  {
    day: "Day 2",
    label: "The Real World",
    color: "#00D7A0",
    modules: [
      { time: "9:00 AM", title: "Structs & Interfaces", sub: "Methods, pointer receivers, implicit satisfaction, embedding" },
      { time: "10:00 AM", title: "Goroutines & Channels", sub: "Concurrency model, WaitGroup, select, Mutex" },
      { time: "11:00 AM", title: "Packages & Modules", sub: "Visibility, go.mod, stdlib tour, package design rules" },
      { time: "11:30 AM", title: "🕷️ Project #2: Concurrent Web Scraper", sub: "Fan-out pattern, live URLs, per-URL error handling" },
      { time: "1:00 PM", title: "Building REST APIs with net/http", sub: "Routing, JSON, status codes, middleware" },
      { time: "2:30 PM", title: "🏆 Capstone: URL Shortener API", sub: "4-file architecture, full CRUD, logging, CORS — ship it" },
    ],
  },
];

export default function RegistrationPage() {
  const [spotsLeft, setSpotsLeft] = useState(MAX_SPOTS);
  const [storageReady, setStorageReady] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | full | error
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  // Load spots count from persistent storage
  useEffect(() => {
    const loadSpots = async () => {
      try {
        const result = await window.storage.get("forge-registrations", true);
        const taken = parseInt(result.value || "0", 10);
        setSpotsLeft(Math.max(0, MAX_SPOTS - taken));
        if (taken >= MAX_SPOTS) setStatus("full");
      } catch {
        setSpotsLeft(MAX_SPOTS);
      }
      setStorageReady(true);
    };
    loadSpots();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === "full" || status === "submitting" || status === "success") return;

    setStatus("submitting");

    try {
      // Check spots again before submitting
      let currentTaken = 0;
      try {
        const check = await window.storage.get("forge-registrations", true);
        currentTaken = parseInt(check.value || "0", 10);
      } catch {}

      if (currentTaken >= MAX_SPOTS) {
        setStatus("full");
        setSpotsLeft(0);
        return;
      }

      // Submit to Formspree
      const res = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          bootcamp: "Gopher's Forge — A Weekend with Go",
          _subject: `New Registration: ${form.name} joined Gopher's Forge!`,
          _replyto: form.email,
        }),
      });

      if (!res.ok) throw new Error("Formspree error");

      // Increment stored count
      const newTaken = currentTaken + 1;
      await window.storage.set("forge-registrations", String(newTaken), true);
      setSpotsLeft(Math.max(0, MAX_SPOTS - newTaken));
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  const spotPercent = ((MAX_SPOTS - spotsLeft) / MAX_SPOTS) * 100;
  const urgency = spotsLeft <= 5 ? "critical" : spotsLeft <= 10 ? "low" : "normal";

  return (
    <div style={{ background: "#0a0c12", minHeight: "100vh", color: "#e8ecf5", fontFamily: "'Lora', serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .forge-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 10px; padding: 16px 32px; border-radius: 10px;
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700;
          cursor: pointer; border: none; transition: all 0.2s; width: 100%;
        }
        .forge-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,172,215,0.3); }
        .forge-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

        .forge-input {
          width: 100%; padding: 14px 18px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          color: #e8ecf5; font-family: 'Lora', serif; font-size: 16px;
          outline: none; transition: border-color 0.2s;
        }
        .forge-input:focus { border-color: #00ACD7; }
        .forge-input::placeholder { color: #4a5568; }

        .pill {
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          padding: 4px 12px; border-radius: 999px;
          background: rgba(0,172,215,0.12); color: #00ACD7;
          border: 1px solid rgba(0,172,215,0.25);
        }
        .pill.teal { background: rgba(0,215,160,0.12); color: #00D7A0; border-color: rgba(0,215,160,0.25); }
        .pill.amber { background: rgba(245,166,35,0.12); color: #F5A623; border-color: rgba(245,166,35,0.25); }
        .pill.purple { background: rgba(180,142,247,0.12); color: #B48EF7; border-color: rgba(180,142,247,0.25); }

        .module-row { display: flex; gap: 16px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid rgba(37,42,56,0.6); }
        .module-row:last-child { border-bottom: none; }

        .progress-bar { height: 6px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(0,172,215,0.2); } 50% { box-shadow: 0 0 40px rgba(0,172,215,0.5); } }

        .hero-glow { animation: glow 3s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.6s ease forwards; }
        .urgent-pulse { animation: pulse 1.5s ease-in-out infinite; }

        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #0a0c12; }
        ::-webkit-scrollbar-thumb { background: #252a38; border-radius: 3px; }
      `}</style>

      {/* ── HERO STRIPE ── */}
      <div style={{ height: 4, background: "linear-gradient(90deg, #00ACD7, #00D7A0, #B48EF7, #F5A623)" }} />

      {/* ── NAV ── */}
      <nav style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1e28", position: "sticky", top: 0, background: "rgba(10,12,18,0.95)", backdropFilter: "blur(16px)", zIndex: 100 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16 }}>
          Gopher's <span style={{ color: "#00ACD7" }}>Forge</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {storageReady && (
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: spotsLeft === 0 ? "#FF6B6B" : urgency === "critical" ? "#F5A623" : "#00D7A0" }}>
              {spotsLeft === 0 ? "BOOTCAMP FULL" : `${spotsLeft} spots left`}
            </div>
          )}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: "5px 14px", background: "rgba(0,172,215,0.1)", border: "1px solid rgba(0,172,215,0.25)", borderRadius: 999, color: "#00ACD7" }}>
            A Weekend with Go
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px" }}>

        {/* ── HERO ── */}
        <section style={{ padding: "80px 0 60px", textAlign: "center" }}>
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#00D7A0", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Limited to 30 students · Live Bootcamp
            </span>
          </div>
          <h1 className="fade-up" style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(40px, 7vw, 76px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.03em", marginBottom: 24, animationDelay: "0.1s", opacity: 0, animationFillMode: "forwards" ,color: "#e8ecf5"}}>
            Gopher's Forge<br/>
            <span style={{ background: "linear-gradient(135deg, #00ACD7, #00D7A0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              A Weekend with Go
            </span>
          </h1>
          <p className="fade-up" style={{ fontFamily: "'Lora', serif", fontSize: 20, color: "#7a859e", fontStyle: "italic", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7, animationDelay: "0.2s", opacity: 0, animationFillMode: "forwards" }}>
            Go from zero to shipping a real REST API in two days.
            No fluff. No framework magic. Just Go, the compiler, and you.
          </p>

          {/* SPOTS COUNTER */}
          <div className="fade-up hero-glow" style={{ background: "rgba(13,15,20,0.8)", border: `1px solid ${urgency === "critical" ? "rgba(245,166,35,0.4)" : "rgba(0,172,215,0.25)"}`, borderRadius: 16, padding: "24px 32px", maxWidth: 400, margin: "0 auto", animationDelay: "0.3s", opacity: 0, animationFillMode: "forwards" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#7a859e", marginBottom: 4 }}>SEATS AVAILABLE</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 48, fontWeight: 800, lineHeight: 1, color: spotsLeft === 0 ? "#FF6B6B" : urgency === "critical" ? "#F5A623" : "#00D7A0" }} className={urgency === "critical" && spotsLeft > 0 ? "urgent-pulse" : ""}>
                  {storageReady ? spotsLeft : "—"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#7a859e" }}>of {MAX_SPOTS} total</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#7a859e" }}>{MAX_SPOTS - spotsLeft} registered</div>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${spotPercent}%`, background: urgency === "critical" ? "#F5A623" : spotsLeft === 0 ? "#FF6B6B" : "linear-gradient(90deg, #00ACD7, #00D7A0)" }} />
            </div>
            {urgency === "critical" && spotsLeft > 0 && (
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#F5A623", marginTop: 10, textAlign: "center" }}>
                ⚡ Only {spotsLeft} seats left — don't wait
              </div>
            )}
          </div>
        </section>

        {/* ── WHAT YOU'LL BUILD ── */}
        <section style={{ paddingBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em",color: "#e8ecf5" }}>What You'll Build</h2>
            <div style={{ flex: 1, height: 1, background: "#1a1e28" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {PROJECTS.map((p) => (
              <div key={p.name} style={{ background: "rgba(19,22,30,0.8)", border: `1px solid ${p.isCapstone ? "rgba(180,142,247,0.3)" : "#1a1e28"}`, borderRadius: 14, padding: 24, position: "relative", overflow: "hidden" }}>
                {p.isCapstone && <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: "3px 10px", borderRadius: 999, background: "rgba(180,142,247,0.15)", color: "#B48EF7", border: "1px solid rgba(180,142,247,0.3)" }}>CAPSTONE</div>}
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#00D7A0", marginBottom: 8 }}>{p.day}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, marginBottom: 10 }}>{p.name}</h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#7a859e", lineHeight: 1.6, marginBottom: 14 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {p.tags.map((t) => <span key={t} className="pill">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SCHEDULE ── */}
        <section style={{ paddingBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em",color: "#e8ecf5" }}>Weekend Schedule</h2>
            <div style={{ flex: 1, height: 1, background: "#1a1e28" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {SCHEDULE.map((day) => (
              <div key={day.day} style={{ background: "rgba(19,22,30,0.8)", border: "1px solid #1a1e28", borderRadius: 14, overflow: "hidden" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #1a1e28", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: day.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800 }}>{day.day}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7a859e" }}>{day.label}</div>
                  </div>
                </div>
                <div style={{ padding: "8px 24px 16px" }}>
                  {day.modules.map((m) => (
                    <div key={m.title} className="module-row">
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#7a859e", minWidth: 60, paddingTop: 2 }}>{m.time}</div>
                      <div>
                        <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.title}</div>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#7a859e", lineHeight: 1.4 }}>{m.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── INSTRUCTOR BIO ── */}
        <section style={{ paddingBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em",color: "#e8ecf5" }}>Your Instructor</h2>
            <div style={{ flex: 1, height: 1, background: "#1a1e28" }} />
          </div>
          <div style={{ background: "rgba(19,22,30,0.8)", border: "1px solid #1a1e28", borderRadius: 14, padding: 32, display: "flex", gap: 28, alignItems: "flex-start" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #00ACD7, #00D7A0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              A
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Anas</h3>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#00D7A0", marginBottom: 16 }}>Nextera Education · Go Instructor</div>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#7a859e", lineHeight: 1.8, marginBottom: 16 }}>
                Build-first teacher who believes the best way to learn a language is to ship something with it on day one. 
                This bootcamp is designed around that philosophy — every concept introduced with a real use case, 
                every module ending with working code you wrote yourself.
              </p>
              <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#7a859e", lineHeight: 1.8, fontStyle: "italic" }}>
                "The compiler is your most honest friend. It tells you exactly what's wrong, every time, for free."
              </p>
            </div>
          </div>
        </section>

        {/* ── REGISTRATION FORM ── */}
        <section style={{ paddingBottom: 80 }} id="register">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.01em",color: "#e8ecf5" }}>Claim Your Spot</h2>
            <div style={{ flex: 1, height: 1, background: "#1a1e28" }} />
          </div>

          <div style={{ background: "rgba(19,22,30,0.8)", border: "1px solid rgba(0,172,215,0.2)", borderRadius: 16, padding: 40, maxWidth: 520, margin: "0 auto" }}>

            {/* SUCCESS */}
            {status === "success" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, marginBottom: 12, color: "#00D7A0" }}>You're in the Forge!</h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#7a859e", lineHeight: 1.7, marginBottom: 16 }}>
                  Your spot is confirmed. Check your email — a confirmation is on its way to <strong style={{ color: "#e8ecf5" }}>{form.email}</strong>.
                </p>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 15, color: "#7a859e", fontStyle: "italic" }}>
                  See you on Day 1, Gopher. Come hungry. 🔨
                </p>
              </div>
            )}

            {/* FULL */}
            {status === "full" && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>😤</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 12, color: "#FF6B6B" }}>Bootcamp is Full</h3>
                <p style={{ fontFamily: "'Lora', serif", fontSize: 16, color: "#7a859e", lineHeight: 1.7 }}>
                  All 30 spots are taken. Keep an eye out for the next cohort — the Forge runs again.
                </p>
              </div>
            )}

            {/* FORM */}
            {status !== "success" && status !== "full" && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#7a859e" }}>FULL NAME</label>
                  <input className="forge-input" name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 8, color: "#7a859e" }}>EMAIL ADDRESS</label>
                  <input className="forge-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>

                <button className="forge-btn" type="submit" disabled={status === "submitting" || !storageReady} style={{ background: spotsLeft === 0 ? "#252a38" : "linear-gradient(135deg, #00ACD7, #00D7A0)", color: spotsLeft === 0 ? "#7a859e" : "#0a0c12", marginBottom: 16 }}>
                  {status === "submitting" ? "Claiming your spot..." : spotsLeft === 0 ? "Bootcamp Full" : `Reserve My Spot — ${spotsLeft} Left`}
                </button>

                {status === "error" && (
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#FF6B6B", textAlign: "center" }}>
                    Something went wrong. Make sure the Formspree form ID is configured.
                  </p>
                )}

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#4a5568", textAlign: "center", lineHeight: 1.6 }}>
                  No spam. Your email is only used to confirm your seat and send you bootcamp details.
                </p>
              </form>
            )}
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #1a1e28", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 14 }}>Gopher's <span style={{ color: "#00ACD7" }}>Forge</span></div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#4a5568" }}>Built with 🔨 and Go · Nextera Education</div>
      </div>
    </div>
  );
}
