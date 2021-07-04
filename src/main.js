function grab_tag(str) {
  return str.substr(str.lastIndexOf('/') + 1);
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

      var msgs = document.getElementsByClassName("conversationMessages__item sc-clearfix");
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
            avatar.style.float = "right";
          }

          message.style.position = "relative";
          message.style.borderRadius = "16px";
          message.style.padding = "10px";
          message.style.top = "-24px";
          //check for embeds
          if (!message.childNodes[0].hasChildNodes()) {
            message.style.maxWidth = "265px";
            message.style.display = "inline-block";
          }
          if (ii < para_count - 1) {
            para_fix.push(message);
          }
        }
        para_fix.forEach(para => {
          para.parentNode.insertBefore(document.createElement('br'), para.nextSibling);
        })
        pre_self = self;
      }
      break;
    default:
      //follows you
      if (self_followers.includes(user_tag))
        document.getElementsByClassName("profileHeaderInfo__userName g-type-shrinkwrap-block g-type-shrinkwrap-large-primary")[0].innerHTML +=
          "<div style=\"display: inline; background-color: #666666; font-size: 16px; padding: 3px; border-radius: 4px; color: #a6a6a6\">Follows you</div>";

      //new icons
      var links = document.getElementsByClassName("web-profiles__item");
      console.log(links.length);
      for (var i = 0; i < links.length; i++) {
        var link_elem = links[i].childNodes[0].childNodes[0];
        //Add email, traktrain, applemusic, beatport
        if (link_elem.href.includes("discord")) {
          console.log(link_elem.childNodes);
          link_elem.childNodes[1].style.background = "url('https://pbs.twimg.com/media/E5L38mPX0AE0FEk?format=jpg&name=4096x4096') no-repeat 50% 50%";
        }
      }

      //extra page settings
      // var elem = document.getElementsByClassName("profileSettings__form")[0];
      // var css = document.createElement('textarea');
      // elem.appendChild(css);
      break;
  }
  //colour change for debug
}


//document.onload = apply_changes();
window.addEventListener("load", function () {
  apply_changes();
});
