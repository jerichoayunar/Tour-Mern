
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testAdminAccess() {
  try {
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@tourbook.com',
        password: 'admin123',
        recaptchaToken: 'dev-token'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }

    console.log('Login successful!');
    const token = loginData.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');

    console.log('\n2. Accessing Admin Dashboard Stats...');
    const statsResponse = await fetch(`${API_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (statsResponse.status === 401) {
      console.error('❌ 401 Unauthorized!');
      const errorData = await statsResponse.json();
      console.error('Error details:', errorData);
    } else if (statsResponse.status === 403) {
      console.error('❌ 403 Forbidden!');
      const errorData = await statsResponse.json();
      console.error('Error details:', errorData);
    } else if (statsResponse.ok) {
      console.log('✅ Success! Status:', statsResponse.status);
      const data = await statsResponse.json();
      console.log('Data:', data);
    } else {
      console.error(`❌ Failed with status ${statsResponse.status}`);
      const text = await statsResponse.text();
      console.error('Response:', text);
    }

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testAdminAccess();
