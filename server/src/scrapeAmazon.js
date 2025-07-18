// // scrapeAmazon.js
// const cheerio = require('cheerio');

// const scrapeAmazonPrice = async (url) => {
//   const { default: fetch } = await import('node-fetch'); // Dynamically import node-fetch
//   const apiKey = '29ac33aa7c7d99c527494ebe1691d864'; // Replace with your ScraperAPI key
//   const apiEndpoint = `http://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;

//   try {
//     const response = await fetch(apiEndpoint);
//     const html = await response.text();
//     const $ = cheerio.load(html);

//     const priceWhole = $('.a-price-whole').first().text().trim(); // Adjust selector if needed
//     if (priceWhole) {
//       const price = parseFloat(priceWhole.replace(',', ''));
//       return { price, source: 'Amazon' };
//     } else {
//       console.log("Amazon price not found!");
//       return null;
//     }
//   } catch (error) {
//     console.error('Error fetching Amazon price:', error.message);
//     return null;
//   }
// };

// module.exports = scrapeAmazonPrice;

// scrapeAmazon.js
const cheerio = require('cheerio');

const scrapeAmazonPrice = async (url) => {
  const { default: fetch } = await import('node-fetch');
  const apiKey = 'api_key';
  const apiEndpoint = `http://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;

  try {
    const response = await fetch(apiEndpoint);
    const html = await response.text();
    const $ = cheerio.load(html);

    const priceWhole = $('.a-price-whole').first().text().trim();
    const priceFraction = $('.a-price-fraction').first().text().trim();

    // If priceFraction exists, combine; otherwise, use priceWhole only
    let fullPrice = priceWhole ? priceWhole : '';
    fullPrice += priceFraction ? priceFraction : '';

    // Remove commas and parse the combined price
    fullPrice = fullPrice.replace(/,/g, '');
    const price = parseFloat(fullPrice);

    if (!isNaN(price)) {
      return { price, source: 'Amazon' };
    } else {
      console.log("Error parsing price: ", fullPrice);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Amazon price:', error.message);
    return null;
  }
};

module.exports = scrapeAmazonPrice;
