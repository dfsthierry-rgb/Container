import { syncToSheets, syncFromSheets } from './src/utils/sheets.ts';

async function test() {
  const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
  const data = await syncFromSheets(url);
  console.log("Fetched", data.length);
  
  const newData = [...data];
  if (newData.length > 0) {
    const newItem = { ...newData[0] };
    newItem.ref_montreal = 'TEST-SAVE';
    newData.push(newItem);
    console.log("Saving", newData.length, "items");
    const result = await syncToSheets(url, newData);
    console.log("Save result:", result);
  }
}
test();
