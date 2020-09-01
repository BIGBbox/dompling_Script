

/**
 *  名称：每日健康打卡
 *  小程序：国家政务服务
 *  hostname = zwms.gjzwfw.gov.cn
 *  [Rewrite]
 *  ^https:\/\/zwms\.gjzwfw\.gov\.cn\/tif\/sys\/session url script-request-header gov.cookie.js
 *  [task]
 *  1 0 * * *  gov.js
 */
const $ = new API("gov", true);

const rNum = randomString(20);
const did = $.read("did");
const sid = $.read("sid");
const city = $.read("city"); 
const baseUrl = "https://zwms.gjzwfw.gov.cn/";

const body = {
  phone: "18408226080",
  city: "四川省成都市青羊区",
  xzqhdm: "510105",
  isContactPatient: "2",
  symptom: "1",
  temperature: "36.1",
};

const headers = {
  "content-type": `application/json`,
  "x-tif-did": did,
  "x-tif-sid": sid,
  "x-yss-city-code": city
};

!(async () => {
  if (!did || !sid) throw new Error("请获取登陆信息或者登陆Cookie"); 
  await verfiysign();
  const signRes = await sign();
  if(signRes.errcode===0){
    $.notify("每日健康打卡", "", signRes.data.result);
    $.done();
  }else{
    throw new Error("打卡失败：" + signRes.errmsg);
  }
})()
  .catch((e) => {
    $.notify("每日健康打卡", "", "❎原因：" + e.message);
  })
  .finally(() => {
    $.done();
  });


function randomString(e) {
  for (
    var n = e || 16,
      t = "ABCDEFGHIJKLMNOPQRSTUWXYZabcdefghijklmnopqrstuwxyz0123456789",
      o = t.length,
      i = "",
      s = 0;
    s < n;
    s++
  )
    i += t.charAt(Math.floor(Math.random() * o));
  return i;
}

function verfiysign() {
  const url = `${baseUrl}ebus/gss/api/r/health_service/AllHealthQuery?rNum=${rNum}`;
  const body = {};
  const params = {
    url: url,
    headers: headers,
    body: JSON.stringify(body),
  };
  return $.http.post(params).then(({ body }) => {
    const response = JSON.parse(body);
    console.log(response);
    if (response.errcode === 1002) {
      throw new Error(response.errmsg + " 失败，未授权");
    }
    if (response.data.hasReport) {
      throw new Error("已打卡");
    }
    return response;
  });
}


function sign() {
  const url = `${baseUrl}ebus/gss/api/r/health_service/HealthApply?rNum=${rNum}`;
  const params = {
    url: url,
    headers: headers,
    body: JSON.stringify(body),
  };
  return $.http.post(params).then(({ body }) => {
    const response = JSON.parse(body);
    return response;
  });
}

// prettier-ignore
/*********************************** API *************************************/
function ENV(){const e="undefined"!=typeof $task,t="undefined"!=typeof $loon,s="undefined"!=typeof $httpClient&&!this.isLoon,o="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:e,isLoon:t,isSurge:s,isNode:"function"==typeof require&&!o,isJSBox:o,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}
function HTTP(e,t={}){const{isQX:s,isLoon:o,isSurge:i,isScriptable:n,isNode:r}=ENV();const u={};return(["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach((h)=>(u[h.toLowerCase()]=(u)=>(function(u,h){(h="string"==typeof h?{url:h}:h).url=e?e+h.url:h.url;const c=(h={...t,...h}).timeout,d={onRequest:()=>{},onResponse:(e)=>e,onTimeout:()=>{},...h.events,};let l,a;if((d.onRequest(u,h),s))l=$task.fetch({method:u,...h});else if(o||i||r)l=new Promise((e,t)=>{(r?require("request"):$httpClient)[u.toLowerCase()](h,(s,o,i)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:i,})})});else if(n){const e=new Request(h.url);(e.method=u),(e.headers=h.headers),(e.body=h.body),(l=new Promise((t,s)=>{e.loadString().then((s)=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s,})}).catch((e)=>s(e))}))}const f=c?new Promise((e,t)=>{a=setTimeout(()=>(d.onTimeout(),t(`${u}URL:${h.url}exceeds the timeout ${c}ms`)),c)}):null;return(f?Promise.race([f,l]).then((e)=>(clearTimeout(a),e)):l).then((e)=>d.onResponse(e))})(h,u))),u)}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:i,isNode:n,isJSBox:r}=ENV();return new(class{constructor(e,t){(this.name=e),(this.debug=t),(this.http=HTTP()),(this.env=ENV()),(this.node=(()=>{if(n){return{fs:require("fs")}}return null})()),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if((s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||i)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),n)){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.root={}),(e=`${this.name}.json`),this.node.fs.existsSync(e)?(this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`))):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},(e)=>console.log(e)),(this.cache={}))}}persistCache(){const e=JSON.stringify(this.cache);s&&$prefs.setValueForKey(e,this.name),(o||i)&&$persistentStore.write(e,this.name),n&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},(e)=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root),{flag:"w"},(e)=>console.log(e)))}write(e,t){this.log(`SET ${t}`),-1!==t.indexOf("#")?((t=t.substr(1)),i&o&&$persistentStore.write(e,t),s&&$prefs.setValueForKey(e,t),n&&(this.root[t]=e)):(this.cache[t]=e),this.persistCache()}read(e){return(this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:((e=e.substr(1)),i&o?$persistentStore.read(e):s?$prefs.valueForKey(e):n?this.root[e]:void 0))}delete(e){this.log(`DELETE ${e}`),-1!==e.indexOf("#")?((e=e.substr(1)),i&o&&$persistentStore.write(null,e),s&&$prefs.removeValueForKey(e),n&&delete this.root[e]):delete this.cache[e],this.persistCache()}notify(e,t="",u="",h={}){const c=h["open-url"],d=h["media-url"],l=u+(c?`\n点击跳转:${c}`:"")+(d?`\n多媒体:${d}`:"");if((s&&$notify(e,t,u,h),i&&$notification.post(e,t,l),o&&$notification.post(e,t,u,c),n))if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+l})}else console.log(`${e}\n${t}\n${l}\n\n`)}log(e){this.debug&&console.log(e)}info(e){console.log(e)}error(e){console.log("ERROR: "+e)}wait(e){return new Promise((t)=>setTimeout(t,e))}done(e={}){s||o||i?$done(e):n&&!r&&"undefined"!=typeof $context&&(($context.headers=e.headers),($context.statusCode=e.statusCode),($context.body=e.body))}})(e,t)}
/*****************************************************************************/
