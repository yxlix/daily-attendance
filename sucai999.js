/**
 * 任务名称
 * name: 菜鸟图库签到
 * 定时规则
 * cron: 20 0 * * *
 */
const name = '菜鸟图库';
//取cookie
let cookiesArr = [];
let cookie = '';
if (process.env.SMZDM_COOKIE) {
    if (process.env.SMZDM_COOKIE.indexOf('&') > -1) {
        cookiesArr = process.env.SMZDM_COOKIE.split('&');
    } else if (process.env.SMZDM_COOKIE.indexOf('\n') > -1) {
        cookiesArr = process.env.SMZDM_COOKIE.split('\n');
    } else {
        cookiesArr = [process.env.SMZDM_COOKIE];
    }
}
QLAPI.systemNotify(name,'123');