///////////////////////////////////////////////////////
//         Copyright (c) 2021, Jasper Parker         //
//                All rights reserved.               //
///////////////////////////////////////////////////////



const http = require("http");
var mysql = require('mysql');
var connect = require('connect');
var fs = require('fs');
var path = require('path');
const puppeteer = require('puppeteer');
const crypt = require('crypto');


const port = 8080;
const bad_req_msg = "bad request";

function sanitize(str) {
    str = str.split(">").join("&gt;");
    str = str.split("<").join("&lt;");
    return str;
}



function varify_session(oauth_crypt) {
    return new Promise(resolve => {
        var hash = crypt.createHmac('sha256', oauth_crypt);
        //only run this is not in cache
        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://soundcloud.com');
            await page.setCookie({
                'name': 'oauth_token',
                'value': oauth_crypt,
            });
            await page.reload();
            var path = "/html/body/div[1]/header/div/div[3]/div[2]/a[1]";
            var pathjs = "#app > header > div > div.header__right.sc-clearfix > div.header__userNav > a.header__userNavButton.header__userNavUsernameButton";
            await page.waitForXPath(path);
            var tag = await page.$eval(pathjs, el => el.getAttribute("href"));
            resolve(tag);
            await browser.close();
            //add tag with hash to cache

        })();
    });
}

function get_follow_list(tag) {
    return new Promise(resolve => {
        (async () => {
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            await page.goto('https://soundcloud.com/' + tag + '/followers');
            const get_chunk = async () => {
                return await page.evaluate(async () => {
                    return await new Promise(resolve => {
                        var name_chunk = [];
                        let elements = document.getElementsByClassName("userBadgeListItem__title");
                        for (let elem of elements) {
                            var str = elem.childNodes[1].href;
                            name_chunk.push(str.substr(str.lastIndexOf('/') + 1));
                        }
                        resolve(name_chunk);
                    })
                })
            }
            await page.waitForXPath('/html/body/div[1]/div[2]/div[2]/div/div/div[2]/div/div/ul/li[1]/div/div[2]/a');
            await autoScroll(page);
            var list = await get_chunk();
            resolve(list);
            await browser.close();
        })();
    });
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var pre_scrollHeight;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, scrollHeight);
                if (pre_scrollHeight == scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
                pre_scrollHeight = scrollHeight;
            }, 1500);
        });
    });
}

get_follow_list('0xbee').then(list => {
    console.log(JSON.stringify(list));
    console.log(list.length);
});

var requestListener = connect()
    .use(function (req, res) {
        //res.writeHead("Access-Control-Allow-Origin: *");
        function die() {
            //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
            res.end(bad_req_msg);
        }
        const { headers, method, url } = req;
        const split_url = url.split('/');
        if (split_url.length > 0)
            switch (split_url[1]) {
                case "icons":
                    res.setHeader('Content-type', 'image/svg+xml');
                    fs.readFile("./icons/" + split_url[2], function (error, content) {
                        if (error)
                            die();
                        else
                            res.end(content, 'utf-8');
                    });
                    break;
                case "badge":
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    fs.readFile("./badges/" + split_url[2].toLowerCase() + '.json', function (error, content) {
                        if (error)
                            res.end(" ");
                        else
                            res.end(content, 'utf-8');
                    });
                    break;
                case "setbadge":
                    //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    var body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });
                    req.on("end", function () {
                        res.writeHead(200, { "Content-Type": "text/html", 'Access-Control-Allow-Origin': req.headers.origin });
                        var token_finish = body.indexOf(':');
                        varify_session(body.substr(0, token_finish)).then((tag) => {
                            var _json = sanitize(body.substr(token_finish + 1));
                            var parse = JSON.parse(_json);
                            if (parse.links != tag.substr(1)) {
                                die();
                            } else {
                                //TODO: make this actully do somehitng
                                console.log(parse.roster);

                                fs.writeFile('./badges/' + tag.substr(1) + '.json', _json, function () {
                                    res.end("success");
                                });
                            }
                        });
                    });
                    break;
                case "getstyle":
                    //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    if (split_url.length > 2 && split_url[3] === "plain")
                        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    else
                        res.setHeader('Content-type', 'text/css');

                    fs.readFile("./stylesheets/" + split_url[2].toLowerCase() + ".css", function (error, content) {
                        if (error)
                            res.end(" ", 'utf-8');
                        else
                            res.end(content, 'utf-8');
                    });

                    break;
                case "setstyle":
                    //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    var body = "";
                    req.on("data", function (chunk) {
                        body += chunk;
                    });
                    req.on("end", function () {
                        res.writeHead(200, { "Content-Type": "text/html", 'Access-Control-Allow-Origin': req.headers.origin });
                        var token_finish = body.indexOf('/*');
                        varify_session(body.substr(0, token_finish)).then((tag) => {
                            fs.writeFile('./stylesheets/' + tag.substr(1) + '.css', sanitize(body.substr(token_finish)), function () {
                                console.log("file error");
                            });
                            res.end("success");
                        });
                    });
                    break;
                default:
                    die();
                    break;
            }
        else
            die();
    });



const server = http.createServer(requestListener);
server.listen(port);