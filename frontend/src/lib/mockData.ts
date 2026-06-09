export const DEMO_DOCUMENT = {
  id: "demo-doc-1",
  name: "AI Safety Research Paper (Demo).pdf",
  size_bytes: 1024 * 1024 * 2.5,
  chunk_count: 47,
  entity_count: 23,
  status: "ready" as const,
  created_at: new Date().toISOString(),
  user_id: "demo-user"
}

export const DEMO_GRAPH_DATA = {
  nodes: [
    { id: "1", label: "AI Safety", type: "CONCEPT", properties: {} },
    { id: "2", label: "Misalignment", type: "CONCEPT", properties: {} },
    { id: "3", label: "Objective Function", type: "CONCEPT", properties: {} },
    { id: "4", label: "Human Values", type: "CONCEPT", properties: {} },
    { id: "5", label: "Capability Jumps", type: "EVENT", properties: {} },
    { id: "6", label: "Unexpected Behaviors", type: "EVENT", properties: {} },
    { id: "7", label: "Safety Guardrails", type: "CONCEPT", properties: {} },
    { id: "8", label: "Transformer Arch", type: "CONCEPT", properties: {} }
  ],
  edges: [
    { from: "AI Safety", to: "Misalignment", relation: "addresses" },
    { from: "Misalignment", to: "Objective Function", relation: "caused_by" },
    { from: "Objective Function", to: "Human Values", relation: "should_align_with" },
    { from: "Capability Jumps", to: "Unexpected Behaviors", relation: "results_in" },
    { from: "Unexpected Behaviors", to: "Safety Guardrails", relation: "may_bypass" },
    { from: "Transformer Arch", to: "Capability Jumps", relation: "exhibits" }
  ]
}

export const DEMO_QUERIES = [
  {
    question: "What are the main risks discussed in this paper?",
    answer: "The paper identifies three primary risk categories: misalignment risks where AI systems pursue unintended goals, capability jumps where systems suddenly exceed expected performance thresholds, and coordination failures where multiple AI systems interact unpredictably. The authors argue that misalignment poses the most immediate concern given current development trajectories.",
    sources: [
      { text: "...misalignment occurs when the objective function specified by designers diverges from intended human values during optimization...", score: 0.95, document_name: "AI Safety Research Paper (Demo).pdf", chunk_index: 3 },
      { text: "...capability jumps have been observed in transformer architectures at specific parameter thresholds, notably at 7B, 13B, and 70B parameters...", score: 0.88, document_name: "AI Safety Research Paper (Demo).pdf", chunk_index: 7 }
    ],
    graph_path: [
      { from: "AI Safety", to: "Misalignment", relation: "addresses" },
      { from: "Misalignment", to: "Objective Function", relation: "caused_by" },
      { from: "Objective Function", to: "Human Values", relation: "should_align_with" }
    ],
    latency_ms: 1200,
    query_id: "demo-query-1"
  }
]
