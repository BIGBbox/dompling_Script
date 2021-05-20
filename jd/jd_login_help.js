/*

Author: 2Ya
Github: https://github.com/domping
ScriptName: 京东账号登陆辅助
==================================
该脚本需要搭配 【京东账号 CK 检索】 使用
==================================

[MITM]
hostname = me-api.jd.com

【Surge脚本配置】:
===================
[Script]
京东登陆辅助 = type=http-response,pattern=^https:\/\/jcap\.m\.jd\.com\/home\/requireCaptcha\.js,requires-body=1,max-size=0,timeout=1000,script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/jd_login_help.js,script-update-interval=0
===================
【Loon脚本配置】:
===================
[Script]
http-response ^https:\/\/jcap\.m\.jd\.com\/home\/requireCaptcha\.js tag=京东登陆辅助, script-path=https://raw.githubusercontent.com/dompling/Script/master/jd/jd_login_help.js,requires-body=1

===================
【 QX  脚本配置 】 :
===================

[rewrite_local]
^https:\/\/jcap\.m\.jd\.com\/home\/requireCaptcha\.js  url script-response-body https://raw.githubusercontent.com/dompling/Script/master/jd/jd_login_help.js

 */

const $ = new API('jd_ck_remark');

const remark_key = `remark`;
const searchKey = 'keyword';
console.log('========监听到链接========');
try {
  console.log('========重写开始========');
  let cookiesRemark = JSON.parse($.read(remark_key) || '[]');
  const keyword = ($.read(searchKey) || '').split(',');
  cookiesRemark = cookiesRemark.filter((item, index) => {
    return keyword[0] ? ((keyword.indexOf(`${index}`) > -1 ||
      keyword.indexOf(item.username) > -1 ||
      keyword.indexOf(item.nickname) > -1 ||
      keyword.indexOf(item.status) > -1)) : !!item.mobile;
  });
  console.log(JSON.stringify(cookiesRemark, null, `\t`));
  const options = cookiesRemark.map(
    item => ('<option value="' + item.mobile +
      '">' + item.username + '【' + item.nickname + '】' + '：' + item.mobile +
      '</option>')).
    join('');
  const maskView = `
<div id="cus-mask"  style="display: none;position: fixed;top: 0;left: 0;width: 100%;height: 100%;z-index: 9999;background: rgba(0,0,0,.6);">
  <div style="width: 85%;background: #fff;border-radius: .1rem;position: relative;top: 50%;left: 50%;color: #2e2d2d;transform: translate(-50%,-50%);-ms-transform: translate(-50%,-50%);-moz-transform: translate(-50%,-50%);-webkit-transform: translate(-50%,-50%);-o-transform: translate(-50%,-50%);">
    <div style="font-size: .16rem;font-family: PingFangSC-Semibold;text-align: center;padding: .18rem 0 .13rem;">
        BoxJS 京东 ck 列表
    </div>
    <div style="font-family: PingFangSC-Regular;font-size: .14rem;line-height: .22rem;padding: 0 .25rem;height: 1.98rem;overflow-x: hidden;overflow-y: scroll;">
       <label style="color: rgba(0,0,0,.4);font-size: .16rem;margin-bottom: .2rem;display: block">ck 选择列表：</label>
        <select id="jd_account" style="width: 100%;height: .4rem;text-align: center">
            <option value="">------请选择------</option>
            ${options}
        </select>
        <ul style="padding-left: .2rem;color: rgba(0,0,0,.4);margin-top: 0.1rem">
            <li>该脚本配合【<a href="http://boxjs.net/#/app/JD_Cookies_remark" style="color: red">京东账号 CK 检索</a>】使用</li>
            <li>请自行在 boxjs 中配置好相关信息</li>
            <li>列表数据是根据检索关键字的结果进行返回若为空，返回有号码的信息</li>
        </ul>
    </div>
    <div style="margin-top: .09rem;
    border-radius: .1rem;
    -webkit-box-shadow: 0 -0.025rem 0.05rem 0 rgb(0 0 0);
box-shadow: 0 -0.025rem 0.05rem 0 rgb(0 0 0);">
        <div class="btn-wrap" style="display: flex">
          <a href="javascript:void(0);" style="display: inline-block;
    font-family: PingFangSC-Regular;
    font-size: .15rem;
    color: #2e2d2d;
    text-align: center;
    height: .45rem;
    line-height: .45rem;
    width: 50%;
    border-top: 1px solid #eaeaea;" id="cus-mask-cancel" onclick="maskVisible(false)">取消</a>

          <a href="javascript:void(0);"  style="display: inline-block;
    font-family: PingFangSC-Regular;
    font-size: .15rem;
    text-align: center;
    height: .45rem;
    line-height: .45rem;
    width: 50%;
    border-top: 1px solid #eaeaea;
    color: #fff;
    background-image: -webkit-gradient(linear,left top,right top,from(#f10000),color-stop(73%,#ff2000),to(#ff4f18));
    background-image: -webkit-linear-gradient(left,#f10000,#ff2000 73%,#ff4f18);
    background-image: -o-linear-gradient(left,#f10000,#ff2000 73%,#ff4f18);
    background-image: linear-gradient(
90deg
,#f10000,#ff2000 73%,#ff4f18);
    border-radius: 0 0 .1rem 0;
    " id="cus-mask-ok" onclick="submit()">确定</a>
        </div>
    </div>
  </div>
</div>
`;
  const boxBtn = `
<div style="margin:0 .15rem;display: inline-block;width: .48rem;">
<img style="margin-bottom: .02rem;border-radius: 50%;width: .48rem;height: .48rem;-webkit-box-shadow: 0 -0.025rem 0.05rem 0 rgb(0 0 0 / 10%);
box-shadow: 0 -0.025rem 0.05rem 0 rgb(0 0 0);" src="https://gblobscdn.gitbook.com/spaces%2F-MDxD9HYU2CoF7Jg2BEp%2Favatar-1597212951484.png"/>
<p style="color: rgba(0,0,0,.4);">BoxJS</p>
</div>
`;

  const js = `
const maskView = document.createElement("div");
maskView.innerHTML=\`${maskView}\`;
document.getElementsByTagName("body")[0].append(maskView);
const boxlogin = document.createElement("a");
boxlogin.style.display = "inline-block";
boxlogin.innerHTML = \`${boxBtn}\`;
boxlogin.onclick = function(){
  maskVisible(true);
};

document.getElementsByClassName('quick-type')[0].append(boxlogin);

function maskVisible(visible){
 const cusmsk = document.getElementById("cus-mask");
 cusmsk.style.display = visible? "block" : "none";
}

function submit(){
  const cuMobile = document.getElementById('jd_account').value;
  console.log('选中电话号码：'+ cuMobile);
  const input = document.getElementsByClassName('acc-input mobile J_ping')[0];
  input.value = cuMobile;
  ev = document.createEvent("HTMLEvents");
  ev.initEvent("input", true,false );
  input.dispatchEvent(ev);
  maskVisible(false);
}

`;
  console.log('========追加元素========');
  console.log($response.body);
  $response.body = $response.body + `\n${js}`;
} catch (e) {
  console.log(e);
}
$.done($response);

function ENV() {
  const isQX = typeof $task !== 'undefined';
  const isLoon = typeof $loon !== 'undefined';
  const isSurge = typeof $httpClient !== 'undefined' && !isLoon;
  const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined';
  const isNode = typeof require == 'function' && !isJSBox;
  const isRequest = typeof $request !== 'undefined';
  const isScriptable = typeof importModule !== 'undefined';
  return {
    isQX,
    isLoon,
    isSurge,
    isNode,
    isJSBox,
    isRequest,
    isScriptable,
  };
}

function HTTP(defaultOptions = {
  baseURL: '',
}) {
  const {
    isQX,
    isLoon,
    isSurge,
    isScriptable,
    isNode,
  } = ENV();
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
  const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  function send(method, options) {
    options = typeof options === 'string' ? {
      url: options,
    } : options;
    const baseURL = defaultOptions.baseURL;
    if (baseURL && !URL_REGEX.test(options.url || '')) {
      options.url = baseURL ? baseURL + options.url : options.url;
    }
    if (options.body && options.headers && !options.headers['Content-Type']) {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    options = {
      ...defaultOptions,
      ...options,
    };
    const timeout = options.timeout;
    const events = {
      ...{
        onRequest: () => {},
        onResponse: (resp) => resp,
        onTimeout: () => {},
      },
      ...options.events,
    };

    events.onRequest(method, options);

    let worker;
    if (isQX) {
      worker = $task.fetch({
        method,
        ...options,
      });
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require('request') : $httpClient;
        request[method.toLowerCase()](options, (err, response, body) => {
          if (err) reject(err);
          else
            resolve({
              statusCode: response.status || response.statusCode,
              headers: response.headers,
              body,
            });
        });
      });
    } else if (isScriptable) {
      const request = new Request(options.url);
      request.method = method;
      request.headers = options.headers;
      request.body = options.body;
      worker = new Promise((resolve, reject) => {
        request.loadString().then((body) => {
          resolve({
            statusCode: request.response.statusCode,
            headers: request.response.headers,
            body,
          });
        }).catch((err) => reject(err));
      });
    }

    let timeoutid;
    const timer = timeout ?
      new Promise((_, reject) => {
        timeoutid = setTimeout(() => {
          events.onTimeout();
          return reject(
            `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`,
          );
        }, timeout);
      }) :
      null;

    return (timer ?
        Promise.race([timer, worker]).then((res) => {
          clearTimeout(timeoutid);
          return res;
        }) :
        worker
    ).then((resp) => events.onResponse(resp));
  }

  const http = {};
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options)),
  );
  return http;
}

function API(name = 'untitled', debug = false) {
  const {
    isQX,
    isLoon,
    isSurge,
    isNode,
    isJSBox,
    isScriptable,
  } = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require('fs');

          return {
            fs,
          };
        } else {
          return null;
        }
      })();
      this.initCache();

      const delay = (t, v) =>
        new Promise(function(resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function(t) {
        return this.then(function(v) {
          return delay(t, v);
        });
      };
    }

    // persistence
    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}');
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || '{}');

      if (isNode) {
        // create a json for root cache
        let fpath = 'root.json';
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}), {
              flag: 'wx',
            },
            (err) => console.log(err),
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}), {
              flag: 'wx',
            },
            (err) => console.log(err),
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`),
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache, null, 2);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data, {
            flag: 'w',
          },
          (err) => console.log(err),
        );
        this.node.fs.writeFileSync(
          'root.json',
          JSON.stringify(this.root, null, 2), {
            flag: 'w',
          },
          (err) => console.log(err),
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(data, key);
        }
        if (isQX) {
          return $prefs.setValueForKey(data, key);
        }
        if (isNode) {
          this.root[key] = data;
        }
      } else {
        this.cache[key] = data;
      }
      this.persistCache();
    }

    read(key) {
      this.log(`READ ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.read(key);
        }
        if (isQX) {
          return $prefs.valueForKey(key);
        }
        if (isNode) {
          return this.root[key];
        }
      } else {
        return this.cache[key];
      }
    }

    delete(key) {
      this.log(`DELETE ${key}`);
      if (key.indexOf('#') !== -1) {
        key = key.substr(1);
        if (isSurge || isLoon) {
          return $persistentStore.write(null, key);
        }
        if (isQX) {
          return $prefs.removeValueForKey(key);
        }
        if (isNode) {
          delete this.root[key];
        }
      } else {
        delete this.cache[key];
      }
      this.persistCache();
    }

    // notification
    notify(title, subtitle = '', content = '', options = {}) {
      const openURL = options['open-url'];
      const mediaURL = options['media-url'];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? '\n多媒体:' + mediaURL : ''}`, {
            url: openURL,
          },
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts['openUrl'] = openURL;
        if (mediaURL) opts['mediaUrl'] = mediaURL;
        if (JSON.stringify(opts) === '{}') {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : '') +
          (mediaURL ? `\n多媒体: ${mediaURL}` : '');
        if (isJSBox) {
          const push = require('push');
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + '\n' : '') + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(`[${this.name}] LOG: ${this.stringify(msg)}`);
    }

    info(msg) {
      console.log(`[${this.name}] INFO: ${this.stringify(msg)}`);
    }

    error(msg) {
      console.log(`[${this.name}] ERROR: ${this.stringify(msg)}`);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== 'undefined') {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }

    stringify(obj_or_str) {
      if (typeof obj_or_str === 'string' || obj_or_str instanceof String)
        return obj_or_str;
      else
        try {
          return JSON.stringify(obj_or_str, null, 2);
        } catch (err) {
          return '[object Object]';
        }
    }
  })(name, debug);
}
