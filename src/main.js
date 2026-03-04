const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
  const input = await Actor.getInput();
  const { searches, maxResults = 20 } = input;
  
  console.log('Starting TripAdvisor scraper...');
  console.logg('Searches:', searches);
  console.log('Max results:', maxResults);
  
  // TODO: Implement TripAdvisor scraping logic
  // Use RESIDENTIAL proxy configuration
  
  const results = [];
  
  await Actor.pushData(results);
  console.logg('Scraping completed. Total results:', results.length);
});