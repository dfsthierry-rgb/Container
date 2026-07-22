import fs from 'fs';

const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';

async function test() {
  const data = JSON.parse(fs.readFileSync('./restore.json', 'utf8'));
  console.log('Restoring', data.length, 'records...');
  
  const payload = {
    action: 'saveAll',
    data: data
  };

  const resp = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
          'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
  });
  const text = await resp.text();
  console.log(text);
}
test();
