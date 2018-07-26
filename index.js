const superagent = require('superagent');
const cheerio = require('cheerio');
var fs = require('fs');
var readlineSync = require('readline-sync');
const querystring = require('querystring');

let req = superagent;
const mainUrl = "http://192.168.0.200:83/";
const reptileUrl = mainUrl+"login.aspx";
const accountUrl = mainUrl+"AccountsInfo.aspx";
let cookie;
let areq =fs.readFileSync("areq.txt","utf-8"); 
// areq = querystring.parse(areq);

let CHList = [
    'H5Ceshi',
]

function getLocalCookie() {
    return fs.readFileSync("cookie","utf-8"); 
}

function readSyn() {
    process.stdin.pause();
    var response = fs.readSync(process.stdin.fd, 1000, 0, "utf8");
    process.stdin.resume();
    return response[0].trim();
}

function getCookie(ck,ch){
        let cookies = [];
        ck.concat(cookie).map(x=>cookies=cookies.concat(x.split(';')));
        let cck;
        cck = cookies.filter(x=>/^[aA]/.test(x)).join(';');
        return cck.replace('Fengce',ch);
}


superagent.get(reptileUrl).end(function (err, res) {
    // 抛错拦截
    if (err) {
        console.log(err)
        return
    }
    // 等待 code
    let $ = cheerio.load(res.text);
    cookie = res.headers['set-cookie'];
    var stream = fs.createWriteStream('v.png');
    superagent
        .get(mainUrl+'CreateCode.ashx')
        .set('Cookie', cookie)
        .pipe(stream);
    var very;
    new Promise((r,j)=>{
        stream.on('close', function () {
            very = readlineSync.question('verify code:');
            var t = {
                __EVENTTARGET: 'LinkButton1',
                __EVENTARGUMENT: '',
                __VIEWSTATE: '/wEPDwUKMjAzOTc0Njc1NGRkCCzhX9NDHzGiJL5B5tIrPYxweGdJW/gKniscrTCqZ84=',
                __VIEWSTATEGENERATOR: 'C2EE9ABB',
                __EVENTVALIDATION: '/wEdAAWgnrcoYqSJZPqK/2dwoB9qxudO8h63U/6VTHA0s2IM4RL3vUcjIY2FMl5djdQwBYJgZfvHWaIZcEZ3ptr6aO/EtTfNpOz0CH4vKngBfzxDIY8aFvCtKXwsj49XzndCF9jmboF9zUa/gBlXA/yAW7pc',
                TextBoxUserID: "admin",
                TextBoxPWD: "admin",
                TextBoxCode: "sdf"
            };
            t.TextBoxCode = very;
            req
                .post(reptileUrl)
                .type('form')
                .set('Cookie', cookie)
                .send(t)
                .redirects(0)
                .end(function (err, res) {
                    let ck = res.headers['set-cookie'];
                    r(ck);
                })
        })
    }).then((ck)=>{
        var t = querystring.parse(areq);
        t.TextBoxKeyWords= process.argv[2];
        let cck = getCookie(ck,'H5Ceshi');
        req.post(accountUrl)
            .set('Cookie', cck)
            // .send(querystring.stringify(t))
            .send(querystring.stringify(t))
            .end((err,res)=>{
            let $ = cheerio.load(res.text, {decodeEntities: false});
                // console.log($('#div1').html());
                console.log($('td',$('tr','#div1').eq(8)).eq(1).html());
            })
    })
});
