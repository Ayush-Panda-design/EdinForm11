"use client";

/** Mini data-viz widgets for the editorial problem section */

export function ResponseSparkline() {
  const points = "4,42 24,38 44,28 64,22 84,18 104,12 124,8 140,6";
  return (
    <div className="mkt-viz-panel">
      <svg viewBox="0 0 144 48" className="w-full h-auto" aria-hidden>
        <polyline
          points={points}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="104" cy="12" r="4" fill="#ef4444" />
      </svg>
      <div className="mkt-viz-tooltip">847 responses this week</div>
    </div>
  );
}

export function TimeSavedBar() {
  return (
    <div className="mkt-viz-panel">
      <p className="mkt-viz-label">Time spent on form setup</p>
      <div className="mkt-viz-bar">
        <span style={{ width: "18%", background: "#a78bfa" }} />
        <span style={{ width: "32%", background: "#3f3f46" }} />
        <span style={{ width: "50%", background: "#ef4444" }} />
      </div>
      <p className="mkt-viz-caption">
        <strong>12 minutes</strong> with EdinForm vs 4+ hours in legacy tools
      </p>
    </div>
  );
}

export function DropoffCalendar() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="mkt-viz-panel">
      <div className="mkt-viz-cal">
        <div className="mkt-viz-cal-header">
          {days.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mkt-viz-cal-grid">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className={i === 9 ? "mkt-viz-cal-cell mkt-viz-cal-cell--alert" : "mkt-viz-cal-cell"}
            />
          ))}
        </div>
        <div className="mkt-viz-cal-alert">High drop-off · Question 4 · 8:00–9:30 AM</div>
      </div>
    </div>
  );
}
