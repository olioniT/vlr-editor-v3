// Form saving timeout
// let currentTimeout;
let agentSelectButton = undefined
let agentSelected = undefined

async function initialise() {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    })

    if (!tab.url.includes("www.vlr.gg")) {
        document.querySelector("#game").style.display = "none"
        document.querySelector("#alert").style.display = "flex"
    } else {
        document.querySelector("#game").style.display = "flex"
        document.querySelector("#alert").style.display = "none"
    }

    // if (tab.url === "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview") {
    //     chrome.tabs.sendMessage(tab.id, {
    //         action: "UPDATE_TABLE",
    //         payload: game
    //     })
    // }

    await populateMapOptions()

    populateTableRows()
    assignEnforceMinMax()
    assignButtonFunctions()
    assignSaveInteraction()

    populateModal()
    
    mutuallyExcludeCheckboxes(document.querySelector("#team-1-atk-first"), document.querySelector("#team-2-atk-first"))
    mutuallyExcludeCheckboxes(document.querySelector("#team-1-map-pick"), document.querySelector("#team-2-map-pick"))

    removeContextMenuInteraction(document.querySelector("body"))
    removeContextMenuInteraction(document.querySelector("#modal > #overlay"))
    removeContextMenuInteraction(document.querySelector("#modal > #body"))

    let data = await chrome.storage.local.get(["tableData"])
    let game = data.tableData

    giveDataToTable(game)
}

initialise()