import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthProvider";
import { Badge } from "../components/ui/badge";
import { Button, buttonClassName } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

const metrics = [
  { label: "Retrieval stack", value: "Hybrid", note: "Vector + graph reasoning in one flow" },
  { label: "Grounding layers", value: "3", note: "Chunks, entities, and graph facts" },
  { label: "Security posture", value: "Tight", note: "Protected API routes and server-side LLM calls" }
];

const features = [
  {
    title: "Ingest dense documents without losing structure",
    description:
      "PDFs are chunked for embeddings, mined for entities, and stitched into a graph so the model can reason over relationships instead of guessing from flat context."
  },
  {
    title: "Query with graph-aware retrieval",
    description:
      "KG-RAG combines semantic similarity search with multi-hop traversal, so answers can cite exact passages and still walk through linked concepts."
  },
  {
    title: "Inspect the knowledge graph visually",
    description:
      "Teams can audit what the system extracted, spot missing links, and understand why the assistant answered the way it did."
  }
];

const steps = [
  "Upload PDFs or TXT files and build a retrieval-ready corpus.",
  "Extract entities and relationships into Neo4j while storing embeddings in pgvector.",
  "Authenticate, query securely, and inspect graph-backed answers in the workspace."
];

export function Landing() {
  const { user } = useAuth();

  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-sand-200 bg-white shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(194,65,12,0.1),_transparent_32%)]" />
        <div className="relative grid gap-10 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div className="space-y-6">
            <Badge className="bg-white/80 text-accent-700">Production-ready Knowledge Graph RAG</Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-sand-900 sm:text-5xl">
                Turn messy source documents into a secure, explainable retrieval workspace.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-sand-600 sm:text-lg">
                KG-RAG fuses Gemini-powered extraction, pgvector similarity search, and Neo4j graph
                traversal so teams can upload documents, authenticate, and query a grounded knowledge
                layer instead of a black-box chatbot.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={user ? "/app/upload" : "/auth"}
                className={buttonClassName("primary", "px-5 py-3 text-base")}
              >
                {user ? "Open Workspace" : "Start Secure Session"}
              </Link>
              <a
                href="#workflow"
                className={buttonClassName("secondary", "px-5 py-3 text-base")}
              >
                See How It Works
              </a>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-sand-500">
              <span>FastAPI + Gemini + Neo4j + pgvector</span>
              <span>Protected with Supabase Auth</span>
              <span>Inspectable graph reasoning</span>
            </div>
          </div>

          <Card className="border-sand-300 bg-sand-900 text-sand-50">
            <CardHeader>
              <div className="text-xs uppercase tracking-[0.35em] text-sand-400">What makes this different</div>
              <CardTitle className="text-sand-50">A retrieval system you can actually audit</CardTitle>
              <CardDescription className="text-sand-300">
                Every answer is backed by source chunks, entity matches, and explicit graph facts
                instead of hidden prompt stuffing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-sand-700 bg-sand-800/70 p-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-sand-400">{metric.label}</div>
                  <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
                  <p className="mt-2 text-sm leading-6 text-sand-300">{metric.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="features" className="grid gap-5 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section id="workflow" className="grid gap-8 rounded-[2rem] border border-sand-200 bg-sand-100/80 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Workflow</div>
          <h2 className="text-3xl font-semibold tracking-tight text-sand-900">
            From raw PDFs to graph-backed answers in one secure workspace.
          </h2>
          <p className="text-base leading-7 text-sand-600">
            The landing page gets people in, but the authenticated workspace is where KG-RAG earns
            trust: ingestion is protected, answers are grounded, and the graph is visible.
          </p>
        </div>
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent-500 text-sm font-semibold text-white">
                0{index + 1}
              </div>
              <p className="text-sm leading-7 text-sand-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-sand-200 bg-white px-6 py-10 shadow-panel lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="text-xs uppercase tracking-[0.35em] text-sand-500">Ready to use</div>
            <h2 className="text-3xl font-semibold tracking-tight text-sand-900">
              Secure the workspace, upload documents, and start querying.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-sand-600">
              Sign in to protect the API, keep ingestion private to authenticated users, and explore
              your graph-backed retrieval workspace.
            </p>
          </div>
          <Link
            to={user ? "/app/upload" : "/auth"}
            className={buttonClassName("primary", "px-5 py-3 text-base")}
          >
            {user ? "Go To Workspace" : "Sign In / Sign Up"}
          </Link>
        </div>
      </section>
    </div>
  );
}
