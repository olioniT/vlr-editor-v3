// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === 'complete' && tab.url && tab.url.includes('vlr.gg')) {
//         chrome.scripting.executeScript({
//             target: { tabId: tabId },
//             files: ['/scripts/content.js']
//         });
//     }
// });

chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        active: true,
        url: "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview"
    })
})