import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// 自定义指标
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');

// 测试配置
export let options = {
  stages: [
    { duration: '2m', target: 20 },   // 预热阶段
    { duration: '5m', target: 50 },   // 正常负载
    { duration: '3m', target: 80 },   // 高负载
    { duration: '2m', target: 100 },  // 峰值负载
    { duration: '5m', target: 100 },  // 持续峰值
    { duration: '2m', target: 0 },     // 冷却阶段
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // P95延迟小于300ms
    http_req_failed: ['rate<0.01'],   // 错误率小于1%
    errors: ['rate<0.01'],
  },
};

// 测试数据
const BASE_URL = 'http://localhost:8000';
const STRATEGIES = ['baseline', 'cache_aside', 'smart_ttl', 'write_through', 'write_behind', 'hybrid'];
const PHOTO_IDS = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 67, 68, 69, 70, 71, 72, 73, 74];

export default function() {
  // 随机选择策略
  const strategy = STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)];
  
  // 随机选择照片ID
  const photoId = PHOTO_IDS[Math.floor(Math.random() * PHOTO_IDS.length)];
  
  // 测试照片详情API
  let response = http.get(`${BASE_URL}/api/experiment/photo/${photoId}?strategy=${strategy}`);
  
  let success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has data': (r) => r.json('data') !== undefined,
    'has metadata': (r) => r.json('metadata') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  // 测试排行榜API
  const rankingsResponse = http.get(`${BASE_URL}/api/experiment/rankings/photos?strategy=${strategy}&period=week&limit=20`);
  
  let rankingsSuccess = check(rankingsResponse, {
    'rankings status is 200': (r) => r.status === 200,
    'rankings response time < 300ms': (r) => r.timings.duration < 300,
    'has rankings data': (r) => r.json('data') !== undefined,
  });
  
  errorRate.add(!rankingsSuccess);
  responseTime.add(rankingsResponse.timings.duration);
  
  // 随机等待
  sleep(Math.random() * 2 + 0.5);
}

export function setup() {
  console.log('开始Redis缓存策略对比实验');
  console.log('测试策略:', STRATEGIES.join(', '));
  console.log('测试照片ID:', PHOTO_IDS.join(', '));
  console.log('目标URL:', BASE_URL);
}

export function teardown(data) {
  console.log('实验完成');
  console.log('总请求数:', data.iterations);
  console.log('平均响应时间:', data.avg_response_time + 'ms');
  console.log('错误率:', data.error_rate * 100 + '%');
}
