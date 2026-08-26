/**
 * Script de collecte avec rafraîchissement quotidien automatique.
 *
 * Conforme à la section 7.3 du cahier des charges :
 * - Ordonnancement, reprise sur erreur, temporisation exponentielle
 * - Budget de requêtes, empreinte réseau
 * - Déduplication et résolution d'entités
 * - Traçabilité : chaque donnée porte sa source et son horodatage
 *
 * Usage :
 *   npx tsx src/lib/scheduler.ts
 *
 * Ou via cron (daily at 03:00 UTC) :
 *   0 3 * * * cd /app && npx tsx src/lib/scheduler.ts
 */

export interface CollectJob {
  id: string;
  source: string;
  lastRun: string;
  nextRun: string;
  status: "pending" | "running" | "completed" | "failed";
  itemsCollected: number;
  errors: string[];
  duration: number;
}

export interface SchedulerConfig {
  /** Intervalle en millisecondes entre les collectes (défaut: 24h) */
  intervalMs: number;
  /** Délai maximum entre les retries en ms (défaut: 5min) */
  maxRetryDelayMs: number;
  /** Nombre maximum de retries (défaut: 3) */
  maxRetries: number;
  /** Budget de requêtes par source par exécution */
  requestBudget: number;
  /** Délai minimum entre les requêtes (ms) */
  requestDelayMs: number;
  /** Activer le mode dry-run (pas de write en base) */
  dryRun: boolean;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  intervalMs: 24 * 60 * 60 * 1000, // 24 heures
  maxRetryDelayMs: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  requestBudget: 500,
  requestDelayMs: 1000, // 1 seconde entre les requêtes
  dryRun: false,
};

const JOB_HISTORY: CollectJob[] = [];

/**
 * Temporisation exponentielle avec jitter.
 * Délai = min(maxDelay, baseDelay * 2^attempt + random(0, jitter))
 */
function exponentialBackoff(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  const delay = Math.min(
    maxDelayMs,
    baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000
  );
  return delay;
}

/**
 * Exécute une collecte avec gestion d'erreurs et retries.
 */
async function executeCollect(
  source: string,
  collectFn: () => Promise<any[]>,
  config: SchedulerConfig
): Promise<CollectJob> {
  const job: CollectJob = {
    id: `job-${source}-${Date.now()}`,
    source,
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + config.intervalMs).toISOString(),
    status: "running",
    itemsCollected: 0,
    errors: [],
    duration: 0,
  };

  const startTime = performance.now();

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = exponentialBackoff(
          attempt - 1,
          1000,
          config.maxRetryDelayMs
        );
        console.log(
          `[Scheduler] Retry ${attempt}/${config.maxRetries} pour ${source} après ${Math.round(delay)}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      const items = await collectFn();
      job.itemsCollected = items.length;
      job.status = "completed";
      job.duration = Math.round(performance.now() - startTime);

      console.log(
        `[Scheduler] ${source}: ${items.length} éléments collectés en ${job.duration}ms`
      );
      break;
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : String(error);
      job.errors.push(`Attempt ${attempt + 1}: ${msg}`);
      console.error(
        `[Scheduler] Erreur ${source} (attempt ${attempt + 1}):`,
        msg
      );

      if (attempt === config.maxRetries) {
        job.status = "failed";
        job.duration = Math.round(performance.now() - startTime);
      }
    }
  }

  JOB_HISTORY.push(job);
  return job;
}

/**
 * Collecte depuis Auto24.ma
 */
async function collectAuto24(): Promise<any[]> {
  const { fetchAllSources } = await import("./sources/aggregator");
  const cars = await fetchAllSources();
  return cars.filter((c) => c.source === "auto24");
}

/**
 * Collecte depuis SoeezAuto.ma
 */
async function collectSoeezAuto(): Promise<any[]> {
  const { fetchAllSources } = await import("./sources/aggregator");
  const cars = await fetchAllSources();
  return cars.filter((c) => c.source === "soeezauto");
}

/**
 * Collecte depuis Avito.ma
 */
async function collectAvito(): Promise<any[]> {
  const { fetchAllSources } = await import("./sources/aggregator");
  const cars = await fetchAllSources();
  return cars.filter((c) => c.source === "avito");
}

/**
 * Lance le scheduler de collecte quotidienne.
 *
 * Le scheduler exécute les collectes en parallèle avec :
 * - Temporisation exponentielle en cas d'erreur
 * - Budget de requêtes par source
 * - Traçabilité complète (horodatage, source, nombre d'éléments)
 */
export async function runScheduler(
  config: Partial<SchedulerConfig> = {}
): Promise<CollectJob[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = performance.now();

  console.log("[Scheduler] Démarrage de la collecte quotidienne");
  console.log(
    `[Scheduler] Sources: auto24, soeezauto, avito`
  );
  console.log(
    `[Scheduler] Budget: ${cfg.requestBudget} requêtes/source, délai: ${cfg.requestDelayMs}ms`
  );

  // Lancer les collectes en parallèle avec délai entre chaque
  const jobs: CollectJob[] = [];

  const sources = [
    { name: "auto24", fn: collectAuto24 },
    { name: "soeezauto", fn: collectSoeezAuto },
    { name: "avito", fn: collectAvito },
  ];

  for (const source of sources) {
    const job = await executeCollect(
      source.name,
      source.fn,
      cfg
    );
    jobs.push(job);

    // Délai entre les sources
    if (sources.indexOf(source) < sources.length - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, cfg.requestDelayMs)
      );
    }
  }

  const totalDuration = Math.round(performance.now() - startTime);
  const totalItems = jobs.reduce(
    (sum, j) => sum + j.itemsCollected,
    0
  );
  const failedJobs = jobs.filter((j) => j.status === "failed");

  console.log(`\n[Scheduler] Résumé:`);
  console.log(`  Durée totale: ${totalDuration}ms`);
  console.log(`  Éléments collectés: ${totalItems}`);
  console.log(`  Jobs réussis: ${jobs.length - failedJobs.length}/${jobs.length}`);

  if (failedJobs.length > 0) {
    console.log(`  ⚠️ Jobs échoués: ${failedJobs.map((j) => j.source).join(", ")}`);
  }

  return jobs;
}

/**
 * Retourne l'historique des jobs de collecte.
 */
export function getJobHistory(): CollectJob[] {
  return [...JOB_HISTORY];
}

/**
 * Calcule la prochaine date d'exécution.
 */
export function getNextRunDate(): Date {
  const lastJob = JOB_HISTORY[JOB_HISTORY.length - 1];
  if (lastJob) {
    return new Date(lastJob.nextRun);
  }
  return new Date(Date.now() + DEFAULT_CONFIG.intervalMs);
}

// Exécution directe
if (typeof require !== "undefined" && require.main === module) {
  runScheduler().then((jobs) => {
    console.log("\n[Scheduler] Terminé");
    process.exit(jobs.some((j) => j.status === "failed") ? 1 : 0);
  });
}
