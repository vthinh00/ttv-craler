var Crawler = require("crawler");
var fs = require("fs");
var path = require("path");

const maxConnection = parseInt(process.argv[3]) || 1;
const outputPath = __dirname;
const pathArg = process.argv[4];
if (pathArg && pathArg.length) {
  if (fs.existsSync(pathArg)) {
    outputPath = pathArg;
  } else {
    let tmpPath = path.join(__dirname, pathArg);
    if (fs.existsSync(tmpPath)) {
      outputPath = tmpPath;
    }
  }
}

var storyID = process.argv[2] || "27518";

const folder = path.join(outputPath, storyID);
if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder);
}
const textFolder = path.join(folder, "text");
if (!fs.existsSync(textFolder)) {
  fs.mkdirSync(textFolder);
}
const filePath = path.join(textFolder, `${storyID}.txt`);

var c = new Crawler({
  maxConnections: maxConnection,
  callback: function (error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      var ar = res.options.uri.split("=");
      var nb = ar[ar.length - 1];
      var idx = +nb;
      var te = $.text();
      var title = [];
      $("h5 .more-chap").each(function (x) {
        title[x] = $(this).text();
      });
      $(".box-chap").each(async function (x) {
        var tex = $(this).text();
        var id = idx + x;
        fs.appendFileSync(filePath, `\n${title[x]}\n\n${tex}\n`);
        return Promise.resolve();
      });
      var ne = +nb + 4;
      console.log(ne);
      console.log(title.join("\n"));
      if (te.length > 100)
        c.queue(
          "https://truyen.tangthuvien.vn/get-4-chap?story_id=" +
            storyID +
            "&sort_by_ttv=" +
            ne
        );
    }
    done();
  },
});

c.on("schedule", (options) => {
  options.proxy = "http://vietguess.com:8118";
});

c.queue(
  "https://truyen.tangthuvien.vn/get-4-chap?story_id=" +
    storyID +
    "&sort_by_ttv=0"
);
