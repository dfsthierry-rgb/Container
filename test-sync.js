import { syncToSheets, syncFromSheets } from './src/utils/sheets.ts';

const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';

async function test() {
  try {
    console.log('Fetching...');
    const data = await syncFromSheets(url);
    console.log('Fetched:', data.length);
    console.log('Saving...');
    const result = await syncToSheets(url, data);
    console.log('Save result:', result);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
