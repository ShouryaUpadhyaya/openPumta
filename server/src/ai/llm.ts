import { Metrics } from './engine.js';

function metricsToContext(m: Metrics): string {
  const lines: string[] = [];
  lines.push(
    `Focus this week: ${m.focus.thisWeekMinutes} min (avg ${m.focus.avgDailyThisWeek} min/day).`,
  );
  if (m.focus.pctChange !== null) {
    lines.push(
      `Focus vs last week: ${m.focus.pctChange > 0 ? '+' : ''}${m.focus.pctChange}% (${m.focus.direction}).`,
    );
  }
  lines.push(`Habit consistency: ${m.habits.overallPct}% across ${m.habits.trackedHabits} habits.`);
  const habitDetail = m.habits.perHabit.map((h) => `${h.name} ${h.consistencyPct}%`).join(', ');
  if (habitDetail) lines.push(`Per habit: ${habitDetail}.`);
  lines.push(
    `Subjects: ` +
      m.subjects
        .map(
          (s) =>
            `${s.name} ${s.actualMinutes}min${s.goalMetPct !== null ? ` (${s.goalMetPct}% of goal)` : ''}`,
        )
        .join(', ') +
      '.',
  );
  if (m.mood.avgThisWeek !== null) {
    lines.push(
      `Mood this week: ${m.mood.avgThisWeek}/5${m.mood.avgPrevWeek !== null ? ` (was ${m.mood.avgPrevWeek}/5)` : ''}.`,
    );
  }
  lines.push(
    `Burnout risk: ${m.burnoutRisk.level.toUpperCase()}${m.burnoutRisk.reasons.length ? ` — ${m.burnoutRisk.reasons.join('; ')}` : ''}.`,
  );
  lines.push(`Strongest: ${m.strongestSubject || 'n/a'}. Weakest: ${m.weakestSubject || 'n/a'}.`);
  return lines.join('\n');
}

const COACH_PERSONA = `You are a warm, encouraging study coach inside a focus-tracking app called openPumta.
You speak like a supportive mentor: honest but motivating, never preachy or robotic.
CRITICAL RULES:
- Only use the numbers given to you in the DATA block. Never invent or estimate figures.
- If the data shows a problem, acknowledge it kindly, then give ONE or TWO concrete, doable next steps.
- Keep it human and concise. Celebrate real wins. Don't lecture.`;

export function buildWeeklyReportPrompt(metrics: Metrics): string {
  const context = metricsToContext(metrics);
  return `${COACH_PERSONA}\n\nHere is the student's data for the past week:\n\nDATA:\n${context}\n\nWrite a short weekly report with:\n1. A one-line honest headline on how the week went.\n2. What went well (be specific, use their numbers).\n3. The main thing to watch (especially if burnout risk is moderate/high).\n4. A simple 3-point plan for next week.\nKeep the whole thing under 250 words and warm in tone.`;
}

export function buildChatPrompt(
  metrics: Metrics,
  conversationHistory: { role: string; content: string }[],
  userMessage: string,
): string {
  const context = metricsToContext(metrics);
  const historyText = conversationHistory
    .map((m) => `${m.role === 'user' ? 'Student' : 'Coach'}: ${m.content}`)
    .join('\n');
  return `${COACH_PERSONA}\n\nThe student's current data is below. Use it to ground every answer.\n\nDATA:\n${context}\n\n${historyText ? `Previous conversation:\n${historyText}\n\n` : ''}Student: ${userMessage}`;
}

export async function callGroq(prompt: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY not set in environment');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
