const superagent = require('superagent');
const cheerio = require('cheerio');
var fs = require('fs');
var readlineSync = require('readline-sync');
const querystring = require('querystring');

let req = superagent;
const mainUrl = "http://192.168.0.200:83/";
const reptileUrl = mainUrl+"login.aspx";
const accountUrl = mainUrl+"AccountsInfo.aspx";
let cookie='';
let areq =fs.readFileSync("areq.txt","utf-8"); 

let CHList = [
    'H5Ceshi',
]


function getLocalCookie() {
    if(!cookie || cookie.length < 1){
        cookie =fs.readFileSync("cookie","utf-8").replace("\r",'').replace("\n",'');  
    }
    return cookie; 
}

function setLocalCookie(str) {
    cookie = str;
    return fs.writeFileSync("cookie",str,"utf-8"); 
}

function getCookie(ch){
    return cookie.replace('Fengce',ch);
}

function refreshCookie(cb){
    let lck ;
    superagent.get(reptileUrl).end((err, res) =>{
        // 抛错拦截
        if (err) {
            console.log(err)
            return
        }
        // 等待 code
        let $ = cheerio.load(res.text);
        lck = res.headers['set-cookie'];
        var stream = fs.createWriteStream('v.png');
        superagent
            .get(mainUrl+'CreateCode.ashx')
            .set('Cookie', lck)
            .pipe(stream);
        var very;
        stream.on('close', () =>{
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
                .set('Cookie', lck)
                .send(t)
                .redirects(0)
                .end((err, res)=> {
                    let ck = res.headers['set-cookie'];
                    let cookies = [];
                    ck.concat(lck).map(x=>cookies=cookies.concat(x.split(';')));
                    let cck;
                    cck = cookies.filter(x=>/^[aA]/.test(x)).join(';');
                    setLocalCookie(cck);
                    cb&&cb();
                })
        })
    });
}

async function initCookie(){
    getLocalCookie();
    return new Promise((r,j)=>{
        try{
            superagent
                .get(accountUrl)
                .redirects(0)
                .set('Cookie', cookie).end((err,res)=>{
                    if (!err) {
                        r();
                        return
                    }
                    refreshCookie(r);
                })
        } catch(e){
            refreshCookie(()=>{
                return r();
            });
        }
    })
}

async function getVIP(id){
    var t = querystring.parse(areq);
    t.TextBoxKeyWords= id;
    let cck = getCookie('H5Ceshi');
    return new Promise((r,j)=>{
        req.post(accountUrl)
            .set('Cookie', cck)
            .send(querystring.stringify(t))
            .end((err,res)=>{
                let $ = cheerio.load(res.text, {decodeEntities: false});
                let vip = $('td',$('tr','#div1').eq(8)).eq(1).html();
                console.log(vip);
                r(vip);
            })
    })
}

async function init(){
    await initCookie();
    await getVIP(236507);
    await getVIP(236508);
    await getVIP(236509);
    await getVIP(236510);
}

init();
