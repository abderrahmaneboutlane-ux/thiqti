"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Database, Globe, BarChart3, TrendingUp, Fuel, Car, Shield } from "lucide-react";
import TiltCard from "@/components/ui/TiltCard";
import ScoreBadge from "@/components/ui/ScoreBadge";
import Logo from "@/components/Logo";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const PieChartDynamic = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const PieDynamic = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const CellDynamic = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const BarChartDynamic = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const BarDynamic = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxisDynamic = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxisDynamic = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const TooltipDynamic = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainerDynamic = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

const COLORS = ["#0284C7", "#8B5CF6", "#059669", "#D97706", "#DC2626", "#EC4899", "#06B6D4", "#F59E0B", "#10B981", "#6366F1"];

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value]);
  return <span>{count}</span>;
}

interface AdminCar {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  priceFormatted: string;
  price: number;
  fuel: string;
  source: string;
  score: number;
  km: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.status === 401) { router.replace("/login"); return null; }
        return res.json();
      })
      .then((session) => {
        if (!session) return;
        setChecking(false);
        fetch("/api/search?limit=200")
          .then((r) => r.json())
          .then((data) => setCars(data.results || []))
          .catch(() => setCars([]))
          .finally(() => setLoadingCars(false));
      })
      .catch(() => { router.replace("/login"); });
  }, [router]);

  const chartData = useMemo(() => {
    if (cars.length === 0) return null;

    const brands: Record<string, number> = {};
    cars.forEach((c) => { brands[c.make] = (brands[c.make] || 0) + 1; });
    const topBrands = Object.entries(brands).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));

    const fuels: Record<string, number> = {};
    cars.forEach((c) => { fuels[c.fuel || "N/A"] = (fuels[c.fuel || "N/A"] || 0) + 1; });
    const fuelData = Object.entries(fuels).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));

    const years: Record<string, number> = {};
    cars.forEach((c) => { years[String(c.year)] = (years[String(c.year)] || 0) + 1; });
    const yearData = Object.entries(years).sort((a, b) => a[0].localeCompare(b[0])).map(([name, value]) => ({ name, value }));

    const scoreDist = [
      { range: "0-20", count: cars.filter((c) => c.score < 20).length },
      { range: "20-40", count: cars.filter((c) => c.score >= 20 && c.score < 40).length },
      { range: "40-60", count: cars.filter((c) => c.score >= 40 && c.score < 60).length },
      { range: "60-80", count: cars.filter((c) => c.score >= 60 && c.score < 80).length },
      { range: "80-100", count: cars.filter((c) => c.score >= 80).length },
    ];

    const avgPrice = cars.reduce((sum, c) => sum + (c.price || 0), 0) / cars.length;
    const avgScore = cars.reduce((sum, c) => sum + (c.score || 0), 0) / cars.length;
    const avgKm = cars.reduce((sum, c) => sum + (c.km || 0), 0) / cars.length;
    const sources = new Set(cars.map((c) => c.source)).size;

    return { topBrands, fuelData, yearData, scoreDist, avgPrice, avgScore, avgKm, sources };
  }, [cars]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse text-sm font-semibold text-slate-500">Vérification de la session admin...</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900">Administration</h1>
              <p className="text-sm text-slate-500">Tableau de bord Thiqti &amp; Supervision du catalogue</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Session active
            </span>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <X className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <motion.div
          className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
        >
          {[
            { icon: Database, label: "Véhicules", value: cars.length, color: "brand" },
            { icon: Globe, label: "Sources", value: chartData?.sources || 0, color: "purple" },
            { icon: TrendingUp, label: "Score moyen", value: chartData ? Math.round(chartData.avgScore) : 0, suffix: "%", color: "emerald" },
            { icon: Car, label: "Prix moyen", value: chartData ? Math.round(chartData.avgPrice / 1000) : 0, suffix: "k DH", color: "amber" },
          ].map((kpi, i) => (
            <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" } } }}>
              <TiltCard maxTilt={5} className="rounded-2xl h-full">
                <div className="liquid-glass p-6 rounded-2xl h-full">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${kpi.color}-500/10 border border-${kpi.color}-500/20 text-${kpi.color}-600`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-slate-900">
                        {loadingCars ? "..." : <>{<AnimatedCounter value={kpi.value} />}{kpi.suffix || ""}</>}
                      </p>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{kpi.label}</p>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        {chartData && (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Top Brands Pie */}
            <div className="liquid-glass rounded-2xl p-6 shadow-elev-2">
              <h3 className="mb-4 font-serif text-lg font-bold text-slate-900">Top 10 Marques</h3>
              {PieChartDynamic && (
                <ResponsiveContainerDynamic width="100%" height={300}>
                  <PieChartDynamic>
                    <PieDynamic
                      data={chartData.topBrands}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                      fontSize={11}
                    >
                      {chartData.topBrands.map((_, idx) => (
                        <CellDynamic key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </PieDynamic>
                    <TooltipDynamic />
                  </PieChartDynamic>
                </ResponsiveContainerDynamic>
              )}
            </div>

            {/* Fuel Type Bar */}
            <div className="liquid-glass rounded-2xl p-6 shadow-elev-2">
              <h3 className="mb-4 font-serif text-lg font-bold text-slate-900">Répartition Carburant</h3>
              {BarChartDynamic && (
                <ResponsiveContainerDynamic width="100%" height={300}>
                  <BarChartDynamic data={chartData.fuelData}>
                    <XAxisDynamic dataKey="name" fontSize={12} />
                    <YAxisDynamic fontSize={12} />
                    <TooltipDynamic />
                    <BarDynamic dataKey="value" fill="#0284C7" radius={[6, 6, 0, 0]} />
                  </BarChartDynamic>
                </ResponsiveContainerDynamic>
              )}
            </div>

            {/* Score Distribution */}
            <div className="liquid-glass rounded-2xl p-6 shadow-elev-2">
              <h3 className="mb-4 font-serif text-lg font-bold text-slate-900">Distribution des Scores IA</h3>
              {BarChartDynamic && (
                <ResponsiveContainerDynamic width="100%" height={300}>
                  <BarChartDynamic data={chartData.scoreDist}>
                    <XAxisDynamic dataKey="range" fontSize={12} />
                    <YAxisDynamic fontSize={12} />
                    <TooltipDynamic />
                    <BarDynamic dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChartDynamic>
                </ResponsiveContainerDynamic>
              )}
            </div>

            {/* Year Distribution */}
            <div className="liquid-glass rounded-2xl p-6 shadow-elev-2">
              <h3 className="mb-4 font-serif text-lg font-bold text-slate-900">Répartition par Année</h3>
              {BarChartDynamic && (
                <ResponsiveContainerDynamic width="100%" height={300}>
                  <BarChartDynamic data={chartData.yearData}>
                    <XAxisDynamic dataKey="name" fontSize={12} />
                    <YAxisDynamic fontSize={12} />
                    <TooltipDynamic />
                    <BarDynamic dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChartDynamic>
                </ResponsiveContainerDynamic>
              )}
            </div>
          </div>
        )}

        {/* Data Quality Metrics */}
        {chartData && (
          <div className="mb-8 liquid-glass rounded-2xl p-6 shadow-elev-2">
            <h3 className="mb-4 font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Qualité des Données
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Complétude",
                  value: Math.round((cars.filter((c) => c.fuel && c.km > 0 && c.price > 0).length / Math.max(1, cars.length)) * 100),
                  desc: "Véhicules avec tous les champs",
                  color: "emerald",
                },
                {
                  label: "Sources actives",
                  value: chartData.sources,
                  desc: `${cars.length} annonces au total`,
                  color: "blue",
                },
                {
                  label: "Score moyen catalogue",
                  value: Math.round(chartData.avgScore),
                  desc: `KM moyen : ${Math.round(chartData.avgKm).toLocaleString("fr-FR")}`,
                  color: "purple",
                },
                {
                  label: "Prix moyen",
                  value: Math.round(chartData.avgPrice / 1000),
                  suffix: "k DH",
                  desc: "Tous véhicules confondus",
                  color: "amber",
                },
              ].map((metric, i) => (
                <div key={i} className={`rounded-xl border border-${metric.color}-100 bg-${metric.color}-50/50 p-4`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{metric.label}</p>
                  <p className={`mt-1 text-2xl font-extrabold text-${metric.color}-700`}>
                    {loadingCars ? "..." : <>{metric.value}{metric.suffix || "%"}</>}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{metric.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle Table */}
        <div className="liquid-glass rounded-2xl overflow-hidden shadow-elev-2">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white/50">
            <h2 className="font-serif text-lg font-bold text-slate-900">Liste des véhicules</h2>
            <span className="text-xs font-semibold text-slate-500">{cars.length} annonces</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-3.5">Véhicule</th>
                  <th className="px-6 py-3.5">Année</th>
                  <th className="px-6 py-3.5">Carburant</th>
                  <th className="px-6 py-3.5">Prix</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Score IA</th>
                </tr>
              </thead>
              <tbody>
                {loadingCars ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Chargement...</td></tr>
                ) : cars.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Aucun véhicule</td></tr>
                ) : (
                  cars.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <Link href={`/vehicle/${c.id}`} className="font-semibold text-slate-900 hover:text-brand-600 transition-colors">{c.title}</Link>
                      </td>
                      <td className="px-6 py-3.5 text-slate-500">{c.year}</td>
                      <td className="px-6 py-3.5 text-slate-500">{c.fuel}</td>
                      <td className="px-6 py-3.5 font-bold text-price-600">{c.priceFormatted}</td>
                      <td className="px-6 py-3.5"><span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-medium">{c.source}</span></td>
                      <td className="px-6 py-3.5">
                        <ScoreBadge percent={c.score} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
