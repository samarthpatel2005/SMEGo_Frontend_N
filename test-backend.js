// Quick test to verify backend endpoints
const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000/api/auth';
  
  console.log('Testing backend endpoints...');
  
  // Test health endpoint
  try {
    const healthResponse = await fetch('http://localhost:5000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint:', healthData);
  } catch (error) {
    console.error('❌ Health endpoint failed:', error);
  }
  
  // Test create-admin endpoint (with invalid data to see if endpoint exists)
  try {
    const response = await fetch(`${baseUrl}/create-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const data = await response.json();
    console.log('✅ create-admin endpoint exists (validation errors expected):', response.status, data);
  } catch (error) {
    console.error('❌ create-admin endpoint failed:', error);
  }
  
  // Test old endpoint to confirm it doesn't exist
  try {
    const response = await fetch(`${baseUrl}/createAdminAccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('⚠️ Old endpoint response:', response.status);
  } catch (error) {
    console.error('❌ Old endpoint failed (expected):', error);
  }
};

// Run the test
testEndpoints();
