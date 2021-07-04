function grab_tag(str) {
  return str.substr(str.lastIndexOf('/') + 1);
}

var self_followers;
var self_tag;

function apply_changes() {
  //init stuff (do on load)
  var url = window.location.href.split('/');
  self_tag = grab_tag(document.getElementsByClassName("header__userNavButton header__userNavUsernameButton")[0].href);
  self_followers = ["bpiv"];



  //on page switch
  switch (url[3]) {
    case "messages":
      var msgs = document.getElementsByClassName("conversationMessage__body sc-type-small sc-text-body");
      for (item of msgs) {
        item.style.textAlign = "center"
      }
      break;
    default:
      //User page
      var user_tag = url[3];

      //follows you
      if (self_followers.includes(user_tag))
        document.getElementsByClassName("profileHeaderInfo__userName g-type-shrinkwrap-block g-type-shrinkwrap-large-primary")[0].innerHTML +=
          "<div style=\"display: inline; background-color: #666666; font-size: 16px; padding: 3px; border-radius: 4px; color: #a6a6a6\">Follows you</div>";

      //new icons
      var msgs = document.getElementsByClassName("web-profiles__item ");
      console.log(msgs.length);
      for (var i = 0; i < msgs.length; i++) {
        var link_elem = msgs[i].childNodes[0].childNodes[0];
        if (link_elem.href.includes("discord")) {
          console.log(link_elem.childNodes);
          link_elem.childNodes[1].style.background = "url('https://pbs.twimg.com/media/E5L38mPX0AE0FEk?format=jpg&name=4096x4096') no-repeat 50% 50%";
          link_elem.childNodes[1].style.background = "url('https://pbs.twimg.com/media/E5L38mPX0AE0FEk?format=jpg&name=4096x4096') no-repeat 50% 50%";
          // link_elem.innerHTML =
          //   "<img src=\"https://pbs.twimg.com/media/E5L38mPX0AE0FEk?format=jpg&name=4096x4096\" height=\"16\" width=\"16\" style=\"display: inline-block; position: relative;\" > "
          //   + link_elem.innerHTML.split("</span>")[1];
        }
      }

      document.body.style.backgroundColor = 'red';

      break;
  }
  //colour change for debug
}


//document.onload = apply_changes();
window.addEventListener("load", function () {
  apply_changes();
});
