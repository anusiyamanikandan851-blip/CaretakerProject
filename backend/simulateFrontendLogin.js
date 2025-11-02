const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:5000';
const CRED = { email: 'john@example.com', password: 'password123' };
const STORE_PATH = path.join(__dirname, 'simulatedAsyncStorage.json');

async function run() {
  try {
    const client = axios.create({ baseURL: BASE, timeout: 5000 });
    console.log('Posting to /api/auth/signin');
    const res = await client.post('/api/auth/signin', CRED);
    console.log('Response status', res.status);
    const { token, user } = res.data;

    // Simulate AsyncStorage by writing to a JSON file
    const store = { token, user };
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
    console.log('Wrote simulated AsyncStorage to', STORE_PATH);

    // Now set axios default header to simulate AuthContext wiring
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('Client Authorization header set to:', client.defaults.headers.common['Authorization']);

    // Verify that a subsequent authenticated request to /api/auth/profile returns 200
    const profile = await client.get('/api/auth/profile');
    console.log('/api/auth/profile status', profile.status);
    console.log('Profile body:', profile.data);
  } catch (err) {
    console.error('Error during simulated login:', err && err.response ? err.response.data : err.message);
    process.exitCode = 1;
  }
}

run();
