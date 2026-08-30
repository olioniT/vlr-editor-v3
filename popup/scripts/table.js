async function populateMapOptions() {
    let maps = await getMaps()
    let mapFilter = (map) => {
        let name = map.mapUrl

        if (name.includes("Duel") || name.includes("HURM") || name.includes("NPEV2") || name.includes("Duel") || name.includes("Poveglia")) {
            return false
        } else {
            return true
        }
    }    

    maps.filter(mapFilter).forEach((map) => {
        let option = document.createElement("option")
        
        option.innerHTML = map.displayName
        option.value = map.displayName

        document.querySelector("select#map").appendChild(option)
    })
}

function populateTableRows() {
    for (var i = 0; i < 10; i++) {
        document.querySelector("div#match-table div#body").innerHTML += createRow(i)
    }
}

function assignEnforceMinMax() {
    Array.from(document.querySelectorAll('input[type="number"')).forEach((input) => {
        input.addEventListener("input", () => enforceMinMax(input))
    })
}

function assignSaveInteraction() {
    Array.from(document.querySelectorAll("input")).forEach((input) => {
        input.addEventListener("input", async () => {
            console.log("Saving latest instance of form...")
    
            await chrome.storage.local.set({
                tableData: getDataFromTable()
            })
        })
    })

    document.querySelector("#map").addEventListener("change", async () => {
        console.log("MAP HAS CHANGED")

        await chrome.storage.local.set({
            tableData: getDataFromTable()
        })
    })
}

function assignButtonFunctions() {
    Array.from(document.querySelectorAll("button.agent")).forEach(btn => {
        btn.addEventListener("mousedown", (event) => {
            if (event.button === 0) {
                agentSelectButton = btn
                showModal(document.getElementById("modal"))
            }
    
            if (event.button === 2) {
                btn.attributes.agent.value = "none"
                btn.style.backgroundImage = "none"
                btn.innerHTML = "+"
            }
        })

        removeContextMenuInteraction(btn)
    })

    Array.from(document.querySelectorAll("button.checkbox")).forEach(btn => {
        btn.addEventListener("click", () => {
            if (btn.attributes.checked.value == "false") { btn.attributes.checked.value = true; return; }
            if (btn.attributes.checked.value == "true") { btn.attributes.checked.value = false; return; }
        })
    })

    document.querySelector("#vlr").addEventListener("click", async () => {
        chrome.tabs.create({
            url: "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview",
            active: true
        })
    })

    document.querySelector("#clear").addEventListener("click", async () => {
        clearDataOnTable()
        await chrome.storage.local.set({
            tableData: getDataFromTable()
        })
    })

    document.querySelector("#screenshot").addEventListener("click", async () => {
        const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true
            })
        
        if (tab.url === "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview") {
            chrome.tabs.sendMessage(tab.id, {
                action: "SCREENSHOT",
            })
        }
    })

    document.querySelector("#save").addEventListener("click", async () => {
        let game = getDataFromTable()

        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        })

        if (tab.url === "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview") {
            chrome.tabs.sendMessage(tab.id, {
                action: "UPDATE_TABLE",
                payload: game
            })
        }
    })
}

function getDataFromTable() {
    let game = {
        "gameInfo": {
            "map": document.getElementById("map").options[document.getElementById("map").selectedIndex].text,
            "length": timerInSeconds(document.querySelector("#hr").value, document.querySelector("#min").value, document.querySelector("#sec").value),
            "teamAttackingFirst": determineTeam(document.querySelector("#team-1-atk-first"), document.querySelector("#team-2-atk-first")),
            "teamPickingFirst": determineTeam(document.querySelector("#team-1-map-pick"), document.querySelector("#team-2-map-pick"))
        },
        "teams": {
            "team1": {
                "name": document.querySelector("#team-1 .team-info .team-name").value,
                "tag": document.querySelector("#team-1 .team-info .team-tag").value,
                "atk": document.querySelector("#team-1 .rounds .atk").value,
                "def": document.querySelector("#team-1 .rounds .def").value,
                "ot": document.querySelector("#team-1 .rounds .ot").value,
                "winner": determineWinner() === 1 ? true : false,
            },
            "team2": {
                "name": document.querySelector("#team-2 .team-info .team-name").value,
                "tag": document.querySelector("#team-2 .team-info .team-tag").value,
                "atk": document.querySelector("#team-2 .rounds .atk").value,
                "def": document.querySelector("#team-2 .rounds .def").value,
                "ot": document.querySelector("#team-2 .rounds .ot").value,
                "winner": determineWinner() === 2 ? true : false,
            }
        },
        "playerInfo": getDataOfRows(Array.from(document.querySelector("div#match-table div#body").children))
    }

    return game
}

function giveDataToTable(game) {
    console.log(game)

    Array.from(document.querySelectorAll(".teams")).forEach((team, index) => {
        team.querySelector(".team-name").value = game.teams[`team${index + 1}`].name
        team.querySelector(".team-tag").value = game.teams[`team${index + 1}`].tag

        team.querySelector(".atk").value = game.teams[`team${index + 1}`].atk
        team.querySelector(".def").value = game.teams[`team${index + 1}`].def
        team.querySelector(".ot").value = game.teams[`team${index + 1}`].ot

        if (game.gameInfo.teamAttackingFirst === index + 1) { team.querySelector(`#team-${index + 1}-atk-first`).attributes.checked.value = true }
        if (game.gameInfo.teamPickingFirst === index + 1) { team.querySelector(`#team-${index + 1}-map-pick`).attributes.checked.value = true }
    })

    let duration = secondsAsTimer(game.gameInfo.length)
    document.querySelector("#hr").value = duration.hours == "00" ? "" : duration.hours
    document.querySelector("#min").value = duration.minutes == "00" ? "" : duration.minutes
    document.querySelector("#sec").value = duration.seconds == "00" ? "" : duration.seconds

    document.querySelector("#map").value = game.gameInfo.map == "Select a map..." ? "default" : game.gameInfo.map

    Array.from(document.querySelector("#match-table > #body").children).forEach((row, rowIndex) => {
        Array.from(row.children).forEach((cell) => {
            if (cell.id) {
                cell.value = game.playerInfo[rowIndex][cell.id.split("-").at(-1)]
            } else {
                if (cell.className === "player-info") {
                    cell.querySelector(".flag").value = game.playerInfo[rowIndex].player.flag
                    cell.querySelector(".player").value = game.playerInfo[rowIndex].player.name
                }

                if (cell.className === "agent-info") {
                    let agentIndex = 0
                    Object.values(game.playerInfo[rowIndex].agents).forEach((agent) => {
                        if (agent.name.trim() !== "none") {
                            let agentCell = cell.querySelector(`#r${rowIndex + 1}-agent-${agentIndex + 1}`)

                            agentCell.innerHTML = ""
                            agentCell.style.backgroundImage = `url(${agent.icon})`
                            agentCell.attributes.agent.value = agent.name.toLowerCase()

                            agentIndex++
                        }
                    })
                }
            }
        })
    })
}

function clearDataOnTable() {
    Array.from(document.querySelectorAll("input")).forEach((input) => {
        input.value = ""
    })

    Array.from(document.querySelectorAll("button")).forEach((button) => {
        if (button.attributes.agent) {
            button.innerHTML = "+"
            button.style.backgroundImage = ""
            button.attributes.agent.value = "none"
        }

        if (button.attributes.checked) {
            button.attributes.checked.value = "false"
        }
    })

    document.querySelector("#map").value = "default"
}