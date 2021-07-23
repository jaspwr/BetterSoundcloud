chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo);
  console.log(tabId);

  if (tab.url.split('/')[3] == "messages") {
    injected = false;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["./messages.js"]
    }, () => {
      console.log("uuuuuuuuuuuuu");
    });
  } else {
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

