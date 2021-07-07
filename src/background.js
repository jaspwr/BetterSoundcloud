var injected = false;
var pre_url = "";


chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    self_followers: ["bpiv", "dltzk"]
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo);
  console.log(tabId);

  if (changeInfo.status === "loading") {
    if (!injected) {
      injected = true;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./main.js"]
      }, () => {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["./ace/ace.js"]
        }, () => {
          console.log("ghhhhhhhh");
        });
      });
    }
  } else if (changeInfo.status === "complete") {
    if (pre_url != tab.url)
      injected = false;
    pre_url = tab.url;
  }

});

// function apply_changes() {
//   document.body.style.backgroundColor = 'red';
// }

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: apply_changes
//   });
// });
