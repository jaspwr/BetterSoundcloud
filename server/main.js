var myArgs = process.argv.slice(2);

const http = require("http");
var mysql = require('mysql');
var connect = require('connect');
var fs = require('fs');
var path = require('path');
const puppeteer = require('puppeteer');

const crypt = require('crypto');


const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});
client.connect();




const port = parseInt(myArgs[0]);
const bad_req_msg = "bad request";

function sanitize(str) {
    str = str.split(">").join("&gt;");
    str = str.split("<").join("&lt;");
    return str;
}

function simple_sql_sanitize(str) {
    try {
        str = str.split("\"").join("&qm&");
        str = str.split("'").join("&sqm&");
        str = str.split("`").join("&oqm&");
        str = str.split(";").join("&sc&");
        str = str.split(")").join("&cb&");
        str = str.split("(").join("&ob&");
        str = str.split("}").join("&ccb&");
        str = str.split("{").join("&ocb&");
        return str;
    } catch (e) {
        console.log(str);
        return " ";
    }
}

function simple_sql_desanitize(str) {
    try {
        str = str.split("&qm&").join("\"");
        str = str.split("&sqm&").join("'");
        str = str.split("&oqm&").join("`");
        str = str.split("&sc&").join(";");
        str = str.split("&cb&").join(")");
        str = str.split("&ob&").join("(");
        str = str.split("&ccb&").join("}");
        str = str.split("&ocb&").join("{");
        return str;
    } catch (e) {
        console.log(str);
        return " ";
    }
}

function clean(str) {
    str = str.split(" ").join("");
    str = str.split("\n").join("");
    str = str.split("\r").join("");
    str = str.split("\n\r").join("");
    return str;
}



// client.query(`
//         set transaction read write;
//         DROP TABLE users;
//         CREATE TABLE users(tag VARCHAR ( 25 ) UNIQUE NOT NULL, follow_list TEXT, css TEXT, badge TEXT, cols TEXT);
//         `, (err, res) => {
//     if (err) throw err;
//     console.log(res);
// });


function get_db_row(tag, column) {
    tag = simple_sql_sanitize(tag);
    column = simple_sql_sanitize(column);
    return new Promise(resolve => {
        client.query(`
        SELECT `+ column + ` FROM users WHERE tag = '` + tag + `';
        `, (err, res) => {
            if (err) throw err;
            resolve(res);
        });
    });
}

function set_db_row(tag, column, value) {
    tag = simple_sql_sanitize(tag);
    column = simple_sql_sanitize(column);
    value = simple_sql_sanitize(value);
    return new Promise(resolve => {
        client.query(`
        do $$
        begin  
            if NOT EXISTS (SELECT * FROM users WHERE tag = '` + tag + `') then
                INSERT INTO users VALUES ('` + tag + `', ' ', '/*0*/','[]','[]');
                UPDATE users SET ` + column + `='` + value + `' WHERE tag = '` + tag + `';
            else
                UPDATE users SET ` + column + `='` + value + `' WHERE tag = '` + tag + `';
            end if;
        end $$
        `, (err, res) => {
            if (err) { resolve(1); throw err; };
            resolve(0);
        });
    });
}


function create_if_not_exists_get(tag, column) {
    tag = simple_sql_sanitize(tag);
    return new Promise(resolve => {
        client.query(`
        do $$
        begin  
            if NOT EXISTS (SELECT * FROM users WHERE tag = '` + tag + `') then
                INSERT INTO users VALUES ('` + tag + `', ' ', '/*0*/','[]','[]');
                PERFORM `+ column + ` FROM users WHERE tag = '` + tag + `';
            else
                PERFORM `+ column + ` FROM users WHERE tag = '` + tag + `';
            end if;
        end $$
        `, (err, res) => {
            if (err) { resolve(1); console.log(err) };
            resolve(0);
        });
    });
}




function varify_session(oauth_crypt) {
    return new Promise(resolve => {
        var hash = crypt.createHmac('sha256', oauth_crypt);
        //only run this is not in cache
        (async () => {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
            });
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
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
            });
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
                case "getfollows":
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    get_db_row(split_url[2].toLowerCase(), 'follow_list', _json).then(content => {
                        res.end(simple_sql_desanitize(content.rows[0].follow_list), 'utf-8');
                    });
                    break;
                case "updatefollows":
                    get_follow_list(split_url[2].toLowerCase()).then(list => {
                        set_db_row(split_url[2].toLowerCase(), 'cols', JSON.stringify(list)).then(status => {
                            console.log(status);
                        });
                    });
                    break;
                case "getcols":
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    get_db_row(split_url[2].toLowerCase(), 'cols').then(content => {
                        res.end(simple_sql_desanitize(content.rows[0].cols), 'utf-8');
                    });
                    break;
                case "setcols":
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
                            set_db_row(tag.substr(1), 'cols', _json).then(status => {
                                console.log(status);
                                res.end("success");
                            });
                        });
                    });
                    break;
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
                    get_db_row(split_url[2].toLowerCase(), 'badge').then(content => {
                        var ret = "[]";
                        //console.log(content);
                        try {
                            ret = content.rows[0].badge;
                        } catch (e) {
                            ret = "[]";
                        }
                        res.end(simple_sql_desanitize(ret), 'utf-8');
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
                                var tags = clean(parse.roster).split('@');
                                tags.shift();
                                if (tags.length > 0) {
                                    tags.forEach(tg => {
                                        console.log("tag:" + tg + "[");
                                        get_db_row(tg, 'cols').then(content => {
                                            var con = content.rows[0];
                                            console.log(con);
                                            if (con != undefined) {
                                                var __json = simple_sql_desanitize(con.cols);
                                                if (!__json.includes(tag.substr(1))) {
                                                    var obj = JSON.parse(__json);
                                                    obj.push([false, tag.substr(1)]);
                                                    console.log('ssssssss' + JSON.stringify(obj))
                                                    set_db_row(tg, 'cols', JSON.stringify(obj)).then(status => {
                                                        console.log(status);
                                                    });
                                                }
                                            } else {
                                                var obj = [];
                                                obj.push([false, tag.substr(1)]);
                                                console.log("hhhhh" + JSON.stringify(obj));
                                                set_db_row(tg, 'cols', JSON.stringify(obj)).then(status => {
                                                    console.log(status);
                                                });
                                            }
                                        });

                                    });
                                }
                                set_db_row(tag.substr(1), 'badge', _json).then(status => {
                                    console.log(status);
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

                    get_db_row(split_url[2].toLowerCase(), 'css').then(css => {
                        var ret = simple_sql_desanitize(css.rows[0].css);
                        res.end(ret, 'utf-8');
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

                            set_db_row(tag.substr(1), 'css', sanitize(body.substr(token_finish))).then(status => {
                                console.log(status);
                                res.end("success");
                            });

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