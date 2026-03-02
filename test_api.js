fetch('https://gnews.io/api/v4/search?q=Agriculture&lang=en&max=2&apikey=d70bb0feca0545943e6fff3de23aea39')
    .then(r => r.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => console.error(err));
