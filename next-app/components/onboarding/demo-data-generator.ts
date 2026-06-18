import api from '@/lib/api';
import { DemoDataIds } from '@/store/useOnboardingStore';

/**
 * Seeds realistic demo data for new users.
 * Returns the IDs of the generated data so it can be cleaned up if needed.
 */
export async function generateDemoData(): Promise<DemoDataIds> {
  try {
    const { data } = await api.post('/demo/seed');
    return data.data; // The backend returns DemoDataIds
  } catch (error) {
    console.error('Failed to generate demo data:', error);
    // Return empty ids on failure so it won't crash
    return { subjects: [], habits: [], spaces: [], ratings: [] };
  }
}

/**
 * Removes the demo data.
 * @param ids The generated data IDs to remove.
 * @param keepTemplate If true, keeps the workspace/habits/subjects but deletes historical logs.
 */
export async function removeDemoData(ids: DemoDataIds | null, keepTemplate = false): Promise<void> {
  if (!ids) return;

  try {
    await api.post('/demo/cleanup', { ids, keepTemplate });
  } catch (error) {
    console.error('Failed to clean up demo data:', error);
  }
}
