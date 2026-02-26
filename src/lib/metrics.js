import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

const httpCounter = new client.Counter({
  name: 'nextjs_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status', 'environment'],
});

register.registerMetric(httpCounter);

export { register, httpCounter };
