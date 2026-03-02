async function test() {
    try {
        console.log("Fetching...");
        const res = await fetch('https://braided-constrained-maximilian.ngrok-free.dev/api/dashboard/allCommunity', {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body:", text.substring(0, 500));
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
