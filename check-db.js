const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
    const resp = await fetch(url + '?action=getAll', { redirect: 'follow' });
    const data = await resp.json();
    console.log("Count:", data.length);
    console.log("Last item:", data[data.length - 1]);
}
test();
