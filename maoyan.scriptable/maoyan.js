const $ = importModule("Env");
const maoyanLink = "https://m.maoyan.com/ajax/movieOnInfoList";
const goupdate = true;
const defaultColor = [
  "#ffa39e",
  "#ff9c6e",
  "#ffc069",
  "#ffd666",
  "#5cdbd3",
  "#69c0ff",
];

try {
  const response = await getMaoyan();
  if (response.movieList.length > 0) {
    createWidget(response.movieList);
  } else {
    throw new Error("获取内容失败");
  }
} catch (e) {
  console.log("异常：" + e);
}

function createWidget(data = []) {
  const w = new ListWidget();
  const bgColor = new LinearGradient();
  bgColor.colors = [new Color("#1c1c1c"), new Color("#29323c")];
  bgColor.locations = [0.0, 1.0];
  w.backgroundGradient = bgColor;
  w.centerAlignContent();

  const firstLine = w.addText(`[📣]近期热映电影`);
  firstLine.textSize = 14;
  firstLine.textColor = Color.white();
  firstLine.textOpacity = 0.7;

  data.forEach((item, index) => {
    renderColorText({
      text: `${item.nm}-${item.showInfo}(${item.version || "2d"})  出演：${
        item.star
      }`,
      color: defaultColor[index],
    });
  });

  w.presentMedium();
  return w;
}

function renderColorText(data) {
  const textObj = w.addText(`• ${data.text}`);
  textObj.textSize = 12;
  textObj.textColor = new Color(data.color);
}

//更新代码
function update() {
  log("🔔更新脚本开始!");
  scripts.forEach(async (script) => {
    await $.getFile(script);
  });
  log("🔔更新脚本结束!");
}

const scripts = [
  {
    moduleName: "maoyan",
    url:
      "https://raw.githubusercontent.com/dompling/Script/master/maoyan.scriptable/maoyan.js",
  },
];
if (goupdate) update();
