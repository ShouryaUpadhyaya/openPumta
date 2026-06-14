'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Shared animation helpers ─────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

// ─── Flow illustration (Slide 1 — Welcome) ────────────────────────────────────

function FlowIllustration() {
  const steps = [
    {
      label: 'Focus',
      icon: '⚡',
      color: 'from-orange-500/20 to-orange-500/5',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
    },
    {
      label: 'Consistency',
      icon: '🔁',
      color: 'from-amber-500/20 to-amber-500/5',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
    {
      label: 'Reflection',
      icon: '🪞',
      color: 'from-blue-500/20 to-blue-500/5',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
    },
    {
      label: 'Improvement',
      icon: '📈',
      color: 'from-emerald-500/20 to-emerald-500/5',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
  ];

  return (
    <div
      className="flex flex-col items-center gap-0 w-full max-w-[200px] mx-auto"
      aria-hidden="true"
    >
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <motion.div
            {...fadeUp(i * 0.15)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br ${step.color} border ${step.border} backdrop-blur-sm`}
          >
            <span className="text-xl">{step.icon}</span>
            <span className={`font-semibold text-sm ${step.text}`}>{step.label}</span>
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: i * 0.15 + 0.3, duration: 0.2 }}
              className="w-px h-5 bg-gradient-to-b from-white/20 to-transparent origin-top"
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Subjects illustration (Slide 2) ─────────────────────────────────────────

function SubjectsIllustration() {
  const subjects = [
    { name: 'Data Structures', time: '2h 14m', pct: 78, color: '#f97316' },
    { name: 'Operating Systems', time: '1h 32m', pct: 55, color: '#3b82f6' },
    { name: 'Databases', time: '0h 48m', pct: 30, color: '#22c55e' },
  ];

  return (
    <div className="w-full space-y-3" aria-hidden="true">
      {subjects.map((s, i) => (
        <motion.div
          key={s.name}
          {...fadeUp(i * 0.1)}
          className="bg-white/5 rounded-xl p-3 border border-white/10"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs font-medium text-white/80">{s.name}</span>
            </div>
            <span className="text-xs font-mono text-white/50">{s.time}</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${s.pct}%` }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: s.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Habits illustration (Slide 3) ───────────────────────────────────────────

function HabitsIllustration() {
  const habits = [
    { name: 'Coding Practice', done: true, difficulty: 'HIGH' },
    { name: 'Daily Revision', done: true, difficulty: 'MID' },
    { name: 'Reading', done: false, difficulty: 'LOW' },
  ];

  const heatmapRow = [0.1, 0.3, 0.6, 0.85, 1, 0.6, 0.85, 1, 0.3, 1, 0.85, 0.6, 1, 0.85];

  return (
    <div className="w-full space-y-3" aria-hidden="true">
      {habits.map((h, i) => (
        <motion.div
          key={h.name}
          {...fadeUp(i * 0.1)}
          className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2.5 border border-white/10"
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${h.done ? 'bg-orange-500' : 'border border-white/20'}`}
          >
            {h.done && '✓'}
          </div>
          <span className="text-xs text-white/80 flex-1">{h.name}</span>
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
              h.difficulty === 'HIGH'
                ? 'bg-red-500/20 text-red-400'
                : h.difficulty === 'MID'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-green-500/20 text-green-400'
            }`}
          >
            {h.difficulty}
          </span>
        </motion.div>
      ))}
      <motion.div {...fadeUp(0.4)} className="flex gap-1 mt-2 flex-wrap">
        {heatmapRow.map((opacity, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + i * 0.03 }}
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: `rgba(249, 115, 22, ${opacity})` }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Workspace illustration (Slide 4) ────────────────────────────────────────

function WorkspaceIllustration() {
  const columns = [
    { title: 'Backlog', tasks: ['Review DSA notes', 'Practice SQL queries'], color: 'bg-white/5' },
    { title: 'In Progress', tasks: ['Binary search trees'], color: 'bg-orange-500/10' },
    { title: 'Done', tasks: ['Arrays & strings'], color: 'bg-emerald-500/10' },
  ];

  return (
    <div className="w-full flex gap-2" aria-hidden="true">
      {columns.map((col, ci) => (
        <motion.div
          key={col.title}
          {...fadeUp(ci * 0.1)}
          className={`flex-1 rounded-lg p-2 border border-white/10 ${col.color}`}
        >
          <div className="text-[9px] font-semibold text-white/50 uppercase tracking-wider mb-2">
            {col.title}
          </div>
          {col.tasks.map((task, ti) => (
            <motion.div
              key={task}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: ci * 0.1 + ti * 0.08 + 0.2 }}
              className="bg-white/5 rounded px-2 py-1.5 mb-1.5 text-[9px] text-white/70 border border-white/5"
            >
              {task}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Analytics illustration (Slide 5) ────────────────────────────────────────

function AnalyticsIllustration() {
  const bars = [2.5, 4, 3, 5, 2, 4.5, 3.5];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxH = 5;

  return (
    <div className="w-full space-y-3" aria-hidden="true">
      <div className="flex items-end gap-1.5 h-20 px-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.07 + 0.1, duration: 0.4, ease: 'easeOut' }}
              className="w-full rounded-t-sm origin-bottom"
              style={{
                height: `${(h / maxH) * 100}%`,
                background: `rgba(249, 115, 22, ${0.3 + (h / maxH) * 0.7})`,
              }}
            />
            <span className="text-[8px] text-white/30">{days[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Avg session', value: '47m' },
          { label: 'Perfect days', value: '5' },
          { label: 'Best subject', value: 'DSA' },
          { label: '21-day score', value: '4.2★' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeUp(i * 0.08 + 0.4)}
            className="bg-white/5 rounded-lg px-2 py-1.5 border border-white/10"
          >
            <div className="text-[8px] text-white/40">{stat.label}</div>
            <div className="text-xs font-bold text-orange-400">{stat.value}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Daily Review illustration ───────────────────────────────────────────────

function DailyReviewIllustration() {
  return (
    <div className="w-full space-y-3" aria-hidden="true">
      <motion.div {...fadeUp(0.1)} className="bg-white/5 rounded-xl p-3 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-semibold text-white/80">Daily Review</span>
          <span className="text-[9px] text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
            Today
          </span>
        </div>
        <div className="flex justify-center gap-1 my-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.div
              key={star}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: star * 0.1 + 0.3, type: 'spring' }}
              className={`w-5 h-5 rounded-sm flex items-center justify-center text-[10px] ${star <= 4 ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5 text-white/20'}`}
            >
              ★
            </motion.div>
          ))}
        </div>
        <motion.div {...fadeUp(0.8)} className="space-y-1.5 mt-4">
          <div className="h-1.5 bg-white/10 rounded-full w-full" />
          <div className="h-1.5 bg-white/10 rounded-full w-4/5" />
          <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
        </motion.div>
      </motion.div>
      <div className="flex gap-2">
        <motion.div
          {...fadeUp(1)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center"
        >
          <div className="text-[8px] text-white/40">vs Yesterday</div>
          <div className="text-[10px] font-bold text-emerald-400 mt-0.5">+1.0</div>
        </motion.div>
        <motion.div
          {...fadeUp(1.1)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center"
        >
          <div className="text-[8px] text-white/40">7-Day Avg</div>
          <div className="text-[10px] font-bold text-white/80 mt-0.5">3.8 / 5</div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Export illustration (Slide 6) ───────────────────────────────────────────

function ExportIllustration() {
  const exports = [
    { label: 'Export as JSON', icon: '{ }', desc: 'Full data backup' },
    { label: 'Export as Text', icon: '¶', desc: 'Readable format' },
    { label: 'Export Stats', icon: '📊', desc: '21-day analytics' },
  ];

  return (
    <div className="w-full space-y-2" aria-hidden="true">
      {exports.map((e, i) => (
        <motion.div
          key={e.label}
          {...fadeUp(i * 0.12)}
          className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-3 hover:border-orange-500/30 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-sm font-mono text-orange-400 flex-shrink-0">
            {e.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white/80">{e.label}</div>
            <div className="text-[9px] text-white/40">{e.desc}</div>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.12 + 0.3 }}
            className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center"
          >
            <span className="text-[9px] text-orange-400">↓</span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Open Source illustration (Slide 7) ──────────────────────────────────────

function OpenSourceIllustration() {
  return (
    <motion.div {...fadeUp(0)} className="w-full" aria-hidden="true">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white/90">OpenPumta</div>
            <div className="text-[10px] text-white/40">open-source / productivity</div>
          </div>
        </div>
        <div className="flex gap-3">
          {[
            { icon: '⭐', label: 'Stars', value: '1.2k' },
            { icon: '🍴', label: 'Forks', value: '89' },
            { icon: '🔀', label: 'PRs', value: '24' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 bg-white/5 rounded-lg p-2 text-center">
              <div className="text-base">{stat.icon}</div>
              <div className="text-xs font-bold text-white/80">{stat.value}</div>
              <div className="text-[8px] text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-white/40 text-center">github.com/your-org/openpumta</div>
      </div>
    </motion.div>
  );
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

type IllustrationType =
  | 'flow'
  | 'subjects'
  | 'habits'
  | 'workspace'
  | 'analytics'
  | 'dailyreview'
  | 'export'
  | 'opensource';

export function OnboardingIllustration({ type }: { type: IllustrationType }) {
  const map: Record<IllustrationType, React.ReactNode> = {
    flow: <FlowIllustration />,
    subjects: <SubjectsIllustration />,
    habits: <HabitsIllustration />,
    workspace: <WorkspaceIllustration />,
    analytics: <AnalyticsIllustration />,
    dailyreview: <DailyReviewIllustration />,
    export: <ExportIllustration />,
    opensource: <OpenSourceIllustration />,
  };

  return <>{map[type]}</>;
}
