///////////////////   Functions   ///////////////////
function grab_tag(str) {
  return str.substr(str.lastIndexOf('/') + 1);
}

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

function inset_after(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function clean_up_css() {
  var checkExist = setInterval(function () {
    if (document.body) {
      clearInterval(checkExist);
      var sheet = document.getElementById("custom_style");
      if (sheet != undefined)
        sheet.remove();
    }
  }, 100);

}




///////////////////   Init Processes   ///////////////////
var self_followers = ["bpiv", "dltzk"];
var self_tag;
var url = window.location.href.split('/');;
var user_style;
var user_tag;
var css_txt = ""
var hide_original_css = false

if (url[3] != "messages") {
  const Http = new XMLHttpRequest();
  const url = 'http://localhost:8080/getstyle/' + user_tag + "/plain";
  Http.open("GET", url);
  Http.setRequestHeader('Content-type', 'text/plain');
  Http.onreadystatechange = function () {
    css_txt = Http.responseText;
    if (css_txt.split('*/')[0] == "/*1") {
      //remove all existing css from the document
      hide_original_css = true;
      var styles = document.getElementsByTagName("style")
      for (var i = 0; i < styles.length; i++) {
        var id = styles[i].getAttribute("id");
        if (id != undefined && !id.includes("ace"))
          styles[i].remove();
      }
      var links = document.getElementsByTagName("link")
      for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute("rel") == "stylesheet" && links[i].getAttribute("id") != "custom_style")
          links[i].setAttribute("href", "")
      }
    }
  }
  Http.send();



  user_tag = grab_tag(window.location.href);
  var sheet_url = "http://localhost:8080/getstyle/" + user_tag;
  var _sheet = document.getElementById("custom_style");
  if (_sheet)
    _sheet.setAttribute("href", sheet_url);
  else {
    var sheet = document.createElement('link');
    sheet.setAttribute("rel", "stylesheet");
    sheet.setAttribute("id", "custom_style");
    sheet.setAttribute("href", sheet_url);
    document.body.appendChild(sheet);
  }

  var icons_ = document.createElement('style');
  icons_.innerHTML +=
    `.social_icon_bsc{
      display: inline-block;
        width: 16px;
        height: 16px;
        vertical-align: top;
        text-indent: 16px;
        white-space: nowrap;
        overflow: hidden;
        transition: opacity .2s;
        background-size: 16px 16px;
        opacity: 60%;
    }
    .social_icon_bsc:hover{
      opacity: 100%;

    }
    `;
  document.body.appendChild(icons_);




}



///////////////////   After page has loaded   ///////////////////
function apply_changes() {
  switch (url[3]) {
    case "messages":
      clean_up_css();
      const messages_box = document.querySelector("#content > div > div.l-messages-main > div > div.conversation__messages");
      console.log(messages_box);
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
          var date = msgs[i].childNodes[0].childNodes[2].childNodes[0].getAttribute("datetime");
          msgs[i].childNodes[0].childNodes[2].style.visibility = "hidden";
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
            }

            message.style.position = "relative";
            message.style.borderRadius = "16px";
            message.style.padding = "10px";
            message.style.top = "-24px";
            //check for embeds
            if (message.childNodes.length > 0 && !message.childNodes[0].hasChildNodes()) {
              message.style.maxWidth = "265px";
              message.style.display = "inline-block";
            }
            // if (ii < para_count - 2) {
            //   para_fix.push(message);
            // }
          }
          para_fix.forEach(para => {
            para.parentNode.insertBefore(document.createElement('br'), para.nextSibling);
          })
          pre_self = self;
        }
      });


      break;
    default:
      //follows you
      if (self_followers.includes(user_tag)) {
        wait_for_page("profileHeaderInfo__userName g-type-shrinkwrap-block g-type-shrinkwrap-large-primary")
          .then((name) => {
            name[0].innerHTML +=
              "<div style=\"display: inline; background-color: #666666; font-size: 16px; padding: 3px; border-radius: 4px; color: #a6a6a6\">Follows you</div>";
          });
      }

      //new icons
      wait_for_page("web-profiles__item").then(links => {
        var list = ["discord", "traktrain", "pcmusic", "namemc", "roblox", "mail", "paypal", "cash", "venmo", "apple", "beatport"];
        for (var i = 0; i < links.length; i++) {
          var link_elem = links[i].childNodes[0].childNodes[0];
          //Add email, traktrain, applemusic, beatport, spotify subdomain, roblox, paypal, cashapp, venmo
          list.forEach(l => {
            console.log(l);
            if (link_elem.href.includes(l)) {
              var span = link_elem.childNodes[1];
              console.log(span.classList)
              span.classList.remove('sc-social-logo');
              span.classList.remove('sc-social-logo-personal');


              var link = "http://localhost:8080/" + "icons/" + l + ".svg";
              span.innerHTML = "<img class=\"social_icon_bsc\" src=\"" + link + "\">"
            }
          });
        }
      });

      //check if own page
      if (self_tag.toLowerCase() == user_tag.toLowerCase()) {


        wait_for_page("sc-button-edit editProfileButton sc-button sc-button-medium sc-button-responsive editProfileButton--hiddenLabelOnSmallScreen").then(elem => {
          var edit_button = elem[0]
          edit_button.addEventListener("click", () => {
            //extra page settings
            wait_for_page("profileSettings__form").then((elem) => {
              var _new = document.createElement('div');
              _new.innerHTML = '<div class="g-form-section-head"><h3 class="g-form-section-title">Custom CSS</h3></div>';
              //var css = document.createElement('textarea');
              //_new.appendChild(css);
              _new.innerHTML += '<br><input type="checkbox" id="hide_original_css"></input> Remove orginal stylesheet<br><br>Note: Some properties may require "!important" before the semicolon to override the original Soundcloud CSS. <br>'
              _new.innerHTML += '<style type="text/css" media="screen">#editor {margin: 0; height: 500px;padding: 2px 7px;border-radius: 4px;}</style><pre id="editor" class = "csseditor"></pre>';
              _new.innerHTML += `<style>.ApplyCSS{
              background-color: #f50;
              border-color: #f50;
              color: #fff;
              position: relative;
              height: 26px;
              margin: 0;
              padding: 2px 11px 2px 10px;
              border: 1px solid #e5e5e5;
              border-radius: 3px;
              cursor: pointer;
              font-size: 14px;
              line-height: 20px;
              white-space: nowrap;
              font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;
              font-weight: 100;
              text-align: center;
              vertical-align: baseline;
              box-sizing: border-box;
          
          }</style>
          <div class="profileSettings__formButtons sc-button-toolbar sc-border-light-top">
              <div class="profileSettings__permalinkWarning sc-text-light sc-text-secondary">
              </div>
              <button type="button" class="ApplyCSS" title="Apply CSS" aria-label="Apply CSS">Apply CSS</button>
            </div>`;
              _new.innerHTML += '<div class="g-form-section-head"><h3 class="g-form-section-title">Collective settings</h3></div>';
              _new.innerHTML += `<br><input type=\"checkbox\"></input>Collective account<br><br>
            <div style = "opacity: 30%;">
              Collective Badge:

            </div>
            `
              elem[0].appendChild(_new);

              var editor = ace.edit("editor");
              //I dont know why but the editor only works after you run 
              //both of these lines even though the theme dosnt even exit
              editor.setTheme("ace/theme/twilight");
              editor.session.setMode("ace/mode/css");
              var spl = css_txt.split('*/');
              if (spl.length > 1)
                editor.setValue(spl[1]);

              document.getElementById("hide_original_css").checked = hide_original_css;
              //TODO: save css when close edit menu

              //save button
              var save = document.getElementsByClassName("ApplyCSS")[0];
              var lstnr = save.addEventListener("click", () => {
                const Http = new XMLHttpRequest();

                const url = 'http://localhost:8080/setstyle';
                Http.open("POST", url, true);
                Http.setRequestHeader('Content-type', 'text/plain');
                Http.onreadystatechange = function () {
                  console.log(Http.responseText);
                  if (Http.responseText === "success")
                    location.reload();
                }
                var head = "/*0*/";
                if (document.getElementById("hide_original_css").checked)
                  head = "/*1*/"
                Http.send(head + editor.getValue());

              });
            });
          });
        });
      }
      break;
  }
}


wait_for_page("header__userNavButton header__userNavUsernameButton").then(elem => {
  self_tag = grab_tag(elem[0].href);
  apply_changes();
  console.log("Injected script started");
});


