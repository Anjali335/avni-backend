import fs from 'fs';
import path from 'path';

async function testUpload() {
  try {
    console.log('Logging in to get token...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'adminavnicarscollections@gmail.com',
        password: 'avniauto1234'
      })
    });
    
    if (!loginRes.ok) {
      const text = await loginRes.text();
      throw new Error(`Login failed: ${text}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Logged in successfully. Token obtained.');

    console.log('Preparing Form Data with dummy file...');
    const form = new FormData();
    form.append('caption', 'Test Upload Client');
    form.append('orderIndex', '0');
    
    const dummyFilePath = path.join(process.cwd(), 'scratch', 'dummy.png');
    fs.writeFileSync(dummyFilePath, 'dummy data');
    
    const blob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'image/png' });
    form.append('image', blob, 'dummy.png');

    console.log('Sending upload request to backend...');
    const uploadRes = await fetch('http://localhost:5000/api/happy-clients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });

    const status = uploadRes.status;
    console.log(`Response Status: ${status}`);
    const data = await uploadRes.json();
    console.log('Response Body:', data);
    
    // clean up dummy file
    fs.unlinkSync(dummyFilePath);
  } catch (err) {
    console.error('Test upload script failed:', err);
  }
}

testUpload();
