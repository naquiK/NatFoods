"use client"

const testimonials = [
  "“Insanely fast shipping.”",
  "“Design that pops!”",
  "“My go-to store now.”",
  "“Quality is top-tier.”",
  "“UX is buttery smooth.”",
  "“Love the curation.”",
]

const TestimonialStrip = () => {
  return (
    <section aria-label="Customer testimonials" className="section-padding" style={{ paddingTop: 0, paddingBottom: 0 }}>
      <div className="testimonial-viewport">
        <div className="testimonial-track" aria-hidden="true">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div className="testimonial" key={`${t}-${i}`}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialStrip
