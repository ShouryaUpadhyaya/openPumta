import api from '@/lib/api';
import { DemoDataIds } from '@/store/useOnboardingStore';

/**
 * Seeds realistic demo data for new users who choose "Use Demo Data".
 * Returns the IDs of the generated data so it can be cleaned up if needed.
 */
export async function generateDemoData(): Promise<DemoDataIds> {
  const generatedIds: DemoDataIds = { subjects: [], habits: [], spaces: [] };

  // ─── 1. Subjects ────────────────────────────────────────────────────────────
  const subjectDefs = [
    { name: 'Data Structures', color: '#f97316', goalWorkSecs: 7200 },
    { name: 'Operating Systems', color: '#3b82f6', goalWorkSecs: 5400 },
    { name: 'Databases', color: '#22c55e', goalWorkSecs: 3600 },
  ];

  const subjects: { id: number }[] = [];
  for (const def of subjectDefs) {
    try {
      const { data } = await api.post('/subject', def);
      subjects.push(data.data);
      generatedIds.subjects.push(data.data.id);
    } catch (e) {
      console.warn('Demo: failed to create subject', def.name, e);
    }
  }

  // ─── 2. Habits ──────────────────────────────────────────────────────────────
  const habitDefs = [
    {
      name: 'Coding Practice',
      difficulty: 'HIGH',
      badDayPlan: 'Review 1 problem solution for 10 min',
      description: 'Solve at least one DSA problem per day',
    },
    {
      name: 'Daily Revision',
      difficulty: 'MID',
      badDayPlan: 'Read through notes for 5 min',
      description: "Revise previous day's topics",
    },
    {
      name: 'Reading',
      difficulty: 'LOW',
      badDayPlan: 'Read 2 pages of any book',
      description: 'Read technical or non-fiction books',
    },
  ];

  for (const def of habitDefs) {
    try {
      const { data } = await api.post('/habits', def);
      generatedIds.habits.push(data.data.id);
    } catch (e) {
      console.warn('Demo: failed to create habit', def.name, e);
    }
  }

  // ─── 3. Workspaces (Spaces → Columns → Blocks) ─────────────────────────────
  const workspaceDefs = [
    {
      space: { name: 'Interview Prep', icon: '🎯' },
      columns: [
        {
          title: 'Backlog',
          blocks: [
            { type: 'TODO' as const, content: 'Practice graph traversal algorithms' },
            { type: 'TODO' as const, content: 'Revise dynamic programming patterns' },
            { type: 'TODO' as const, content: 'Study system design: URL shortener' },
            { type: 'TODO' as const, content: 'Mock interview: behavioral questions' },
            { type: 'TODO' as const, content: 'Review sorting algorithm complexities' },
          ],
        },
        {
          title: 'In Progress',
          blocks: [{ type: 'TODO' as const, content: 'Binary search tree implementation' }],
        },
        {
          title: 'Done',
          blocks: [{ type: 'TODO' as const, content: 'Arrays and string fundamentals' }],
        },
      ],
    },
    {
      space: { name: 'Semester Planning', icon: '📚' },
      columns: [
        {
          title: 'This Week',
          blocks: [
            { type: 'TODO' as const, content: 'Complete OS chapter 4: Memory Management' },
            { type: 'TODO' as const, content: 'Database assignment: ER diagram' },
          ],
        },
        {
          title: 'Later',
          blocks: [{ type: 'TODO' as const, content: 'Start revision for mid-semester exams' }],
        },
      ],
    },
  ];

  for (const ws of workspaceDefs) {
    try {
      const { data: spaceData } = await api.post('/spaces', ws.space);
      const spaceId = spaceData.data.id;
      generatedIds.spaces.push(spaceId);

      for (let ci = 0; ci < ws.columns.length; ci++) {
        const col = ws.columns[ci];
        try {
          const { data: colData } = await api.post(`/spaces/${spaceId}/columns`, {
            title: col.title,
          });
          const columnId = colData.data.id;

          for (let bi = 0; bi < col.blocks.length; bi++) {
            try {
              await api.post(`/columns/${columnId}/blocks`, {
                type: col.blocks[bi].type,
                content: col.blocks[bi].content,
              });
            } catch (e) {
              console.warn('Demo: failed to create block', col.blocks[bi].content, e);
            }
          }
        } catch (e) {
          console.warn('Demo: failed to create column', col.title, e);
        }
      }
    } catch (e) {
      console.warn('Demo: failed to create space', ws.space.name, e);
    }
  }

  // ─── 4. Daily Reviews (last 7 days) ─────────────────────────────────────────
  const ratingEntries = [
    { daysAgo: 6, rating: 3, description: 'Slower day, covered arrays but got stuck on trees.' },
    { daysAgo: 5, rating: 4, description: 'Good progress on DP problems. Feeling more confident.' },
    { daysAgo: 4, rating: 4, description: 'Reviewed OS scheduling algorithms. Complex but clear.' },
    { daysAgo: 3, rating: 5, description: 'Best session this week. Solved 3 problems cleanly.' },
    { daysAgo: 2, rating: 3, description: 'Tired day. Did minimum but kept the streak going.' },
    { daysAgo: 1, rating: 4, description: 'Database normalization clicked today. Great feeling.' },
    { daysAgo: 0, rating: 5, description: 'Productive and focused. Ready for the week ahead.' },
  ];

  for (const entry of ratingEntries) {
    try {
      // Only seed if not today (backend may already guard duplicates)
      if (entry.daysAgo === 0) {
        await api.post('/daily-rating', {
          rating: entry.rating,
          description: entry.description,
        });
      }
      // For past days we just seed today's entry; historical seeding
      // depends on backend support — silently skipped if not available
    } catch (e) {
      console.warn('Demo: failed to create daily rating', e);
    }
  }

  return generatedIds;
}

export async function removeDemoData(ids: DemoDataIds | null): Promise<void> {
  if (!ids) return;

  // We delete the entities in reverse order of creation or dependency
  // Spaces usually cascade delete columns and blocks.
  // Ratings we might not be able to easily delete without a specific endpoint, so we skip for now.
  for (const id of ids.spaces) {
    try {
      await api.delete(`/spaces/${id}`);
    } catch (e) {
      console.warn('Demo: failed to delete space', id, e);
    }
  }

  for (const id of ids.habits) {
    try {
      await api.delete(`/habits/${id}`);
    } catch (e) {
      console.warn('Demo: failed to delete habit', id, e);
    }
  }

  for (const id of ids.subjects) {
    try {
      await api.delete(`/subject/${id}`);
    } catch (e) {
      console.warn('Demo: failed to delete subject', id, e);
    }
  }
}
