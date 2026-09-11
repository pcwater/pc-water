const https = require('https');

// Pulls the full, current URL list from the live sitemap (so newly added
// blog posts / hub pages are always included) and submits it to IndexNow.
const SITEMAP_URL = 'https://pcwater.com.au/sitemap.xml';

const indexnowKey = process.env.INDEXNOW_KEY || 'YOUR_INDEXNOW_KEY_HERE';

if (indexnowKey === 'YOUR_INDEXNOW_KEY_HERE') {
  console.error('ERROR: INDEXNOW_KEY environment variable not set.');
  console.error('Set it to your IndexNow key before running this script.');
  console.error('\nExample: INDEXNOW_KEY="your-key-here" node scripts/submit-indexnow.js');
  process.exit(1);
}

function fetchSitemapUrls() {
  return new Promise((resolve, reject) => {
    https
      .get(SITEMAP_URL, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const urls = [...data.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
          resolve(urls);
        });
      })
      .on('error', reject);
  });
}

function submitToIndexNow(urlsToSubmit) {
  const payload = JSON.stringify({
    host: 'pcwater.com.au',
    key: indexnowKey,
    keyLocation: `https://pcwater.com.au/${indexnowKey}.txt`,
    urlList: urlsToSubmit,
  });

  const postOptions = {
    host: 'api.indexnow.org',
    path: '/IndexNow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  console.log(`\nSubmitting ${urlsToSubmit.length} URLs to IndexNow API...`);
  console.log(`Host: ${postOptions.host}`);
  console.log(`Key Location: https://pcwater.com.au/${indexnowKey}.txt\n`);

  const req = https.request(postOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log('SUCCESS: All URLs submitted to IndexNow!');
        console.log(`Status: ${res.statusCode} ${res.statusMessage}`);
      } else {
        console.error('ERROR: IndexNow submission failed.');
        console.error(`Status: ${res.statusCode} ${res.statusMessage}`);
        console.error(`Response: ${data}`);
        process.exitCode = 1;
      }
    });
  });

  req.on('error', (error) => {
    console.error('ERROR: Request failed:', error.message);
    process.exit(1);
  });

  req.write(payload);
  req.end();
}

fetchSitemapUrls()
  .then((urls) => {
    if (!urls.length) {
      console.error('ERROR: No URLs found in sitemap.');
      process.exit(1);
    }
    submitToIndexNow(urls);
  })
  .catch((error) => {
    console.error('ERROR: Failed to fetch sitemap:', error.message);
    process.exit(1);
  });
