const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
  const formData = new URLSearchParams();
  formData.append('action', 'saveAll');
  formData.append('data', JSON.stringify([]));
  const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
  });
  console.log(await resp.text());
}
test();
