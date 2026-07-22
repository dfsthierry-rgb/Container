const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
  const resp = await fetch(url, {
      method: 'OPTIONS',
      headers: {
          'Origin': 'https://ais-dev.run.app',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type'
      }
  });
  console.log("Status:", resp.status);
  console.log("Headers:", Array.from(resp.headers.entries()));
}
test();
