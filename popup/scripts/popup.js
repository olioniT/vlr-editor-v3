// Form saving timeout
// let currentTimeout;
let agentSelectButton = undefined
let agentSelected = undefined

async function initialise() {
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