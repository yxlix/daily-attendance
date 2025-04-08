/**
 * 任务名称
 * name: 菜鸟图库签到
 * 定时规则
 * cron: 0 0 * * *
 */
const axios = require("axios");
const title = '菜鸟图库';
let cookie = '';
let allMessage = '';

!(async () => {
    let envs = await QLAPI.getEnvs({ searchValue: 'sucai999_cookie' });
    if (envs.data.length === 0) {
        console.log('【提示】请先设置环境变量 sucai999_cookie');
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
    allMessage += `\n【账号${index}： 】`;
    let data = await checkin();
    allMessage += data;
}

function checkin() {
    return new Promise(async (resolve) => {
        try {
            let url = "http://www.sucai999.com/default/qiandao/qd";
            const header = {
                headers: {
                    Referer: "http://www.sucai999.com",
                    cookie,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
                },
            };
            let res = await axios.get(url, header);
            if (res.data.status == 1) {
                data = `签到成功! ${res.data.content} ${res.data.yiqiandao}`;
            } else {
                data = res.data.msg;
            }
            console.log(data);
        } catch (err) {
            console.log(err);
            data = "签到接口请求出错"
        }
        resolve( data);
    });
}