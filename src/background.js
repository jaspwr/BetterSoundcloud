chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(changeInfo);
    if (tab.url.split('/')[3] == "messages") {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["./messages.js"]
        }, () => {
            console.log("messages");
        });
    } else {
        if ((changeInfo.favIconUrl) || (changeInfo.status == "loading" && changeInfo.url)) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["./main.js"]
            }, () => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["./ace/ace.js"]
                }, () => {
                    console.log("main");
                });
            });
        }
    }
});