/**
 * 任务名称
 * name: 咔叽网单签到
 * 定时规则
 * cron: 1 0 * * *
 */
const axios = require("axios");
const title = '咔叽网单';
let cookie = '';
let allMessage = '';

!(async () => {
    let envs = await QLAPI.getEnvs({ searchValue: 'w2nzz_cookie' });
    if (envs.data.length === 0) {
        console.log('【提示】请先设置环境变量 w2nzz_cookie');
        return;
    }
    for (let i = 0; i < envs.data.length; i++) {
        if (envs.data[i].value) {
            cookie = envs.data[i].value;
            await main(i + 1);
        }
    }
    if (allMessage != '') {
        await QLAPI.systemNotify({ title, content: allMessage })
    }
})().catch((e) => {
    console.log(`❌ ${title}, 失败! 原因: ${e}!`)
});

async function main(index) {
    allMessage += `\n【账号${index}】`;
    let formhash = await getFormhash();
    if (formhash === null) {
        allMessage += "cookie失效";
        return;
    }
    let data = await checkin(formhash[1]);
    allMessage += data;
}

function getFormhash() {
    return new Promise(async (resolve) => {
        try {
            let url = "http://www.2nzz.com/index.php";
            const header = {
                headers: {
                    cookie,
                    "Origin": "http://www.2nzz.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "Referer": "http://www.2nzz.com/index.php",
                    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
                },
            };
            let res = await axios.get(url, header);
            if (res.data) {
                data = res.data.match(/<input type="hidden" name="formhash" value="(.*?)"/);
            } else {
                console.log("没有返回数据")
            }
        } catch (err) {
            console.log(err);
            data = "签到接口请求出错"
        }
        resolve(data);
    });
}

function checkin(formhash) {
    const form = { "formhash": formhash, "qdxq": "kx", "qdmode": "2", "todaysay": "", "fastreply": "0" };
    return new Promise(async (resolve) => {
        try {
            let url = "http://www.2nzz.com/plugin.php?id=dsu_paulsign:sign&operation=qiandao&infloat=1&sign_as=1&inajax=1";
            const header = {
                headers: {
                    cookie,
                    "Origin": "http://www.2nzz.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Referer": "https://www.2nzz.com/forum.php",
                    "Accept-Language": "zh-CN,zh;q=0.9",
                    "content-type": "application/x-www-form-urlencoded"
                }
            };
            let res = await axios.post(url, form, header);
            if (res.data.indexOf("您今日已经签到，请明天再来") > -1) {
                data = "您今日已经签到，请明天再来"
            } else {
                var patt = /<div class="c">\s(.*?)<\/div>/;
                data = res.data.match(patt);
                if (data === null) {
                    data = "签到失败";
                } else {
                    data = data[1];
                }
            }
            console.log(data);
        } catch (err) {
            console.log(err);
            data = "签到接口请求出错"
        }
        resolve(data);
    });
}