// scrapeFlipkart.js
const cheerio = require('cheerio');

const scrapeFlipkartPrice = async (url) => {
  const { default: fetch } = await import('node-fetch'); // Dynamically import node-fetch
  const apiKey = 'api_key'; // Replace with your ScraperAPI key
  const apiEndpoint = `http://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}&render=true`;

  try {
    const response = await fetch(apiEndpoint);
    const html = await response.text();
    const $ = cheerio.load(html);

    const price = $('.Nx9bqj').first().text().trim(); // Adjust selector if needed
    if (price) {
      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      return { price: numericPrice, source: 'Flipkart' };
    } else {
      console.log("Flipkart price not found!");
      return null;
    }
  } catch (error) {
    console.error('Error fetching Flipkart price:', error.message);
    return null;
  }
};

module.exports = scrapeFlipkartPrice;
