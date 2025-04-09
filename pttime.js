/**
 * 任务名称
 * name: pttime签到
 * 定时规则
 * cron: 2 0 * * *
 */
const axios = require("axios");
const title = 'pttime';
let cookie = '';
let allMessage = '';

!(async () => {
    let envs = await QLAPI.getEnvs({ searchValue: 'pttime_cookie' });
    if (envs.data.length === 0) {
        console.log('【提示】请先设置环境变量 pttime_cookie');
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
    let uid = await getUid();
    if (uid === null) {
        allMessage += "cookie失效";
        return;
    }
    console.log(uid[1]);
    let data = await checkin(uid[1]);
    allMessage += data;
}

function getUid() {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.pttime.org";
            const option = {
                headers: {
                    cookie,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 Edg/88.0.705.74"
                },
            };
            let res = await axios.get(url, option);
            if (res.data) {
                data = res.data.match(/<a href="userdetails.php\?id=(\d+)"/);
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
function checkin(uid) {
    return new Promise(async (resolve) => {
        try {
            let url = "https://www.pttime.org/attendance.php?type=sign&uid=" + uid;
            const option = {
                headers: {
                    cookie,
                    "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36 Edg/135.0.0.0'
                }
            };
            let res = await axios.get(url, option);
            let data = res.data.replace(/[\r\n]/g, '')
            if (data.indexOf('class="embedded"') > 0) {
                let regex = /使用\&说明<\/a>\]\:(.*?)\[/;
                let match = data.match(regex);
                if (match && match[1]) {
                    moli = match[1]
                }
                //去掉<a>标签,只保留浮点数
                moli = moli.replace(/<a.*?>(.*?)<\/a>/g, '')
                //查询第一次"时间"出现的位置,并截取后面19个字符
                //第一次签到时间
                let firstSignIndex = data.indexOf('第一次签到：')
                let firstSignTime = data.substring(firstSignIndex + 6, firstSignIndex + 25)
                if (firstSignTime) {
                } else {
                    firstSignTime = '0000-00-00 00:00:00'
                }
                let timeIndex = data.indexOf('时间：')
                let time = data.substring(timeIndex + 3, timeIndex + 22)
                if (time) {
                } else {
                    time = '0000-00-00 00:00:00'
                }
                // 查询获得魔力值：出现的位置, 并截取后面<b>标签内的内容
                const todayMoliString = data.substring(data.indexOf('获得魔力值：') + 6, data.indexOf('获得魔力值：') + 20);
                let todayMoli = todayMoliString.substring(todayMoliString.indexOf('<b>') + 3, todayMoliString.indexOf('</b>'));
                if (todayMoli) {
                } else {
                    todayMoli = '000'
                }
                // 查询连续天数：出现的位置
                const dayString = data.substring(data.indexOf('连续天数：') + 5, data.indexOf('连续天数：') + 20);
                //获取连续天数
                let day = dayString.substring(dayString.indexOf('<b>') + 3, dayString.indexOf('</b>'));
                if (day) {
                } else {
                    day = '000'
                }
                //总签等级 查询总签到等级：出现的位置, 并截取后面title="的值
                const totalSignLevelString = data.substring(data.indexOf('总签到等级：') + 6, data.indexOf('总签到等级：') + 31);
                let totalSignLevel = totalSignLevelString.substring(totalSignLevelString.indexOf('title=\'') + 7, totalSignLevelString.indexOf('\'>'));
                let totalSignLevelLogo = totalSignLevelString.substring(totalSignLevelString.indexOf('\'>') + 2, totalSignLevelString.indexOf('</b>'));
                if (totalSignLevel) {
                } else {
                    totalSignLevel = '无'
                }
                if (totalSignLevelLogo) {

                } else {
                    totalSignLevelLogo = ''
                }
                //连签等级
                const cSignLevelString = data.substring(data.indexOf('连续等级：') + 5, data.indexOf('连续等级：') + 40);
                let cSignLevel = cSignLevelString.substring(cSignLevelString.indexOf('title=\'') + 7, cSignLevelString.indexOf('\'>'));
                let cSignLevelLogo = cSignLevelString.substring(cSignLevelString.indexOf('\'>') + 2, cSignLevelString.indexOf('</b>'));
                if (cSignLevel) {
                } else {
                    cSignLevel = '无'
                }
                if (cSignLevelLogo) {

                } else {
                    cSignLevelLogo = ''
                }
                if (data.indexOf('今日签到成功') > 0) {
                    allMessage += '\n⭐今日签到成功'
                    allMessage += `\n⭐${totalSignLevel} ${totalSignLevelLogo}`
                    allMessage += `\n⭐${cSignLevel} ${cSignLevelLogo}`
                    allMessage += `\n⭐首签：${firstSignTime}`
                    allMessage += `\n⭐今日：${time}\n⭐签到魔力值：${todayMoli}\n⭐连续签到天数：${day}天\n⭐总魔力值：${moli}`;
                } else if (data.indexOf('签到中止') > 0) {
                    allMessage += '\n⭐今日签到中止'
                } else {
                    allMessage += '\n⭐今日签到完成'
                    allMessage += `\n⭐${totalSignLevel} ${totalSignLevelLogo}`
                    allMessage += `\n⭐${cSignLevel} ${cSignLevelLogo}`
                    allMessage += `\n⭐首签：${firstSignTime}`
                    allMessage += `\n⭐今日：${time}\n⭐签到魔力值：${todayMoli}\n⭐连续签到天数：${day}天\n⭐总魔力值：${moli}`;
                }
            } else if (data.indexOf('高频刷新签到') > 0) {
                console.log('高频刷新签到！！\n');
                allMessage += '\n 高频刷新签到，小心封号!'
            } else {
                console.log('签到失败！！\n');
                allMessage += '\n 签到失败!'
            }
        } catch (err) {
            console.log(err);
            data = "签到接口请求出错"
        }
        resolve(data);
    });
}