async function test() {
  const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnR7jmptyAPgkg3-vCoIgjhsKb_x34iV5q6hshzDycVu-9l6CTTFxOGRjjZIY5ZRbeRLAnnKxU0hWMzb1bLbMZU6EZ8dsqIKRDa71mxH6HgMM_5fMAyuyvRjWaJ9Ca_4vzVpwXEQykM69bf7QU2Jrs8_9GRCsb_PNWuIvaZGTDGIo9pni-tbtqO1bqenY5UHWqXCMHUdKsJhtmI9Dj0lNiUXIKDs3Hg9TtxGR8MaWirHGHFXJF35UsG18Z0W83rijKHldlQz4bPnC6t7uTanXpKrTIZ_pQ&lib=MmiFXol72eRuwg5bhp28xU1Llk8d2jkZN';
  const resp = await fetch(url, {
      method: 'GET',
      headers: {
          'Origin': 'https://ais-dev.run.app'
      }
  });
  console.log("Status:", resp.status);
  console.log("Headers:", Array.from(resp.headers.entries()));
}
test();
