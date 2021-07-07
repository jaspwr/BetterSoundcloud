const http = require("http");
var mysql = require('mysql');
var connect = require('connect');
var fs = require('fs');
var path = require('path');

// var con = mysql.createConnection({
//     host: "localhost",
//     user: "yourusername",
//     password: "yourpassword"
// });

const port = 8080;
const bad_req_msg = "bad request";
var temp_style = `
/*0*/body{
    background-color: blue !important;
    
}`;

var requestListener = connect()
    .use(function (req, res) {


        //res.writeHead(200);


        //res.writeHead("Access-Control-Allow-Origin: *");
        function die() {
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
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
                case "getstyle":
                    //res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    if (split_url.length > 2 && split_url[3] === "plain")
                        res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    else
                        res.setHeader('Content-type', 'text/css');
                    res.end(temp_style);
                    break;
                case "setstyle":
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                    if (split_url.length > 0) {
                        var body = "";
                        req.on("data", function (chunk) {
                            body += chunk;
                        });

                        req.on("end", function () {
                            res.writeHead(200, { "Content-Type": "text/html" });
                            temp_style = body;
                            res.end("success");
                        });


                    } else
                        die();
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