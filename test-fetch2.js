import { syncFromSheets } from './src/utils/sheets.ts';
const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
async function test() {
  const data = await syncFromSheets(url);
  console.log(data);
}
test();
