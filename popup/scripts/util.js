// Popup helper functions...
function showModal() { document.getElementById("modal").style.display = "flex" }
function hideModal() { document.getElementById("modal").style.display = "none" }

function createRow(index) {
    let team = index < 5 ? 1 : 2

    return `
    <div id="row-${index + 1}" class="row team-${team}">
        <div class="player-info">
            <input id="r${index + 1}-flag" placeholder="NZ" type="text" class="flag" maxlength="2">
            <input id="r${index + 1}-player" placeholder="Player name..." type="text" class="player">
        </div>
        <div class="agent-info">
            <button id="r${index + 1}-agent-1" src="../assets/icons/plus.svg" class="agent" agent="none">+</button>
            <button id="r${index + 1}-agent-2" src="../assets/icons/plus.svg" class="agent" agent="none">+</button>
            <button id="r${index + 1}-agent-3" src="../assets/icons/plus.svg" class="agent" agent="none">+</button>
        </div>
        <input id="r${index + 1}-acs" placeholder="0" type="number" min="0" max="999">
        <input id="r${index + 1}-k" placeholder="0" type="number" min="0" max="99">
        <input id="r${index + 1}-d" placeholder="0" type="number" min="0" max="99">
        <input id="r${index + 1}-a" placeholder="0" type="number" min="0" max="99">
        <input id="r${index + 1}-kast" placeholder="0%" type="number" min="0" max="100">
        <input id="r${index + 1}-adr" placeholder="0" type="number" min="0" max="999">
        <input id="r${index + 1}-hsp" placeholder="0%" type="number" min="0" max="100">
        <input id="r${index + 1}-fb" placeholder="0" type="number" min="0" max="99">
        <input id="r${index + 1}-fd" placeholder="0" type="number" min="0" max="99">
    </div>
    `
}

async function getAgents() {
    try {
        const response = await fetch("https://valorant-api.com/v1/agents")
        
        if (!response.ok) {
            throw new Error("Error fetching! status:", response.status)
        }
        
        const result = await response.json()
        const agents = result.data
        
        return agents
    } catch (err) {
        console.error(err)
    }
}

async function getMaps() {
    try {
        const response = await fetch("https://valorant-api.com/v1/maps")
        
        if (!response.ok) {
            throw new Error("Error fetching! status:", response.status)
        }
        
        const result = await response.json()
        const maps = result.data

        return maps
    } catch (err) {
        console.error(err)
    }
}

function enforceMinMax(input) {
    console.log("EDITING INPUT:", input)

    console.log(input.value)

    if (input.value != "") {
        if (parseInt(input.value) > parseInt(input.max)) {
            input.value = input.value.slice(0, -1)
        }

        if (parseInt(input.value) < parseInt(input.min)) {
            input.value = input.min
        }
    }
}

function mutuallyExcludeCheckboxes(checkboxA, checkboxB) {
    checkboxA.addEventListener("click", async () => {
        if (checkboxB.attributes.checked.value == "true") { checkboxB.attributes.checked.value = "false" }
        
        await chrome.storage.local.set({
            tableData: getDataFromTable()
        })
    })

    checkboxB.addEventListener("click", async () => {
        if (checkboxA.attributes.checked.value == "true") { checkboxA.attributes.checked.value = "false" }
        
        await chrome.storage.local.set({
            tableData: getDataFromTable()
        })
    })
}

function removeContextMenuInteraction(el) {
    el.addEventListener("contextmenu", (e) => {
        // e.preventDefault()
    })
}


function getGameLength(inputs) {
    let time = 0
    inputs.forEach(input => {
        let value = Number(input.value)

        if (input.id == "hr") {
            time += (60 * 60 * value)
        }

        if (input.id == "min") {
            time += (60 * value)
        }

        if (input.id == "sec") {
            time += value
        }
    })

    return time
}

function determineTeam(a, b) {
    if (a.attributes.checked.value == "true") { return 1 }
    if (b.attributes.checked.value == "true") { return 2 }
    return 0
}

function determineWinner() {
    let team1Wins = 0
    let team2Wins = 0

    Array.from(document.querySelectorAll(".teams .rounds > input")).forEach((rounds, index) => {
        if (index < 3) {
            team1Wins += Number(rounds.value)
        }
        
        if (index > 2) {
            team2Wins += Number(rounds.value)
        }
    })

    if (team1Wins === team2Wins) { return 0 }

    return team1Wins > team2Wins ? 1 : 2
}

function getDataOfRows(rowsArr) {
    let rows = []
    rowsArr.forEach(row => {
        let rowObj = {
            "player": {},
            "agents": {}
        }

        let kd = 0
        let fkfd = 0
        let agentIndex = 0
        Array.from(row.querySelectorAll("input, button")).forEach(cell => {
            let cellType = cell.nodeName.toLowerCase()

            if (cellType == "input") {
                let cellID = cell.id.split("-").at(-1)
                let cellValue = cell.value

                if (cellID == "k") { kd += Number(cellValue) }
                if (cellID == "d") { kd -= Number(cellValue) }

                if (cellID == "fb") { fkfd += Number(cellValue) }
                if (cellID == "fd") { fkfd -= Number(cellValue) }

                if (cellID !== "player" && cellID !== "flag") {
                    rowObj[cellID] = cellValue
                } else {
                    if (cellID === "player") { rowObj["player"]["name"] = cellValue }
                    if (cellID === "flag") { rowObj["player"]["flag"] = cellValue }
                }
            }

            if (cellType == "button") {
                agentIndex++
                let cellValue = cell.attributes.agent.value
                let cellID = cell.id.split("-")
                
                cellID.shift()
                cellID = cellID.join("")

                rowObj["agents"][`agent${agentIndex}`] = {
                    "name": cellValue,
                    "icon": cell.style.backgroundImage.slice(4, -1).replace(/"/g, "")
                }
            }
        })
        rowObj["kd-diff"] = kd > 0 ? `+${kd}` : kd.toString()
        rowObj["fk-diff"] = fkfd > 0 ? `+${fkfd}` : fkfd.toString()

        rows.push(rowObj)
    })

    return rows
}

function timerInSeconds(hours, minutes, seconds) {
    let totalSeconds = (Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds)
    return totalSeconds
}

function secondsAsTimer(totalSeconds) {
    let hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    let minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    let seconds = (totalSeconds % 60).toString().padStart(2, '0');
    
    return {
        "hours": hours, 
        "minutes": minutes, 
        "seconds": seconds 
    }
}