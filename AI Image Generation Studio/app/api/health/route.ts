import { APP_VERSION } from '@/lib/constants';
import {
  canGenerate,
  databaseMode,
  hasDatabase,
  hasBlob,
  hasHuggingFace,
  huggingFaceModel,
  storageMode,
} from '@/lib/config';
import { handleApiError, ok } from '@/lib/http';
import type { HealthReport } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const availability = canGenerate();

    const report: HealthReport = {
      status: availability.ok ? 'ok' : 'degraded',
      version: APP_VERSION,
      canGenerate: availability.ok,
      reasons: availability.reasons,
      services: {
        database: { mode: databaseMode, configured: hasDatabase },
        storage: { mode: storageMode, configured: hasBlob },
        generation: {
          mode: 'huggingface',
          configured: hasHuggingFace,
          model: hasHuggingFace ? huggingFaceModel : null,
        },
      },
    };

    return ok({ data: report });
  } catch (error) {
    return handleApiError(error);
  }
}
