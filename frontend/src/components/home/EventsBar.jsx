"use client"
import { useEffect, useState } from "react"
import { eventsAPI } from "../../utils/api"

export default function EventsBar() {
  const [events, setEvents] = useState([])
  useEffect(() => {
    eventsAPI
      .list()
      .then((res) => setEvents(res.data || []))
      .catch(() => setEvents([]))
  }, [])
  if (!events.length) return null
  const ev = events[0]
  return (
    <section className="py-8" style={{ background: "var(--color-bg)" }}>
      <div className="container-max px-4">
        <div
          className="rounded-2xl border"
          style={{ borderColor: "color-mix(in oklab, var(--color-fg) 12%, transparent)" }}
        >
          <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-70">Event</p>
              <h3 className="text-2xl font-serif">{ev.title}</h3>
              {ev.subtitle && <p className="opacity-80">{ev.subtitle}</p>}
            </div>
            {ev.ctaHref && (
              <a
                href={ev.ctaHref}
                className="px-4 py-2 rounded-md border hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                {ev.ctaText || "Learn more"}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
