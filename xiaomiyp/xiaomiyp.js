
/**
 *
 * hostname = m.xiaomiyoupin.com
 * [Rewrite]
 * ^https:\/\/m\.xiaomiyoupin\.com\/api\/auth\/login\/isloggedin url script-request-header xiaomiyp.cookie.js
 * [task]
 * 1 0 * * * xiaomiyp.js
 * # 获取方式:进入签到页面获取，https://m.xiaomiyoupin.com:个人中心->我的资产->积分
 */

const $ = new API("xiaomiyp", true);
const cookie = $.read("cookie"); // 登陆 Cookie
const baseUrl ='https://m.xiaomiyoupin.com/';

const headers = {
  Cookie: cookie,
  "Content-Type": `application/x-www-form-urlencoded`,
  Referer: `https://m.xiaomiyoupin.com/score?spmref=YouPinM.$Myassets$.score.0.2835114337289`,
};

const  title = "🍚小米有品";
!(async () => {
  if (!cookie) throw new Error("请获取设备信息和Cookie");
  const isLogin = await login();
  if (isLogin.data !== 200) throw new Error("登陆失效，请重新登陆");
  const signRes = await sign();
  if (signRes.message !== "ok") throw new Error("获取基础信息出错签到失败");
  
  let msg,count,point;
  point = signRes.result.request.data.balance;
  signRes.result.request.data.msg === "already done"
    ? (msg = "已签到")
    : (msg = "签到成功");
  const verifyObj = await verifySign();
  if (verifyObj.message !== "ok") throw new Error("获取基础信息出错签到失败");
  let desc =
    (verifyObj.result.signList[0] || {}).descr ||
    "1天1积分，2天2积分，……，5天及以后5积分";
  count = verifyObj.result.score.data.balance;  
  $.notify(title, "", `🕘签到：${msg} (+${point}) 积分：${count} \n📒描述：${desc}`);
  $.done();
})()
  .catch((e) => {
    console.log(e);
    $.notify(title, "签到失败内容失败", "❎原因：" + e.message);
  })
  .finally(() => {
    $.done({});
  });

function login() {
  const params = {
    url: `${baseUrl}api/auth/login/isloggedin`,
    headers: headers,
  };
  return $.http.get(params).then(({ body }) => {
    return JSON.parse(body);
  });
}

function verifySign() {
  const body = {
    score: { model: "Score", action: "getScore" },
    signList: {
      model: "Score",
      action: "getScoreUserDoneTask",
      parameters: { tid: "1", pageSize: 10, pageIndex: 1 },
    },
    consumeList: {
      model: "Score",
      action: "getScoreTask",
      parameters: { pageSize: 10, pageIndex: 1, type: "1" },
    },
    taskList: {
      model: "Score",
      action: "getScoreTask",
      parameters: { pageSize: 10, pageIndex: 1, type: "0" },
    },
    doingList: {
      model: "Score",
      action: "getScoreUserTask",
      parameters: { pageSize: 10, pageIndex: 1, type: 0 },
    },
    signInScore: { model: "Score", action: "getSignInScore" },
  };;
  return sign(body);
}

function sign(body = { request: { model: "Score", action: "signIn" } }) {
  const params = {
    url: `${baseUrl}app/shopv3/pipe`,
    headers: headers,
    body: encodeURI(`data=${JSON.stringify(body)}`),
  };
  return $.http.post(params).then(({ body }) => {
    const response = JSON.parse(body);
    return response;
  });
}




// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return(["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach((h)=>(u[h.toLowerCase()]=(u)=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,d={onRequest:()=>{},onResponse:(e)=>e,onTimeout:()=>{},...h.events,};let l,a;if((d.onRequest(u,h),s))l=$task.fetch({method:u,...h});else if(o||i||r)l=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i,})})});else if(n){const e=new Request(h.url);(e.method=u),(e.headers=h.headers),(e.body=h.body),(l=new Promise((t,s)=>{e.loadString().then((s)=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s,})}).catch((e)=>s(e))}))}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(d.onTimeout(),t(`${u}URL:${h.url}exceeds the timeout ${c}ms`)),c)}):null;return(f?Promise.race([f,l]).then((e)=>(clearTimeout(a),e)):l).then((e)=>d.onResponse(e))})(h,u))),u)}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r}=ENV();return new(class{constructor(e,t){(this.name=e),(this.debug=t),(this.http=HTTP()),(this.env=ENV()),(this.node=(()=>{if(n){return{fs:require("fs")}}return null})()),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if((s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n)){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.root={}),(e=`${this.name}.json`),this.node.fs.existsSync(e)?(this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.cache={}))}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},(e)=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},(e)=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?((t=t.substr(1)),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):(this.cache[t]=e),this.persistCache()}read(e){return(this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:((e=e.substr(1)),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0))}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?((e=e.substr(1)),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],d=h["media-url"],l=u+(c?`\n点击跳转:${c}`:"")+(d?`\n多媒体:${d}`:"");if((s&&$notify(e,t,u,h),i&&$notification.post(e,t,l),o&&$notification.post(e,t,u,c),n))if(r){require("../maoyan.scriptable/node_modules/push").schedule({title:e,body:(t?t+"\n":"")+l})}else console.log(`${e}\n${t}\n${l}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise((t)=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&(($context.headers=e.headers),($context.statusCode=e.statusCode),($context.body=e.body))}})(e,t)}
/*****************************************************************************/
