const pupperteer = require("puppeteer");
const rasturants = require("./newRestaurants.json");
const fs = require("fs");
let browser;
const getInfo = async ({ domain, counter, rasturants }) => {
  if (!browser) {
    browser = await pupperteer.launch({ headless: true });
  }
  let url = `https://www.yelp.com/search?find_desc=Restaurants&find_loc=San+Francisco%2C+CA&start=${counter}0`;

  try {
    for (let i = 0; i < rasturants.length; i++) {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(0);
      await page.goto(`https://www.yelp.com/${rasturants[i].href}`);

      let days = await page.$$(".day-of-the-week__09f24__JJea_");
      let operating_days = await Promise.all(
        days.map(async (i) => {
          const weekday = await i.evaluate((element) => element.innerHTML);

          return weekday;
        })
      );
      // console.log("days", operating_days);
      // console.log("times", operating_times);
      const element = await page.$("p.day-of-the-week__09f24__JJea_");
      if (element) {
        const day = await element.evaluate((el) => el.textContent);
        console.log("Day:", day);
      }

      const timeElements = await page.$$("p.no-wrap__09f24__c3plq");
      if (timeElements) {
        let operating_times = await Promise.all(
          timeElements.map(async (i) => {
            const operatingTime = await i.evaluate(
              (element) => element.textContent
            );

            return operatingTime;
          })
        );

        // console.log("times", operating_times);
      }
      const operatingTimes = await page.evaluate(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const rows = document.querySelectorAll("tr.css-29kerx");

        const operatingTimes = [];

        rows.forEach((row, index) => {
          const dayElement = row.querySelector(
            "p.day-of-the-week__09f24__JJea_"
          );
          const timeElement = row.querySelector("p.no-wrap__09f24__c3plq");

          if (dayElement && timeElement) {
            const day = dayElement.textContent;
            const operatingTime = timeElement.textContent;
            operatingTimes.push({ [day]: operatingTime });
          }
        });

        return operatingTimes;
      });
      const coordinates = await page.evaluate(() => {
        const imageElement = document.querySelector(
          "div.container__09f24__fZQnf img"
        );
        const src = imageElement ? imageElement.getAttribute("src") : "";
        const regex = /center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/;
        const match = src.match(regex);

        if (match) {
          const latitude = parseFloat(match[1]);
          const longitude = parseFloat(match[2]);
          return { latitude, longitude };
        } else {
          return null; // Coordinates not found
        }
      });

      console.log(coordinates);

      rasturants[i]["times"] = operatingTimes;
      rasturants[i]["coordinates"] = coordinates;

      fs.writeFileSync("./newRestaurants.json", JSON.stringify(rasturants));
    }
  } catch (error) {
    console.log(error);
    browser.close();
  } finally {
    // await browser.close();
  }
};

getInfo({ domain: "", counter: 0, rasturants });
