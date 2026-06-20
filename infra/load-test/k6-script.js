import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:4000/api/v1';

export const options = {
  scenarios: {
    ramp_to_5k: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 500 },
        { duration: '2m', target: 2000 },
        { duration: '3m', target: 5000 },
        { duration: '2m', target: 5000 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'], // sub-300ms p95 target
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // Health
  const health = http.get(`${BASE}/health`);
  check(health, { 'health 200': (r) => r.status === 200 });

  // Public community feed (read-heavy path)
  const list = http.get(`${BASE}/communities?limit=20`);
  check(list, { 'communities 200': (r) => r.status === 200 });

  sleep(1);
}
