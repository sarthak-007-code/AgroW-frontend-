const https = require('https');

function sendRequest(method) {
    const data = JSON.stringify({ role: 'farmer' });

    const options = {
        hostname: 'braided-constrained-maximilian.ngrok-free.dev',
        port: 443,
        path: '/api/dashboard/getUserCommunity/Sarthak',
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
            'ngrok-skip-browser-warning': 'true'
        }
    };

    const req = https.request(options, (res) => {
        let responseBody = '';
        res.on('data', d => responseBody += d);
        res.on('end', () => console.log(`[${method}] ${res.statusCode}: ${responseBody.substring(0, 100)}`));
    });

    req.on('error', (e) => console.error(e));
    req.write(data);
    req.end();
}

console.log("Testing POST...");
sendRequest('POST');
setTimeout(() => {
    console.log("Testing GET...");
    sendRequest('GET');
}, 2000);
