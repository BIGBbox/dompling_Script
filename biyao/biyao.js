/**
 图标 https://raw.githubusercontent.com/Orz-3/task/master/biyao.png
# 获取方式:进入签到页面获取

[task_local]
1 0 * * * https://raw.githubusercontent.com/dompling/Script/master/biyao/biyao.js

(1). Quantumult X
[MITM]
hostname=marketappapi.biyao.com
[rewrite_local]
^https:\/\/marketappapi\.biyao\.com\/signIn\/getGeneralPage\.do url script-request-header https://raw.githubusercontent.com/dompling/Script/master/biyao/biyao.cookie.js

(2). Loon
[MITM]
hostname=marketappapi.biyao.com
[Script]
http-request ^https:\/\/marketappapi\.biyao\.com\/signIn\/getGeneralPage\.do script-path=https://raw.githubusercontent.com/dompling/Script/master/biyao/biyao.cookie.js, require-body=false

(3). Surge
[MITM]
hostname=marketappapi.biyao.com
[Script]
type=http-request, pattern=^https:\/\/marketappapi\.biyao\.com\/signIn\/getGeneralPage\.do, script-path=https://raw.githubusercontent.com/dompling/Script/master/biyao/biyao.cookie.js, require-body=false

 */

const $ = new API("biyao");
const $cache = $.cache;
const baseURL = "https://marketappapi.biyao.com";
// const apiURl = "https://appapi.biyao.com";
const title = "🛎必要";
const options = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;text/html;charset=utf-8",
    ...$cache,
  },
};

const comonBody = {
  token: $cache.token,
  uid: $cache.uid,
};

(async () => {
  const signResult = await sign();
  const { data = {} } = signResult;
  if (!data.currentHighestInfo) throw new Error("签到失败");
  const currentHighestInfo = data.currentHighestInfo;
  $.log(data);
  console.log(currentHighestInfo);
  const content = `
  ${currentHighestInfo.canBookedCoin}
  💰总金币金币：${currentHighestInfo.currentTotalCoin}
  🎁${currentHighestInfo.coinHint}:${currentHighestInfo.coin}
  🎉预计：${currentHighestInfo.canBookedCoin}🎉[左滑打开详情]`;
  $.notify(title, "签到成功", content, {
    "open-url": currentHighestInfo.billRouterUrl,
  });
})().catch((e) => {
  $.notify(title, "失败", "❎原因：" + e.message || e);
});

function sign() {
  const body = {
    q: { notify: "1", addressBook: "1", isSignIn: "0" },
    sign: $cache.loginSign,
    ...comonBody,
  };

  return $.http
    .post({
      ...options,
      url: `${baseURL}/signIn/getGeneralPage.do`,
      body: getEncodeURI(body),
    })
    .then((response) => {
      return JSON.parse(response.body);
    });
}

function getEncodeURI(body) {
  let data = Object.keys(body).map((key) => {
    return (
      key +
      "=" +
      (typeof body[key] === "object"
        ? encodeURIComponent(JSON.stringify(body[key]))
        : body[key])
    );
  });
  return data.join("&");
}

function ENV() {
  const isQX = typeof $task !== "undefined";
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && !isLoon;
  const isJSBox = typeof require == "function" && typeof $jsbox != "undefined";
  const isNode = typeof require == "function" && !isJSBox;
  const isRequest = typeof $request !== "undefined";
  const isScriptable = typeof importModule !== "undefined";
  return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable };
}

function HTTP(baseURL, defaultOptions = {}) {
  const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV();
  const methods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH"];

  function send(method, options) {
    options = typeof options === "string" ? { url: options } : options;
    options.url = baseURL ? baseURL + options.url : options.url;
    options = { ...defaultOptions, ...options };
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
      worker = $task.fetch({ method, ...options });
    } else if (isLoon || isSurge || isNode) {
      worker = new Promise((resolve, reject) => {
        const request = isNode ? require("request") : $httpClient;
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
        request
          .loadString()
          .then((body) => {
            resolve({
              statusCode: request.response.statusCode,
              headers: request.response.headers,
              body,
            });
          })
          .catch((err) => reject(err));
      });
    }

    let timeoutid;
    const timer = timeout
      ? new Promise((_, reject) => {
          timeoutid = setTimeout(() => {
            events.onTimeout();
            return reject(
              `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
            );
          }, timeout);
        })
      : null;

    return (timer
      ? Promise.race([timer, worker]).then((res) => {
          clearTimeout(timeoutid);
          return res;
        })
      : worker
    ).then((resp) => events.onResponse(resp));
  }

  const http = {};
  methods.forEach(
    (method) =>
      (http[method.toLowerCase()] = (options) => send(method, options))
  );
  return http;
}

function API(name = "untitled", debug = false) {
  const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV();
  return new (class {
    constructor(name, debug) {
      this.name = name;
      this.debug = debug;

      this.http = HTTP();
      this.env = ENV();

      this.node = (() => {
        if (isNode) {
          const fs = require("fs");

          return {
            fs,
          };
        } else {
          return null;
        }
      })();
      this.initCache();

      const delay = (t, v) =>
        new Promise(function (resolve) {
          setTimeout(resolve.bind(null, v), t);
        });

      Promise.prototype.delay = function (t) {
        return this.then(function (v) {
          return delay(t, v);
        });
      };
    }
    // persistance

    // initialize cache
    initCache() {
      if (isQX) this.cache = JSON.parse($prefs.valueForKey(this.name) || "{}");
      if (isLoon || isSurge)
        this.cache = JSON.parse($persistentStore.read(this.name) || "{}");

      if (isNode) {
        // create a json for root cache
        let fpath = "root.json";
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
        }
        this.root = {};

        // create a json file with the given name if not exists
        fpath = `${this.name}.json`;
        if (!this.node.fs.existsSync(fpath)) {
          this.node.fs.writeFileSync(
            fpath,
            JSON.stringify({}),
            { flag: "wx" },
            (err) => console.log(err)
          );
          this.cache = {};
        } else {
          this.cache = JSON.parse(
            this.node.fs.readFileSync(`${this.name}.json`)
          );
        }
      }
    }

    // store cache
    persistCache() {
      const data = JSON.stringify(this.cache);
      if (isQX) $prefs.setValueForKey(data, this.name);
      if (isLoon || isSurge) $persistentStore.write(data, this.name);
      if (isNode) {
        this.node.fs.writeFileSync(
          `${this.name}.json`,
          data,
          { flag: "w" },
          (err) => console.log(err)
        );
        this.node.fs.writeFileSync(
          "root.json",
          JSON.stringify(this.root),
          { flag: "w" },
          (err) => console.log(err)
        );
      }
    }

    write(data, key) {
      this.log(`SET ${key}`);
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge & isLoon) {
          $persistentStore.write(data, key);
        }
        if (isQX) {
          $prefs.setValueForKey(data, key);
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
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge & isLoon) {
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
      if (key.indexOf("#") !== -1) {
        key = key.substr(1);
        if (isSurge & isLoon) {
          $persistentStore.write(null, key);
        }
        if (isQX) {
          $prefs.removeValueForKey(key);
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
    notify(title, subtitle = "", content = "", options = {}) {
      const openURL = options["open-url"];
      const mediaURL = options["media-url"];

      if (isQX) $notify(title, subtitle, content, options);
      if (isSurge) {
        $notification.post(
          title,
          subtitle,
          content + `${mediaURL ? "\n多媒体:" + mediaURL : ""}`,
          {
            url: openURL,
          }
        );
      }
      if (isLoon) {
        let opts = {};
        if (openURL) opts["openUrl"] = openURL;
        if (mediaURL) opts["mediaUrl"] = mediaURL;
        if (JSON.stringify(opts) == "{}") {
          $notification.post(title, subtitle, content);
        } else {
          $notification.post(title, subtitle, content, opts);
        }
      }
      if (isNode || isScriptable) {
        const content_ =
          content +
          (openURL ? `\n点击跳转: ${openURL}` : "") +
          (mediaURL ? `\n多媒体: ${mediaURL}` : "");
        if (isJSBox) {
          const push = require("push");
          push.schedule({
            title: title,
            body: (subtitle ? subtitle + "\n" : "") + content_,
          });
        } else {
          console.log(`${title}\n${subtitle}\n${content_}\n\n`);
        }
      }
    }

    // other helper functions
    log(msg) {
      if (this.debug) console.log(msg);
    }

    info(msg) {
      console.log(msg);
    }

    error(msg) {
      console.log("ERROR: " + msg);
    }

    wait(millisec) {
      return new Promise((resolve) => setTimeout(resolve, millisec));
    }

    done(value = {}) {
      if (isQX || isLoon || isSurge) {
        $done(value);
      } else if (isNode && !isJSBox) {
        if (typeof $context !== "undefined") {
          $context.headers = value.headers;
          $context.statusCode = value.statusCode;
          $context.body = value.body;
        }
      }
    }
  })(name, debug);
}
