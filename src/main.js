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



//on doc init
var user_tag = grab_tag(window.location.href);
console.log(user_tag);
var user_style = ".spotlight__empty {background-color: black;}";
var sheet = document.createElement('style');
sheet.innerHTML = user_style;
document.body.appendChild(sheet);






var self_followers;
var self_tag;
var url;

function apply_changes() {
  //init stuff (do on load)
  url = window.location.href.split('/');
  self_tag = grab_tag(document.getElementsByClassName("header__userNavButton header__userNavUsernameButton")[0].href);
  self_followers = ["bpiv", "dltzk"];



  //on page switch
  switch (url[3]) {
    case "messages":
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
        for (var i = 0; i < links.length; i++) {
          var link_elem = links[i].childNodes[0].childNodes[0];
          //Add email, traktrain, applemusic, beatport, spotify subdomain, roblox
          if (link_elem.href.includes("discord")) {
            console.log(link_elem.childNodes);
            link_elem.childNodes[1].style.background = "url('https://pbs.twimg.com/media/E5L38mPX0AE0FEk?format=jpg&name=4096x4096') no-repeat 50% 50%";
          }
        }
      });

      //check if own page
      if (self_tag.toLowerCase() === user_tag.toLowerCase()) {
        var edit_button = document.getElementsByClassName("sc-button-edit editProfileButton sc-button sc-button-medium sc-button-responsive editProfileButton--hiddenLabelOnSmallScreen")[0];
        edit_button.addEventListener("click", () => {
          //extra page settings
          wait_for_page("profileSettings__form").then((elem) => {
            var _new = document.createElement('div');
            _new.innerHTML = '<div class="g-form-section-head"><h3 class="g-form-section-title">Custom CSS</h3><button type="button" class="hintButton sc-button sc-button-small" tabindex="0" aria-haspopup="true" role="button" aria-owns="dropdown-button-2577"></button>  </div>';
            var css = document.createElement('textarea');
            _new.appendChild(css);
            //inset_after(_new, elem[0]);
            elem[0].appendChild(_new);
            console.log(_new);
          });
        });
      }
      break;
  }
}


apply_changes();

console.log("Injected script started");