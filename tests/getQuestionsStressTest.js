import http from 'k6/http';
import { check } from 'k6';

export let options = {
    scenarios: {
        constant_request_rate: {
            executor: 'constant-arrival-rate',
            rate: 1000, // x iterations
            timeUnit: '1s', // per time unit
            duration: '30s',
            preAllocatedVus: 1000, // how large the initial pool of Vus would be
            maxVus: 20000 // if the preAllocatedVus are not enough, we can initialize more
        },
    },
};

export default function () {
  var product_id = 900000 + Math.round(100000 * Math.random());
  let res = http.get(`http://localhost:5000/qa/questions?product_id=${product_id}`);
  check(res, { 'status was 200': (r) => r.status == 200});
};