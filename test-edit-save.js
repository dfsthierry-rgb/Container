const url = 'https://script.google.com/macros/s/AKfycbwPPEBy8ENPAKT4ZYKdkFf5CYQDzVQxZu9VJuDM-4FLS3jBsFeEJ7UOxFjHfkkzR3qS/exec';
import { syncFromSheets, syncToSheets } from './src/utils/sheets.ts';

async function test() {
    console.log("Fetching...");
    let data = await syncFromSheets(url);
    console.log("Fetched:", data.length);
    let item = data[data.length - 1];
    if (item.ref_montreal === 'TEST-SAVE') {
        item.fob_usd = '99999.99'; // Edit it
        console.log("Saving...");
        let res = await syncToSheets(url, data);
        console.log("Save result:", res);
    } else {
        console.log("Last item is not TEST-SAVE:", item.ref_montreal);
    }
}
test();
