/**
 * k6 stress test — ramps up to find the breaking point.
 * Run: k6 run load-tests/stress.js
 *
 * Tests:
 * - Sustained load at 50 VUs (target for small SaaS)
 * - Spike to 100 VUs (simulates traffic burst)
 * - Graceful ramp-down
 *
 * Key metrics to watch:
 * - http_req_duration p95 — should stay under 1s
 * - errors rate — should stay under 5%
 * - iteration_duration — overall request cycle time
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const API = `${BASE}/api/v1`;

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // warm up
    { duration: '1m', target: 50 },     // sustained load
    { duration: '30s', target: 100 },   // spike
    { duration: '1m', target: 100 },    // hold spike
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    errors: ['rate<0.1'],
  },
};

export function setup() {
  // Pre-create a user for authenticated tests (same as smoke.js)
  const email = `stress-${Date.now()}@test.local`;
  const password = 'StressTest123!';

  http.post(`${API}/auth/register`, JSON.stringify({
    email, password, firstName: 'Stress', lastName: 'Test',
  }), { headers: { 'Content-Type': 'application/json' } });

  const loginRes = http.post(`${API}/auth/login`, JSON.stringify({
    email, password,
  }), { headers: { 'Content-Type': 'application/json' } });

  if (loginRes.status === 201) {
    const data = JSON.parse(loginRes.body).data;
    return { accessToken: data.accessToken, orgId: data.user.currentOrganizationId };
  }
  return { accessToken: null, orgId: null };
}

export default function (data) {
  // Under stress, focus on the most database-heavy operations
  const headers = data.accessToken
    ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.accessToken}`,
        'x-organization-id': data.orgId,
      }
    : { 'Content-Type': 'application/json' };

  // Health check — always works, baseline latency
  const healthRes = http.get(`${API}/health`);
  check(healthRes, { 'health ok': (r) => r.status === 200 });
  errorRate.add(healthRes.status !== 200);

  if (data.accessToken) {
    // Task listing — exercises DB + cache + RLS
    const taskRes = http.get(`${API}/tasks`, { headers });
    check(taskRes, { 'tasks ok': (r) => r.status === 200 });
    errorRate.add(taskRes.status >= 500);

    // Project listing
    const projRes = http.get(`${API}/projects`, { headers });
    check(projRes, { 'projects ok': (r) => r.status === 200 });
    errorRate.add(projRes.status >= 500);
  }

  sleep(0.3 + Math.random() * 0.7);
}
