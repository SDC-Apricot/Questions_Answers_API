import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    constant_request_rate: {
        executor: 'constant-arrival-rate',
        rate: 1, // x iterations
        timeUnit: '1s', // per time unit
        duration: '30s',
        preAllocatedVus: 1, // how large the initial pool of Vus would be
        maxVus: 20000 // if the preAllocatedVus are not enough, we can initialize more
    },
  },
};

export default function () {
  var question_id = 3167066 + Math.round(351896 * Math.random());
  let res = http.get(`http://localhost:5000/qa/questions/${question_id}/answers`);
  check(res, { 'status was 200': (r) => r.status == 200});
};