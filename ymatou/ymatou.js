
/**
 *
 * hostname = app.ymatou.com
 *
 * # Surge
 * Rewrite: ymatou = type=http-request,pattern=^https:\/\/app\.ymatou\.com\/api\/trading\/scartprodnum,script-path=https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.cookie.js,debug=true
 * Tasks: ymatou-签到 = type=cron,cronexp=10 0 * * *,script-path=https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.js,wake-system=true
 *
 * # QuanX
 * ^https:\/\/app\.ymatou\.com\/api\/trading\/scartprodnum url script-request-header https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.cookie.js
 * 10 0 * * * https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.js, tag=洋码头-签到
 *
 * # Loon
 * http-response ^https:\/\/app\.ymatou\.com\/api\/trading\/scartprodnum script-path=https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.cookie.js
 * cron "10 0 * * *" script-path=https://raw.githubusercontent.com/dompling/Script/master/ymatou/ymatou.js
 * 
 * # 获取方式:进入签到页面获取，手机 APP: 洋码头->个人中心->右上角签到
 */

const $ = new API("ymatou", true);

const accessToken = $.read("accessToken"); // URL的 accessToken
const deviceId = $.read("deviceId");  // 设备 ID
const cookie = $.read("cookie"); // 登陆 Cookie

const baseUrl ='https://m.ymatou.com/coin/api/';

const headers = {
  Cookie: cookie,
  "Content-Type": `application/json`,
  "User-Agent": "*",
};

const body = { accessToken, deviceId };

const commonCofing = {
  headers: headers,
  body: JSON.stringify(body),
};

!(async () => {
  if (cookie) throw new Error("请获取设备信息和Cookie");
  const signRes = await sign();
  const coinRes = await getCoin();
  let title = "👘洋码头",
    subtitle,
    content;
  if (signRes.status === 198) {
    subtitle = signRes.result.message;
  }
  if (coinRes.Code === 200) {
    const { Data } = coinRes;
    content = `\n💰总硬币：${Data.totalCoin}\n\n💰今日：${Data.curCoin}\n\n💰昨日：${Data.prevCoin}`;
  }
  $.notify(title, subtitle, content);
})()
  .catch((e) => {
    console.log(e);
    $.notify("👘洋码头", "签到失败内容失败", "请获取设备信息和Cookie");
  })
  .finally(() => {
    $.done({});
  });

function sign() {
  return $.http
    .post({
      url: `${baseUrl}postCheckin?accessToken=${accessToken}`,
      headers: commonCofing.headers,
      body: commonCofing.body,
    })
    .then(({ body }) => {
      return JSON.parse(body);
    });
}

function getCoin() {
  return $.http
    .get({
      url: `${baseUrl}getUserCoin?accessToken=${accessToken}`,
      headers: commonCofing.headers,
      body: commonCofing.body,
    })
    .then(({ body }) => {
      return JSON.parse(body);
    });
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return(["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach((h)=>(u[h.toLowerCase()]=(u)=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,d={onRequest:()=>{},onResponse:(e)=>e,onTimeout:()=>{},...h.events,};let l,a;if((d.onRequest(u,h),s))l=$task.fetch({method:u,...h});else if(o||i||r)l=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i,})})});else if(n){const e=new Request(h.url);(e.method=u),(e.headers=h.headers),(e.body=h.body),(l=new Promise((t,s)=>{e.loadString().then((s)=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s,})}).catch((e)=>s(e))}))}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(d.onTimeout(),t(`${u}URL:${h.url}exceeds the timeout ${c}ms`)),c)}):null;return(f?Promise.race([f,l]).then((e)=>(clearTimeout(a),e)):l).then((e)=>d.onResponse(e))})(h,u))),u)}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r}=ENV();return new(class{constructor(e,t){(this.name=e),(this.debug=t),(this.http=HTTP()),(this.env=ENV()),(this.node=(()=>{if(n){return{fs:require("fs")}}return null})()),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if((s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n)){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.root={}),(e=`${this.name}.json`),this.node.fs.existsSync(e)?(this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.cache={}))}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},(e)=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},(e)=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?((t=t.substr(1)),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):(this.cache[t]=e),this.persistCache()}read(e){return(this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:((e=e.substr(1)),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0))}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?((e=e.substr(1)),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],d=h["media-url"],l=u+(c?`\n点击跳转:${c}`:"")+(d?`\n多媒体:${d}`:"");if((s&&$notify(e,t,u,h),i&&$notification.post(e,t,l),o&&$notification.post(e,t,u,c),n))if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+l})}else console.log(`${e}\n${t}\n${l}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise((t)=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&(($context.headers=e.headers),($context.statusCode=e.statusCode),($context.body=e.body))}})(e,t)}
/*****************************************************************************/
