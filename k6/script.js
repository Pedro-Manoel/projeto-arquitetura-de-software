import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20},
    /*{ duration: '1m30s', target: 10},
    { duration: '20s', target: 0},*/
  ]
};
const url = 'http://localhost:3004/api';
const payload = JSON.stringify({
  username: 'k6',
  password: '1234',
});
const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

const authParams = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': ''
  },
}

const product = {
	"name": "Pão",
  "price": 5.50,
  "description": "Pão francês com coco"
}

export function setup() {
  http.post(`${url}/users`, payload, params); // create user if it not exists
  const res = http.post(`${url}/users/login`, payload, params);
  check(res, {
    'login - status is 200': (r) => r.status === 200,
    'is authenticated': (r) => r.json()["token"] != undefined,
  });
  const token = res.json()["token"]
  authParams['headers']['Authorization'] = `Bearer ${token}`;

  const products = http.get(`${url}/products`, authParams);
  const falta = 10-products.json().length;

  for(let i = 0; i < falta; i++) {
    const res2 = http.post(`${url}/products`, JSON.stringify(product), authParams);
    check(res2, {
      'POST products - status is 200': (r) => r.status === 200,
    });
  }
  const products2 = http.get(`${url}/products`, authParams);
  check(products2, {
    'at least one product': (r) => r.json().length > 0
  })
  return {token: token, product_id: products2.json()[0]._id};
}

export default function (data) {
  authParams['headers']['Authorization'] = `Bearer ${data['token']}`;
  const buy_res = http.post(`${url}/products/buy`, JSON.stringify({
    ids: [data['product_id']]
  }), authParams);
  check(buy_res, {
    'buy - status is 201': (r) => r.status === 201,
    'buy is completed': (r) => r.json().status === "completed",
  })
  sleep(1);
}