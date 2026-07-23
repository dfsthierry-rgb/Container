const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
    const resp = await fetch(url, {
        method: 'POST',
        redirect: 'follow',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify({ action: 'saveAll', data: [] })
    });
    console.log("Status:", resp.status);
    console.log("Type:", resp.type);
    console.log("Response:", await resp.text());
}
test();
