import { syncFromSheets } from './src/utils/sheets.ts';

async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
  const data = await syncFromSheets(url);
  console.log("Length:", data.length);
  if (data.length > 0) {
      console.log("First item:", data[0]);
  }
}
test();
