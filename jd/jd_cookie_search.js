/*

Author: 2Ya
Github: https://github.com/domping
ScriptName:京东 ck 多账号备注 + 搜索
==================================
给京东账号添加一个备注吧 O(∩_∩)O哈哈~ （适合账号多账号昵称混乱的用户）
==================================
使用方法：
1.添加 boxjs 订阅：https://raw.githubusercontent.com/dompling/Script/master/dompling.boxjs.json
2.在应用中找到 dompling -> 京东账号 ck 检索
3.点击右上角运行按钮初始化京东 ck 数据
4.初始完成之后，给各个账号添加备注就能愉快的搜索你的京东 ck 了。
5.搜索方式：设置关键字 下标（数组下标从 0 开始）、username（京东 ck 的 pin）、nickname（给京东账号设置的备注昵称）, status（正常|未登录）
搜索示例：0,2Y,正常
返回结果：返回下标为 0 的，返回 2Y (username|nickname),返回正常状态的

*/

const $ = new API('jd_ck_remark');
$.msg = '';
const APIKey = 'CookiesJD';
const CacheKey = `#${APIKey}`;
const remark_key = `remark`;
const searchKey = 'keyword';
const keyword = ($.read(searchKey) || '').split(',');
const cookiesRemark = JSON.parse($.read(remark_key) || '[]');
const CookiesJD = JSON.parse($.read(CacheKey) || '[]');
const CookieJD = $.read('#CookieJD');
const CookieJD2 = $.read('#CookieJD2');
const ckData = CookiesJD.map(item => item.cookie);
if (CookieJD) ckData.unshift(CookieJD);
if (CookieJD2) ckData.unshift(CookieJD2);

console.log('初始化备注开始');
console.log(`=========== 检测到京东账号：【${ckData.length}】个 ===========`);

const ckRemarkFormat = {};
cookiesRemark.forEach(item => {
  ckRemarkFormat[item.username] = item;
});

(async () => {
  const ckFormat = [];
  const notLogin = [];
  let ckIndex = 0;
  for (const cookie of ckData) {
    let username = cookie.match(/pt_pin=(.+?);/)[1];
    username = decodeURIComponent(username);
    console.log('===================================');
    console.log(`检查开始：账号 ${username} 【登陆状态】`);
    const response = await isLogin(cookie);
    const status = response.resultCode === 0 ? '正常' : '未登录';

    console.log(`检查结束：账号【${ckIndex}】 ${username}【${status}】`);
    console.log('===================================');

    const item = {
      index: ckIndex,
      username,
      nickname: '',
      mobile: '',
      ...ckRemarkFormat[username],
      status,
    };
    if (status === '未登录') notLogin.push(item);
    ckFormat.push(item);
    ckIndex++;
  }
  $.msg = '初始化备注结束，boxjs 中修改备注';
  console.log($.msg);
  if (notLogin.length) {
    console.log(`----------------未登录账号【${notLogin.length}】----------------`);
    console.log(JSON.stringify(notLogin, null, `\t`));
    $.msg = `未登录账号：\n ${notLogin.map(
      item => `账号【${item.index}】:${item.nickname || item.username}`).join(
      '\n')}`;
  }
  $.write(JSON.stringify(ckFormat, null, `\t`), remark_key);
  console.log(`检测到${keyword.length - 1}个搜索条件：${keyword.join(',')}`);

  if (keyword && keyword[0]) {
    console.log('开始搜索中');
    const searchValue = ckFormat.filter(
      (item, index) => {
        return (
          keyword.indexOf(`${index}`) > -1 ||
          keyword.indexOf(item.username) > -1 ||
          keyword.indexOf(item.nickname) > -1 ||
          keyword.indexOf(item.status) > -1
        );
      });
    if (searchValue.length) {
      $.msg = `已找到搜索结果：\n`;
      searchValue.forEach(item => {
        $.msg += `${item.nickname ||
        item.username}:${item.mobile} 【${item.status}】\n`;
      });
    } else {
      $.msg = '未找到相关 ck';
    }
    console.log($.msg);
    $.notify('京东 CK 查询', `关键字：${keyword}`, $.msg);
  } else {
    $.notify('京东 CK 备注', ``, $.msg);
  }
})().catch(e => {
  console.log(e);
}).finally(() => {
  $.done();
});

async function isLogin(Cookie) {
  const opt = {
    url: 'https://ms.jr.jd.com/gw/generic/uc/h5/m/mySubsidyBalance',
    headers: {
      cookie: Cookie,
      Referer: 'https://home.m.jd.com/myJd/newhome.action?sceneval=2&ufc=&',
    },
  };
  return $.http.post(opt).then((response) => (JSON.parse(response.body)));
}

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
