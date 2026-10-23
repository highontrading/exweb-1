import { store } from "@/config/store";

export function Hero() {
  const { eyebrow, eyebrowMuted, headline, headlineFaded } = store.hero;
  const words = [...headline.split(" ").map((w) => ({ w, faded: false })), ...headlineFaded.split(" ").map((w) => ({ w, faded: true }))];

  return (
    <div className="hero">
      <p className="eyebrow">
        <span>{eyebrow}</span>
        <span className="sep" aria-hidden="true" />
        <span className="muted">{eyebrowMuted}</span>
      </p>
      <h1>
        {words.map(({ w, faded }, i) => (
          <span key={i} className={`word${faded ? " faded" : ""}`} style={{ animationDelay: `${120 + i * 90}ms` }}>
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </h1>
    </div>
  );
}
