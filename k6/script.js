import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    users_test: {
      executor: 'constant-vus',
      exec: 'user_info',
      vus: 15,
      duration: '15m30s'
    },
    orders_test: {
      executor: 'constant-vus',
      exec: 'list_orders',
      vus: 10,
      duration: '15m30s'
    },
    products_test: {
      executor: 'ramping-vus',
      exec: 'list_products',
      stages: [
        { duration: '5m', target: 30},
        { duration: '5m', target: 60},
        { duration: '5m', target: 90}
      ],
    }
  },
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
  const QTD_PRODUTOS = 100;
  const falta = QTD_PRODUTOS-products.json().length;

  for(let i = 0; i < falta; i++) {
    const res2 = http.post(`${url}/products`, JSON.stringify(product), authParams);
    check(res2, {
      'POST products - status is 200': (r) => r.status === 200,
    });
  }
  const products2 = http.get(`${url}/products`, authParams);
  check(products2, {
    'at least 15 products': (r) => r.json().length >= QTD_PRODUTOS
  });
  return {token: token, product_id: products2.json()[0]._id};
}

// CONSTANT LOAD
export function user_info(data) {
  authParams['headers']['Authorization'] = `Bearer ${data['token']}`;
  const users = http.get(`${url}/users`, authParams);
  check(users, {
    'GET /users is 200': (r) => r.status === 200
  });
  sleep(1);
}

// CONSTANT LOAD
export function list_orders(data) {
  authParams['headers']['Authorization'] = `Bearer ${data['token']}`;
  const orders = http.get(`${url}/orders`, authParams);
  check(orders, {
    'GET /orders is 200': (r) => r.status === 200
  });
  sleep(1);
}

export function list_products(data) {
  authParams['headers']['Authorization'] = `Bearer ${data['token']}`;
  const products2 = http.get(`${url}/products`, authParams);
  check(products2, {
    'GET /products is 200': (r) => r.status === 200
  })
  sleep(1);
}