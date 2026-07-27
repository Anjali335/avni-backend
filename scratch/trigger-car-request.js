import fs from 'fs';
import path from 'path';

async function testCarUpload() {
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
    form.append('name', 'BMW Test 2026');
    form.append('brand', 'BMW');
    form.append('year', '2026');
    form.append('price', '4500000');
    form.append('mileage', '1000');
    form.append('fuel', 'Petrol');
    form.append('transmission', 'Automatic');
    form.append('type', 'SUV');
    form.append('color', 'Black');
    form.append('engine', '2.0L');
    form.append('seats', '5');
    form.append('ownership', '1');
    form.append('description', 'Test desc');
    form.append('features', JSON.stringify(['Leather Seats', 'Sunroof']));
    form.append('placement', 'everywhere');
    
    const dummyFilePath = path.join(process.cwd(), 'scratch', 'dummy.png');
    fs.writeFileSync(dummyFilePath, 'dummy data');
    
    const blob = new Blob([fs.readFileSync(dummyFilePath)], { type: 'image/png' });
    form.append('image', blob, 'dummy.png');

    console.log('Sending upload request to backend...');
    const uploadRes = await fetch('http://localhost:5000/api/cars', {
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
    
    fs.unlinkSync(dummyFilePath);
  } catch (err) {
    console.error('Test car upload script failed:', err);
  }
}

testCarUpload();
