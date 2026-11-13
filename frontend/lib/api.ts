import {
  DatasetInput,
  GAConfig,
  ScenarioPreset,
  BenchmarkResponse,
  VisualizerStepResponse,
  GeneOut,
  StreamEvent,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = `Request failed: ${res.statusText}`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

export async function fetchScenarios(): Promise<ScenarioPreset[]> {
  return request<ScenarioPreset[]>("/api/scenarios");
}

export async function fetchScenarioById(id: string): Promise<ScenarioPreset> {
  return request<ScenarioPreset>(`/api/scenarios/${encodeURIComponent(id)}`);
}

export async function fetchDemoData(): Promise<DatasetInput> {
  return request<DatasetInput>("/api/demo-data");
}

export async function runBenchmark(
  dataset: DatasetInput,
  config: {
    algorithms: string[];
    iterations: number;
    population_size: number;
    random_seed?: number | null;
  }
): Promise<BenchmarkResponse> {
  return request<BenchmarkResponse>("/api/benchmark", {
    method: "POST",
    body: JSON.stringify({ dataset, config }),
  });
}

export async function fetchVisualizerStep(
  dataset: DatasetInput,
  params?: { tournament_size?: number; mutation_rate?: number; random_seed?: number | null }
): Promise<VisualizerStepResponse> {
  return request<VisualizerStepResponse>("/api/visualizer/step", {
    method: "POST",
    body: JSON.stringify({
      dataset,
      tournament_size: params?.tournament_size ?? 3,
      mutation_rate: params?.mutation_rate ?? 0.2,
      random_seed: params?.random_seed,
    }),
  });
}

export async function exportCsv(timetable: GeneOut[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/export/csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timetable }),
  });
  if (!res.ok) throw new Error("CSV Export failed");
  return res.text();
}

export async function streamOptimize(
  dataset: DatasetInput,
  config: GAConfig,
  callbacks: {
    onEvent: (event: StreamEvent) => void;
    onError: (err: Error) => void;
    onDone: () => void;
  },
  abortSignal?: AbortSignal
): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/optimize/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset, config }),
      signal: abortSignal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`SSE stream failed with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(trimmed.slice(6)) as StreamEvent;
            callbacks.onEvent(parsed);
          } catch (e) {
            console.error("Failed to parse SSE payload", e);
          }
        }
      }
    }
    callbacks.onDone();
  } catch (err: any) {
    if (err.name === "AbortError") {
      callbacks.onDone();
      return;
    }
    callbacks.onError(err instanceof Error ? err : new Error(String(err)));
  }
}
