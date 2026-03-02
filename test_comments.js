async function test() {
    try {
        const res2 = await fetch('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getCommunityContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ communityId: 'test' })
        });
        const text2 = await res2.text();
        console.log('getCommunityContent POST ->', res2.status, text2.substring(0, 100));
    } catch (e) { }

    try {
        const res = await fetch('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getComments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ contentId: 'test' })
        });
        const text = await res.text();
        console.log('getComments POST ->', res.status, text.substring(0, 100));
    } catch (e) { }

    try {
        const res = await fetch('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getContentComments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
            body: JSON.stringify({ contentId: 'test' })
        });
        const text = await res.text();
        console.log('getContentComments POST ->', res.status, text.substring(0, 100));
    } catch (e) { }

    try {
        const res3 = await fetch('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getCommunityContent/test', {
            method: 'GET',
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        const text3 = await res3.text();
        console.log('getCommunityContent GET /:id ->', res3.status, text3.substring(0, 100));
    } catch (e) { }
}

test();
