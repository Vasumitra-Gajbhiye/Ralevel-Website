import MarkdownRenderer from "@/components/MarkdownRenderer";
import Back from "../components/back";
const markdown = `
## Key Diagrams

### Velocity-Time Graph

![Velocity-Time Graph](https://upload.wikimedia.org/wikipedia/commons/4/4b/Velocity_vs_Time_Graph.png)

A velocity-time graph shows how velocity changes with time.

- The slope represents **acceleration**
- A straight line means constant acceleration
- Area under the graph gives **displacement**

---

### Free Body Diagram

![Free Body Diagram](https://upload.wikimedia.org/wikipedia/commons/5/55/Free_body_diagram.svg)

A free body diagram shows all forces acting on an object.

- Arrows represent forces
- Length of arrow indicates magnitude
- Direction shows force direction

---

### Wave Diagram

![Wave Diagram](https://upload.wikimedia.org/wikipedia/commons/7/77/Waveforms.svg)

This represents a transverse wave.

- Crest = highest point  
- Trough = lowest point  
- Wavelength = distance between two crests  

$$
\lambda = \frac{v}{f}
$$
`;

export default function DiagramsPage() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="mb-3">
          <Back />
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">
          Diagrams Explained
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl">
          Understand key diagrams used in this chapter with clear visual
          explanations.
        </p>
      </div>

      {/* Content */}
      <div className="diagram-page">
        <MarkdownRenderer content={markdown} />
      </div>
    </section>
  );
}
