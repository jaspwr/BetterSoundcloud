chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    self_followers: ["bpiv", "dltzk"]
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tabId);
  console.log(changeInfo);
  console.log(tab);

  if (changeInfo.status === "complete") {
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
