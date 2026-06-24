export type MCQ = {
  stem: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Topic = {
  id: string;
  title: string;
  subtitle: string;
  notes: string[];
  quiz: MCQ[];
};

export const TOPICS: Topic[] = [
  {
    id: "fundamentals",
    title: "Topic 1: Wave Fundamentals",
    subtitle: "Core language and wave behavior in physical systems",
    notes: [
      "A wave transports energy through oscillations while average matter position remains unchanged.",
      "Mechanical waves require a material medium, while electromagnetic waves propagate through vacuum.",
      "Wavefronts represent points oscillating in the same phase and help visualize propagation.",
    ],
    quiz: [
      {
        stem: "Which statement best defines a progressive wave?",
        options: [
          "Transfer of matter only",
          "Transfer of energy without net transfer of matter",
          "Standing particles with no oscillation",
          "Constant amplitude at every position",
        ],
        answer: 1,
        explain:
          "A progressive wave carries energy through oscillations, but matter has no net movement.",
      },
      {
        stem: "Electromagnetic waves differ from most mechanical waves because they:",
        options: [
          "Cannot carry energy",
          "Need a vacuum chamber to move",
          "Do not require a material medium",
          "Always travel slower than sound",
        ],
        answer: 2,
        explain:
          "Electromagnetic waves can propagate in vacuum; mechanical waves generally cannot.",
      },
      {
        stem: "Points on the same wavefront have:",
        options: [
          "Different frequencies",
          "Different amplitudes",
          "Same phase",
          "Zero displacement",
        ],
        answer: 2,
        explain:
          "A wavefront joins points that are oscillating with identical phase at that instant.",
      },
    ],
  },
  {
    id: "equations",
    title: "Topic 2: Wave Equation and Quantities",
    subtitle: "Using $v=f\\lambda$ and unit consistency with confidence",
    notes: [
      "The central relation is $v=f\\lambda$, connecting speed, frequency, and wavelength.",
      "In one fixed medium, speed stays approximately constant, so increasing $f$ reduces $\\lambda$.",
      "Use SI units carefully: $v$ in $\\mathrm{m\\,s^{-1}}$, $f$ in $\\mathrm{Hz}$, and $\\lambda$ in $\\mathrm{m}$.",
    ],
    quiz: [
      {
        stem: "A wave has $f=120\\,\\mathrm{Hz}$ and $\\lambda=2.5\\,\\mathrm{m}$. Find $v$.",
        options: [
          "$48\\,\\mathrm{m\\,s^{-1}}$",
          "$122.5\\,\\mathrm{m\\,s^{-1}}$",
          "$300\\,\\mathrm{m\\,s^{-1}}$",
          "$0.048\\,\\mathrm{m\\,s^{-1}}$",
        ],
        answer: 2,
        explain:
          "Apply $v=f\\lambda$: $v=120\\times 2.5=300\\,\\mathrm{m\\,s^{-1}}$.",
      },
      {
        stem: "If wave speed is constant and frequency triples, wavelength becomes:",
        options: ["Three times larger", "Unchanged", "One-third", "Zero"],
        answer: 2,
        explain:
          "With constant $v$, $\\lambda=v/f$, so $\\lambda$ scales inversely with frequency.",
      },
      {
        stem: "Correct SI unit of frequency is:",
        options: [
          "$\\mathrm{m\\,s^{-1}}$",
          "$\\mathrm{Hz}$",
          "$\\mathrm{N}$",
          "$\\mathrm{J\\,kg^{-1}}$",
        ],
        answer: 1,
        explain:
          "Frequency measures oscillations per second and uses hertz ($\\mathrm{Hz}$).",
      },
    ],
  },
  {
    id: "interference",
    title: "Topic 3: Superposition, Phase, and Interference",
    subtitle: "Reasoning with phase differences and path differences",
    notes: [
      "Superposition means resultant displacement is the vector sum of individual displacements.",
      "Constructive interference occurs for path difference $n\\lambda$; destructive for $(n+1/2)\\lambda$.",
      "Phase relation can be written as $\\phi = \\frac{\\Delta x}{\\lambda}\\times 360^\\circ$.",
    ],
    quiz: [
      {
        stem: "First destructive interference happens when path difference is:",
        options: ["$0$", "$\\lambda$", "$\\lambda/2$", "$2\\lambda$"],
        answer: 2,
        explain:
          "The first destructive point corresponds to half a wavelength path difference.",
      },
      {
        stem: "If path difference is $2\\lambda$, two waves are:",
        options: [
          "In phase",
          "In antiphase",
          "Randomly phased",
          "Always destructive",
        ],
        answer: 0,
        explain:
          "Any whole-number multiple of $\\lambda$ means waves are in phase.",
      },
      {
        stem: "Which principle explains overlap of multiple waves?",
        options: [
          "Conservation of charge",
          "Superposition",
          "Diffraction law only",
          "Doppler equation",
        ],
        answer: 1,
        explain: "Superposition governs how displacements combine at a point.",
      },
    ],
  },
  {
    id: "stationary",
    title: "Topic 4: Stationary Waves and Resonance",
    subtitle: "Nodes, antinodes, harmonics, and resonant response",
    notes: [
      "Stationary waves are produced by two identical waves traveling opposite directions.",
      "Nodes have zero displacement and adjacent nodes are separated by $\\lambda/2$.",
      "Resonance occurs when driving frequency matches natural frequency, giving large amplitude.",
    ],
    quiz: [
      {
        stem: "In a stationary wave, antinodes are points of:",
        options: [
          "Zero displacement",
          "Maximum displacement",
          "No phase relation",
          "No energy at all",
        ],
        answer: 1,
        explain: "Antinodes oscillate with the largest amplitude.",
      },
      {
        stem: "Distance between adjacent nodes is:",
        options: ["$\\lambda$", "$\\lambda/2$", "$\\lambda/4$", "$2\\lambda$"],
        answer: 1,
        explain:
          "Node-to-node spacing in a stationary pattern is half a wavelength.",
      },
      {
        stem: "Resonance is strongest when driving frequency is:",
        options: [
          "Very low",
          "Much higher than natural frequency",
          "Equal to natural frequency",
          "Continuously changing randomly",
        ],
        answer: 2,
        explain:
          "Maximum response is obtained when the driving and natural frequencies match.",
      },
    ],
  },
];

export const FINAL_TEST: MCQ[] = [
  {
    stem: "A wave travels at $240\\,\\mathrm{m\\,s^{-1}}$ with frequency $60\\,\\mathrm{Hz}$. Find wavelength.",
    options: [
      "$4\\,\\mathrm{m}$",
      "$180\\,\\mathrm{m}$",
      "$300\\,\\mathrm{m}$",
      "$0.25\\,\\mathrm{m}$",
    ],
    answer: 0,
    explain: "$\\lambda=v/f=240/60=4\\,\\mathrm{m}$.",
  },
  {
    stem: "Which pair correctly describes stationary waves?",
    options: [
      "Energy transfer + equal amplitude everywhere",
      "No net energy transfer + fixed nodes",
      "Single traveling wave + no nodes",
      "Random phase + no pattern",
    ],
    answer: 1,
    explain:
      "Stationary waves have fixed nodes and no net propagation of energy through the medium.",
  },
  {
    stem: "Path difference $1.5\\lambda$ gives:",
    options: [
      "Constructive interference",
      "Destructive interference",
      "Always resonance",
      "No phase difference",
    ],
    answer: 1,
    explain:
      "$1.5\\lambda=(1+1/2)\\lambda$, which satisfies destructive condition.",
  },
  {
    stem: "If frequency increases and speed is unchanged, wavelength:",
    options: ["Increases", "Stays constant", "Decreases", "Becomes undefined"],
    answer: 2,
    explain:
      "From $\\lambda=v/f$, higher $f$ at constant $v$ means smaller $\\lambda$.",
  },
  {
    stem: "SI unit of wave speed is:",
    options: [
      "$\\mathrm{m}$",
      "$\\mathrm{Hz}$",
      "$\\mathrm{m\\,s^{-1}}$",
      "$\\mathrm{s^{-1}}$",
    ],
    answer: 2,
    explain:
      "Speed is distance per unit time, so unit is $\\mathrm{m\\,s^{-1}}$.",
  },
  {
    stem: "Two points differ by phase $360^\\circ$. They are:",
    options: [
      "In antiphase",
      "In phase",
      "Quarter cycle apart",
      "Out of oscillation",
    ],
    answer: 1,
    explain: "$360^\\circ$ is one complete cycle, so the points are in phase.",
  },
  {
    stem: "Superposition predicts resultant displacement equals:",
    options: [
      "Product of displacements",
      "Average displacement only",
      "Vector sum of displacements",
      "Difference in frequencies",
    ],
    answer: 2,
    explain: "Displacements add vectorially at a point.",
  },
  {
    stem: "For first harmonic on a string fixed at both ends, ends are:",
    options: ["Antinodes", "Nodes", "In random phase", "Moving freely"],
    answer: 1,
    explain: "Fixed boundaries enforce zero displacement at both ends (nodes).",
  },
];
