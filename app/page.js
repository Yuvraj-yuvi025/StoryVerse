"use client";

import { useMemo, useState } from "react";

const genres = ["Fantasy", "Science Fiction", "Mystery", "Thriller", "Adventure", "Horror", "Romance"];
const examples = ["A city where memories are currency", "The last human on Mars receives a message", "A hidden kingdom beneath Bengaluru"];

export default function Home() {
  const [theme, setTheme] = useState("");
  const [genre, setGenre] = useState("Fantasy");
  const [chapters, setChapters] = useState([]);
  const [decision, setDecision] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("story");

  const latestMemory = useMemo(() => {
    const text = chapters.at(-1)?.text || "";
    const match = text.match(/STORY MEMORY:[\s\S]*$/i);
    return match ? match[0].replace(/STORY MEMORY:/i, "").trim() : "Your characters and key events will appear here as the story unfolds.";
  }, [chapters]);

  async function createChapter(isFirst, chosenDecision = "") {
    if (!theme.trim()) { setError("Give your story a theme to begin."); return; }
    setLoading(true); setError("");
    try {
      const recent = chapters.slice(-2).map((c) => c.text).join("\n\n");
      const context = recent.length > 6500 ? recent.slice(-6500) : recent;
      const response = await fetch("/api/story", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, genre, context, decision: chosenDecision, isFirst }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create your story.");
      setChapters((old) => [...old, { text: data.story, decision: chosenDecision }]);
      setDecision(""); setActiveTab("story");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  function restart() {
    setChapters([]); setDecision(""); setError(""); setActiveTab("story");
  }

  return (
    <main className="shell">
      <nav className="topbar">
        <a className="brand" href="#top"><span className="brand-mark">✦</span> storyverse<span className="brand-dot">.</span></a>
        <div className="nav-right"><span className="status"><i /> AI STORY ENGINE</span><a className="github-link" href="https://github.com/Yuvraj-yuvi025/StoryVerse" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </nav>

      <section className="hero" id="top">
        <div className="eyebrow"><span /> YOUR WORLD. YOUR RULES.</div>
        <h1>Every choice writes<br /><em>a new story.</em></h1>
        <p className="hero-copy">Step into a world shaped by your imagination. Create the setting, make the calls, and see where the story takes you.</p>
      </section>

      <section className="workspace">
        <div className="main-panel">
          {!chapters.length ? (
            <div className="create-card">
              <div className="section-kicker">01 <span>THE BEGINNING</span></div>
              <h2>What story are we telling?</h2>
              <p className="muted">Start with a spark. We’ll build the universe around it.</p>
              <label className="field-label" htmlFor="theme">YOUR STORY IDEA</label>
              <textarea id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} maxLength={500} placeholder="A world where dreams can be bought and sold..." rows={3} />
              <div className="examples">{examples.map((x) => <button key={x} onClick={() => setTheme(x)}>{x} ↗</button>)}</div>
              <label className="field-label genre-label">CHOOSE YOUR GENRE</label>
              <div className="genre-grid">{genres.map((g) => <button key={g} className={genre === g ? "genre active" : "genre"} onClick={() => setGenre(g)}>{g}</button>)}</div>
              {error && <div className="error">{error}</div>}
              <button className="primary-btn" disabled={loading} onClick={() => createChapter(true)}>{loading ? <><span className="loader" /> Building your world...</> : <>Create my story <span>↗</span></>}</button>
              <div className="privacy-note">✦ &nbsp;Your adventure is yours. Progress stays in this browser session.</div>
            </div>
          ) : (
            <div className="story-panel">
              <div className="story-toolbar"><div><div className="section-kicker">YOUR ADVENTURE</div><h2>{theme}</h2><span className="story-meta">{genre} <b>·</b> {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}</span></div><button className="reset-btn" onClick={restart}>↺ New story</button></div>
              <div className="tabs"><button className={activeTab === "story" ? "tab selected" : "tab"} onClick={() => setActiveTab("story")}>Chapters <span>{chapters.length}</span></button><button className={activeTab === "memory" ? "tab selected" : "tab"} onClick={() => setActiveTab("memory")}>Story memory</button></div>
              {activeTab === "story" ? <div className="chapters">{chapters.map((chapter, i) => <article className="chapter" key={i}><div className="chapter-label">CHAPTER {String(i + 1).padStart(2, "0")}</div>{chapter.decision && <div className="decision-note">Your choice: {chapter.decision}</div>}<div className="chapter-text">{chapter.text}</div></article>)}</div> : <div className="memory-card"><div className="memory-icon">✧</div><h3>The world so far</h3><p>{latestMemory}</p></div>}
              {error && <div className="error">{error}</div>}
              <div className="decision-box"><div className="section-kicker">THE NEXT MOVE</div><h3>Where should the story go?</h3><p className="muted">Choose one of the AI’s suggestions or write your own move.</p><textarea rows={2} value={decision} onChange={(e) => setDecision(e.target.value)} placeholder="I want the protagonist to..." />
                <button className="primary-btn" disabled={loading || !decision.trim()} onClick={() => createChapter(false, decision)}>{loading ? <><span className="loader" /> Writing the next chapter...</> : <>Continue the story <span>↗</span></>}</button>
              </div>
            </div>
          )}
        </div>

        <aside className="side-panel">
          <div className="side-card progress-card"><div className="side-title">YOUR STORY <span>LIVE</span></div><div className="progress-number">{String(chapters.length).padStart(2, "0")}</div><div className="progress-caption">CHAPTERS WRITTEN</div><div className="progress-line"><i style={{ width: `${Math.min(chapters.length * 12, 100)}%` }} /></div><div className="progress-foot"><span>Story in progress</span><span>∞</span></div></div>
          <div className="side-card"><div className="side-title">HOW IT WORKS</div><div className="how-item"><span>01</span><div><b>Set the scene</b><p>Give your world a theme and genre.</p></div></div><div className="how-item"><span>02</span><div><b>Make your move</b><p>Your decisions shape every chapter.</p></div></div><div className="how-item"><span>03</span><div><b>Watch it evolve</b><p>Characters and events stay connected.</p></div></div></div>
          <div className="quote-card"><div className="quote-mark">“</div><p>A thousand worlds live inside a single idea.</p><span>THE STORYVERSE PROMISE</span></div>
        </aside>
      </section>
      <footer><a className="brand footer-brand" href="#top">✦ storyverse<span className="brand-dot">.</span></a><span>Powered by AI · Made for the curious</span><span>© 2026 STORYVERSE</span></footer>
    </main>
  );
}
