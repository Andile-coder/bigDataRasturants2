const pupperteer = require("puppeteer");
const demResturants = require("./demoRest.json");
const fs = require("fs");

let browser;
const findAllRestuarnt = async ({ domain, counter }) => {
  if (counter < 24) {
    if (!browser) {
      browser = await pupperteer.launch({ headless: true });
    }
    let url = `https://www.yelp.com/search?find_desc=Restaurants&find_loc=San+Francisco%2C+CA&start=${counter}0`;
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);
      await page.goto(url);
      const element = await page.waitForSelector("div > .css-ady4rt");
      let restaurantsName = await page.$$(".css-19v1rkv");
      let restaurantsRating = await page.$$(".css-gutk1c");
      restaurantsRating = restaurantsRating.slice(3);
      let newrestaurantsRating = await Promise.all(
        restaurantsRating.map(async (i) => {
          const restaurantRating = await i.evaluate(
            (element) => element.innerHTML
          );

          return restaurantRating;
        })
      );

      restaurantsName = restaurantsName.slice(2);
      restaurantsName.forEach(async (i, index) => {
        let rating = newrestaurantsRating[index];
        const restaurantName = await i.evaluate((element, rating) => {
          return {
            name: element.innerHTML,
            visited: false,
            rating,
            href: element.getAttribute("href"),
          };
        }, rating);
        demResturants.push(restaurantName);
      });

      counter = counter + 1;

      await findAllRestuarnt({ domain: url, counter });
      await page.close();
      // await element.click();
    } catch (error) {
      console.log(error);
      browser.close();
    } finally {
      // await browser.close();
    }
  } else {
    fs.writeFileSync("./newRestaurants.json", JSON.stringify(demResturants));

    browser.close();
  }
};

findAllRestuarnt({
  domain: `https://www.yelp.com/search?find_desc=Restaurants&find_loc=San+Francisco%2C+CA&start=0`,
  counter: 0,
});
