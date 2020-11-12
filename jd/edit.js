function getCache() {
  var cookies = $nobyda.read(CookieKey) || "[]";
  try {
    if (!cookies) throw "";
    return JSON.parse(cookies);
  } catch (e) {
    $nobyda.notify("脚本终止", "", "未获取到相关 Ck ‼️");
    return $nobyda.done();
  }
}

function notify(_number) {
  return new Promise((resolve) => {
    try {
      var bean = 0;
      var steel = 0;
      var cash = 0;
      var success = 0;
      var fail = 0;
      var err = 0;
      var notify = "";
      for (var i in merge) {
        bean += merge[i].bean ? Number(merge[i].bean) : 0;
        steel += merge[i].steel ? Number(merge[i].steel) : 0;
        cash += merge[i].Cash ? Number(merge[i].Cash) : 0;
        success += merge[i].success ? Number(merge[i].success) : 0;
        fail += merge[i].fail ? Number(merge[i].fail) : 0;
        err += merge[i].error ? Number(merge[i].error) : 0;
        notify += merge[i].notify ? "\n" + merge[i].notify : "";
      }
      var Cash = merge.TotalCash.TCash ? merge.TotalCash.TCash + "红包" : "";
      var Steel = merge.TotalSteel.TSteel
        ? merge.TotalSteel.TSteel + "钢镚" + (Cash ? ", " : "")
        : "";
      var beans = merge.TotalBean.Qbear
        ? merge.TotalBean.Qbear + "京豆" + (Steel || Cash ? ", " : "")
        : "";
      var bsc = beans ? "\n" : Steel ? "\n" : Cash ? "\n" : "获取失败\n";
      var Money = merge.TotalMoney.TMoney
        ? `${merge.TotalMoney.TMoney}现金`
        : "";
      var Subsidy = merge.TotalSubsidy.TSubsidy
        ? `${merge.TotalSubsidy.TSubsidy}金贴${Money ? ", " : ""}`
        : "";
      var Sbsc = Subsidy ? "\n" : Money ? "\n" : "获取失败\n";
      var Tbean = bean
        ? `${bean.toFixed(0)}京豆${steel || cash ? ", " : ""}`
        : "";
      var TSteel = steel ? `${steel.toFixed(2)}钢镚${cash ? ", " : ""}` : "";
      var TCash = cash ? `${cash.toFixed(2)}红包` : "";
      var Tbsc = Tbean ? "\n" : TSteel ? "\n" : TCash ? "\n" : "获取失败\n";
      var Ts = success
        ? "成功" + success + "个" + (fail || err ? ", " : "")
        : "";
      var Tf = fail ? "失败" + fail + "个" + (err ? ", " : "") : "";
      var Te = err
        ? "错误" + err + "个\n"
        : success
        ? "\n"
        : fail
        ? "\n"
        : "获取失败\n";
      var one = "【签到概览】:  " + Ts + Tf + Te;
      var two = "【签到总计】:  " + Tbean + TSteel + TCash + Tbsc;
      var three = "【账号总计】:  " + beans + Steel + Cash + bsc;
      var four = "【其他总计】:  " + Subsidy + Money + Sbsc;
      var disa = $nobyda.disable
        ? "\n检测到上次执行意外崩溃, 已为您自动禁用相关接口. 如需开启请前往BoxJs ‼️‼️\n"
        : "";
      var DName = merge.TotalBean.nickname
        ? merge.TotalBean.nickname
        : "获取失败";
      var Name = "【签到号" + _number + "】:  " + DName + "\n";
      console.log("\n" + Name + one + two + three + four + disa + notify);
      if ($nobyda.isJSBox) {
        if (add && DualAccount) {
          Shortcut = Name + one + two + three + "\n";
        } else if (!add && DualAccount) {
          $intents.finish(Name + one + two + three + four + notify);
        } else if (typeof Shortcut != "undefined") {
          $intents.finish(Shortcut + Name + one + two + three);
        }
      }
      if (!$nobyda.isNode) {
        $nobyda.notify("", "", Name + one + two + three + four + disa + notify);
      }
      $nobyda.time();
      $nobyda.done();
    } catch (eor) {
      $nobyda.notify(
        "通知模块 " + eor.name + "‼️",
        JSON.stringify(eor),
        eor.message
      );
    } finally {
      resolve();
    }
  });
}

async function ReadCookie() {
  var CookiesData = getCache();
  if (DeleteCookie) {
    if (CookiesData && CookiesData.length) {
      $nobyda.write("", CookieKey);
      $nobyda.notify(
        "京东Cookie清除成功 !",
        "",
        '请手动关闭脚本内"DeleteCookie"选项'
      );
      $nobyda.done();
      return;
    }
    $nobyda.notify("脚本终止", "", '未关闭脚本内"DeleteCookie"选项 ‼️');
    $nobyda.done();
    return;
  }
  out = parseInt($nobyda.read("JD_DailyBonusTimeOut")) || out;
  stop = parseInt($nobyda.read("JD_DailyBonusDelay")) || stop;
  boxdis =
    $nobyda.read("JD_Crash_disable") === "false" ||
    $nobyda.isNode ||
    $nobyda.isJSBox
      ? false
      : boxdis;
  LogDetails = $nobyda.read("JD_DailyBonusLog") === "true" || LogDetails;
  ReDis = ReDis ? $nobyda.write("", "JD_DailyBonusDisables") : "";

  for (let index = 0; index < CookiesData.length; index++) {
    const item = CookiesData[index];
    await double(item.cookie, index + 1);
  }
  $nobyda.done();
}

async function double(cookie, _number) {
  if (cookie) {
    initial();
    KEY = cookie;
    await all(_number);
  } else {
    $nobyda.time();
    $nobyda.done();
  }
}
