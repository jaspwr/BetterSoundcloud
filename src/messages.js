function wait_for_page(class_name) {
    //This is fucked but idk how else to make it wait until the element exists
    return new Promise(resolve => {
        var checkExist = setInterval(function () {
            var elem = document.getElementsByClassName(class_name);
            if (elem.length > 0) {
                clearInterval(checkExist);
                resolve(elem);
            }
        }, 100);
    });
}


var checkExist = setInterval(function () {
    if (document.body) {
        clearInterval(checkExist);
        var sheet = document.getElementById("custom_style");
        if (sheet != undefined)
            sheet.remove();
    }
}, 100);


var messages_box = document.querySelector("#content > div > div.l-messages-main > div > div.conversation__messages");
wait_for_page("textfield__label g-required-label").then(text => {
    text[0].remove();
});
wait_for_page("conversationMessages__item sc-clearfix").then(msgs => {


    var full_wid = document.getElementsByClassName("sc-media-content")[0].offsetWidth;
    var pre_self = false;
    for (var i = 0; i < msgs.length; i++) {

        var self = msgs[i].childNodes[0].childNodes[4].childNodes[1].childNodes.length > 1;
        msgs[i].childNodes[0].childNodes[4].childNodes[1].style.visibility = "hidden";
        var avatar = msgs[i].childNodes[0].childNodes[0];
        if (self == pre_self && i != 0) {
            msgs[i].style.marginTop = "-40px";
            avatar.style.visibility = "hidden";
        }
        //var date = msgs[i].childNodes[0].childNodes[2].childNodes[0].getAttribute("datetime");
        var date = msgs[i].childNodes[0].childNodes[2].style;
        //if end of block
        var self_next = !self;
        if (i + 1 < msgs.length)
            self_next = msgs[i + 1].childNodes[0].childNodes[4].childNodes[1].childNodes.length > 1;

        if (self_next == self)
            date.visibility = "hidden";
        date.position = "absolute";
        date.display = "block";
        date.left = "55px";
        var para_count = msgs[i].childNodes[0].childNodes[4].childNodes[3].childNodes.length;
        var para_fix = [];
        for (var ii = 1; ii < para_count - 1; ii++) {
            var message;
            if (self) {
                message = msgs[i].childNodes[0].childNodes[4].childNodes[3].childNodes[ii];
                message.style.backgroundColor = "#e5e5e5";
            } else {
                message = msgs[i].childNodes[0].childNodes[4].childNodes[3].childNodes[ii];
                message.style.backgroundColor = "#ff5500";
                message.style.color = "white";
                message.style.alignSelf = "right";
                var wid = message.offsetWidth;
                var offset = (full_wid - wid) - 12;
                message.style.transform = "translateX(" + offset.toString() + "px)";
                avatar.style.float = "right";
                date.left = offset + "px";
            }

            message.style.position = "relative";
            message.style.borderRadius = "16px";
            message.style.padding = "10px";
            message.style.top = "-24px";
            var hei = message.offsetHeight;
            date.top = (7 + hei).toString() + "px";
            //check for embeds
            if (message.childNodes.length > 0 && !
                (message.childNodes[0].hasChildNodes()
                    && message.childNodes[0].childNodes[0].hasChildNodes())) {
                message.style.maxWidth = "265px";
                message.style.display = "inline-block";
            }

        }
        para_fix.forEach(para => {
            para.parentNode.insertBefore(document.createElement('br'), para.nextSibling);
        })
        pre_self = self;
    }
});
