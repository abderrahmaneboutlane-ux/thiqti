import { randomUUID } from "crypto";
import { sleep } from "./retry";

export interface ScrapJob {
  id: string;
  sourceName: string;
  type: "listings" | "details" | "enrich";
  status: "pending" | "running" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  createdAt: string;
  completedAt?: string;
}

export type JobProcessor = (job: ScrapJob) => Promise<void>;

const REDIS_URL = process.env.REDIS_URL;

const jobs = new Map<string, ScrapJob>();
let processor: JobProcessor | null = null;
let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

function createJob(sourceName: string, type: ScrapJob["type"]): ScrapJob {
  const job: ScrapJob = {
    id: randomUUID(),
    sourceName,
    type,
    status: "pending",
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date().toISOString(),
  };
  jobs.set(job.id, job);
  return job;
}

export function setProcessor(fn: JobProcessor): void {
  processor = fn;
}

export async function queueScrapeJob(
  sourceName: string,
  type: ScrapJob["type"],
): Promise<string> {
  if (REDIS_URL) {
    return queueWithRedis(sourceName, type);
  }
  const job = createJob(sourceName, type);
  console.log(`[Queue] Job ${job.id} queued: ${sourceName}/${type}`);
  return job.id;
}

export function getJobStatus(jobId: string): ScrapJob | null {
  return jobs.get(jobId) ?? null;
}

export function getQueueStats(): {
  pending: number;
  running: number;
  completed: number;
  failed: number;
} {
  let pending = 0;
  let running = 0;
  let completed = 0;
  let failed = 0;
  for (const job of jobs.values()) {
    switch (job.status) {
      case "pending":
        pending++;
        break;
      case "running":
        running++;
        break;
      case "completed":
        completed++;
        break;
      case "failed":
        failed++;
        break;
    }
  }
  return { pending, running, completed, failed };
}

export async function processQueue(): Promise<void> {
  if (isProcessing) return;
  if (!processor) {
    console.warn("[Queue] No processor registered. Call setProcessor() first.");
    return;
  }

  isProcessing = true;

  try {
    let pendingJob: ScrapJob | undefined;
    for (const job of jobs.values()) {
      if (job.status === "pending") {
        pendingJob = job;
        break;
      }
    }

    if (!pendingJob) return;

    pendingJob.status = "running";
    pendingJob.attempts++;

    try {
      await processor(pendingJob);
      pendingJob.status = "completed";
      pendingJob.completedAt = new Date().toISOString();
      console.log(`[Queue] Job ${pendingJob.id} completed`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      pendingJob.lastError = msg;
      if (pendingJob.attempts >= pendingJob.maxAttempts) {
        pendingJob.status = "failed";
        console.error(`[Queue] Job ${pendingJob.id} failed permanently: ${msg}`);
      } else {
        pendingJob.status = "pending";
        console.warn(
          `[Queue] Job ${pendingJob.id} retry ${pendingJob.attempts}/${pendingJob.maxAttempts}: ${msg}`,
        );
      }
    }
  } finally {
    isProcessing = false;
  }
}

export function startScheduler(intervalMs = 5000): void {
  if (schedulerTimer) return;
  console.log(`[Queue] Scheduler started (interval: ${intervalMs}ms)`);
  schedulerTimer = setInterval(() => {
    processQueue().catch((err) => {
      console.error("[Queue] Scheduler tick error:", err);
    });
  }, intervalMs);
}

export function stopScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.log("[Queue] Scheduler stopped");
  }
}

export function getPendingJobs(): ScrapJob[] {
  return Array.from(jobs.values()).filter((j) => j.status === "pending");
}

export function getAllJobs(): ScrapJob[] {
  return Array.from(jobs.values());
}

export function clearCompletedJobs(): number {
  let count = 0;
  for (const [id, job] of jobs) {
    if (job.status === "completed") {
      jobs.delete(id);
      count++;
    }
  }
  return count;
}

// ── BullMQ (Redis) mode ──────────────────────────────────────────────

async function queueWithRedis(
  sourceName: string,
  type: ScrapJob["type"],
): Promise<string> {
  try {
    // @ts-expect-error bullmq is an optional dependency
    const { Queue } = await import("bullmq");
    const queue = new Queue("scrape", { connection: { url: REDIS_URL } });
    const job = await queue.add(
      type,
      { sourceName, type },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { age: 86400 },
        removeOnFail: { age: 604800 },
      },
    );
    console.log(`[Queue:Redis] Job ${job.id} queued: ${sourceName}/${type}`);
    return String(job.id);
  } catch (err) {
    console.warn(
      "[Queue] Redis unavailable, falling back to in-memory queue:",
      err instanceof Error ? err.message : err,
    );
    const job = createJob(sourceName, type);
    return job.id;
  }
}
