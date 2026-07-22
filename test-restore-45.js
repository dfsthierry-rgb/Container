import fs from 'fs';
const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
    const resp = await fetch(url + '?action=getAll', { redirect: 'follow' });
    const data = await resp.json();
    console.log("Current DB count:", data.length);
}
test();
