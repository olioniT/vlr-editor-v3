chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "DOWNLOAD") {
        console.log("RECEIVED DOWNLOAD REQUEST")
        chrome.downloads.download({
            saveAs: false,
            url: message.url,
            filename: message.filename
        })
    }
})