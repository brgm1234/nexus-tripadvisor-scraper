const { Actor } = require('apify');
const axios = require('axios');
const cheerio = require('cheerio');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { searches, maxResults = 20 } = input;
  
  console.log('Starting TripAdvisor scraper...');
  console.log('Searches:', searches);
  console.log('Max results:', maxResults);
  
  const results = [];
  const proxyConfiguration = await Actor.createProxyConfiguration({
    groups: ['RESIDENTIAL']
  });
  
  for (const search of searches) {
    if (results.length >= maxResults) break;
    
    try {
      const searchUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(search)}`;
      
      const response = await axios.get(searchUrl, {
        proxy: proxyConfiguration.createProxyUrl(),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      const listings = $('[data-testid="result-card"]');
      
      listings.each((i, el) => {
        if (results.length >= maxResults) return false;
        
        const name = $(el).find('[data-testid="title"]').text().trim() || 
                    $(el).find('.result-title').text().trim() || '';
        const ratingText = $(el).find('[data-testid="rating"]').text().trim() || 
                          $(el).find('.ui_bubble_rating').attr('class')?.match(/bubble_([0-9]+)/)?.[1] || '';
        const rating = ratingText ? parseInt(ratingText) / 10 : 0;
        const reviewCount = parseInt($(el).find('[data-testid="review-count"]').text().replace(/[^0-9]/g, '')) || 0;
        const category = $(el).find('[data-testid="category"]').text().trim() || '';
        const price = $(el).find('[data-testid="price"]').text().trim() || '';
        const location = $(el).find('[data-testid="location"]').text().trim() || '';
        const imageUrl = $(el).find('img').attr('src') || '';
        const listingUrl = $(el).find('a').attr('href') || '';
        
        results.push({
          name,
          rating,
          reviewCount,
          category,
          price,
          location,
          imageUrl,
          listingUrl: listingUrl.startsWith('http') ? listingUrl : `https://www.tripadvisor.com${listingUrl}`,
          search
        });
      });
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      console.error(`Error scraping search "${search}":`, error.message);
    }
  }
  
  await Actor.pushData(results);
  console.log('Scraping completed. Total results:', results.length);
});