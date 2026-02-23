import { register, httpCounter } from '@/lib/metrics';

export const runtime = 'nodejs';

export async function GET(req) {

  httpCounter.inc({
    method: 'GET',
    route: '/api/metrics',
    status: 200
  });

  return new Response(await register.metrics(), {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}