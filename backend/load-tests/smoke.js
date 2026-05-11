/**
 * k6 smoke test — validates the critical API paths under light load.
 * Run: k6 run load-tests/smoke.js
 *
 * Environment:
 *   BASE_URL  — API base (default: http://localhost:3000)
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';
const API = `${BASE}/api/v1`;

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration', true);
const taskCreateDuration = new Trend('task_create_duration', true);

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.05'],
  },
};

// Shared state seeded in setup()
export function setup() {
  // Register a test user
  const email = `loadtest-${Date.now()}@test.local`;
  const password = 'LoadTest123!';

  const regRes = http.post(`${API}/auth/register`, JSON.stringify({
    email,
    password,
    firstName: 'Load',
    lastName: 'Test',
  }), { headers: { 'Content-Type': 'application/json' } });

  if (regRes.status !== 201) {
    console.error(`Registration failed: ${regRes.status} ${regRes.body}`);
  }

  // For load testing, we need a verified user. In a real setup you'd
  // verify via the DB directly. Here we'll try login — if email verification
  // is enforced, the test will report 403s which is expected behavior.
  const loginRes = http.post(`${API}/auth/login`, JSON.stringify({
    email,
    password,
  }), { headers: { 'Content-Type': 'application/json' } });

  if (loginRes.status === 201) {
    const data = JSON.parse(loginRes.body).data;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      orgId: data.user.currentOrganizationId,
      email,
      password,
    };
  }

  // If login fails (email not verified), return partial data
  return { email, password, accessToken: null, orgId: null };
}

export default function (data) {
  if (!data.accessToken) {
    // Can only test public endpoints
    healthCheck();
    loginAttempt(data);
    sleep(1);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.accessToken}`,
    'x-organization-id': data.orgId,
  };

  // Mix of operations weighted by real-world frequency
  const roll = Math.random();

  if (roll < 0.3) {
    // 30% — list tasks (most common read)
    const res = http.get(`${API}/tasks`, { headers });
    check(res, { 'list tasks 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  } else if (roll < 0.5) {
    // 20% — list projects
    const res = http.get(`${API}/projects`, { headers });
    check(res, { 'list projects 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  } else if (roll < 0.65) {
    // 15% — create task
    const start = Date.now();
    // First get a project to attach the task to
    const projRes = http.get(`${API}/projects`, { headers });
    if (projRes.status === 200) {
      const projects = JSON.parse(projRes.body).data;
      if (projects && projects.length > 0) {
        const res = http.post(
          `${API}/projects/${projects[0].id}/tasks`,
          JSON.stringify({
            title: `Load test task ${Date.now()}`,
            priority: 'medium',
          }),
          { headers },
        );
        taskCreateDuration.add(Date.now() - start);
        check(res, { 'create task 201': (r) => r.status === 201 });
        errorRate.add(res.status !== 201);
      }
    }
  } else if (roll < 0.75) {
    // 10% — get me
    const res = http.get(`${API}/auth/me`, { headers });
    check(res, { 'get me 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  } else if (roll < 0.85) {
    // 10% — health check
    healthCheck();
  } else {
    // 15% — token refresh
    const start = Date.now();
    const res = http.post(`${API}/auth/refresh`, JSON.stringify({
      refreshToken: data.refreshToken,
    }), { headers: { 'Content-Type': 'application/json' } });
    loginDuration.add(Date.now() - start);
    // Refresh may fail after first use (token rotation) — expected
    errorRate.add(res.status >= 500);
  }

  sleep(0.5 + Math.random());
}

function healthCheck() {
  const res = http.get(`${API}/health`);
  check(res, { 'health 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
}

function loginAttempt(data) {
  const start = Date.now();
  const res = http.post(`${API}/auth/login`, JSON.stringify({
    email: data.email,
    password: data.password,
  }), { headers: { 'Content-Type': 'application/json' } });
  loginDuration.add(Date.now() - start);
  // 201 or 403 (unverified) are both acceptable
  check(res, { 'login not 5xx': (r) => r.status < 500 });
  errorRate.add(res.status >= 500);
}
