const superagent = require('superagent');
const cheerio = require('cheerio');
var fs = require('fs');
var readlineSync = require('readline-sync');

let req = superagent;
const reptileUrl = "http://192.168.0.200:83/login.aspx";
let cookie;

function readSyn() {
    process.stdin.pause();
    var response = fs.readSync(process.stdin.fd, 1000, 0, "utf8");
    process.stdin.resume();
    return response[0].trim();
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
    console.log(cookie)
    console.log($)
    console.log(2)
    var stream = fs.createWriteStream('v.png');
    superagent
        .get('http://192.168.0.200:83/CreateCode.ashx')
        .set('Cookie', cookie)
        .pipe(stream);
    var very;
    stream.on('close', function () {
        very = readlineSync.question('VVVVVV:');
        var t = {TextBoxUserID: "a", TextBoxPWD: "b", TextBoxCode: "sdf"};
        t.TextBoxCode = very;
        req
            .post(reptileUrl)
            .type('form')
            .send(t)
            .end(function (err, res) {
                console.log(err)
                console.log(3);
                console.log(res.text)
            })
        ;

    })
});
