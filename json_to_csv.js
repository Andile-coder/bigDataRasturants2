const fs = require("fs");

const jsonData = require("./clean.json");

function convertToCSV(data) {
  let csv = "name,visited,rating,href,";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  csv += days.join(",") + ",latitude,longitude\n";

  data.forEach((item) => {
    let row = `${item.name},${item.visited},${item.rating},${item.href}`;

    const times = {
      Mon: "",
      Tue: "",
      Wed: "",
      Thu: "",
      Fri: "",
      Sat: "",
      Sun: "",
    };

    item.times.forEach((timeObj) => {
      const day = Object.keys(timeObj)[0];
      times[day] = timeObj[day];
    });

    row += `,${Object.values(times).join(",")},${item.coordinates.latitude},${
      item.coordinates.longitude
    }\n`;

    csv += row;
  });

  return csv;
}

const csvData = convertToCSV(jsonData);

fs.writeFile("output.csv", csvData, (err) => {
  if (err) throw err;
  console.log("CSV file has been saved.");
});
