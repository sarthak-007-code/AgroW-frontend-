const fs = require('fs');
const https = require('https');

function request(url, options, bodyData) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
        if (bodyData) req.write(bodyData);
        req.end();
    });
}

(async () => {
    try {
        let log = '';

        // Fetch communities
        log += "Fetching communities...\n";
        const resCommunities = await request('https://braided-constrained-maximilian.ngrok-free.dev/api/dashboard/allCommunity/', { method: 'GET', headers: { 'ngrok-skip-browser-warning': 'true' } });
        const commData = JSON.parse(resCommunities.data);
        const communities = commData.data || commData;

        let communityId = communities[0].communityId || communities[0]._id;
        log += "Community ID: " + communityId + "\n";

        // Fetch content
        const postBody = JSON.stringify({ communityId });
        const resContents = await request('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getCommunityContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': postBody.length, 'ngrok-skip-browser-warning': 'true' }
        }, postBody);

        const contentData = JSON.parse(resContents.data);
        const posts = contentData.contents || contentData.data || contentData;
        let contentId = posts[0]._id;
        log += "Post ID: " + contentId + "\n";

        const resCommentsGet = await request('https://braided-constrained-maximilian.ngrok-free.dev/api/content/getContentComments/' + contentId, {
            method: 'GET',
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        log += "GET /getContentComments/:contentId Status: " + resCommentsGet.status + "\n";
        log += "Response: " + resCommentsGet.data + "\n";

        fs.writeFileSync('result_comments.txt', log);
    } catch (err) {
        fs.writeFileSync('result_comments.txt', "Error: " + err.message);
    }
})();
