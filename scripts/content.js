if (window.location.href !== "https://www.vlr.gg/498632/sentinels-vs-fnatic-valorant-masters-toronto-2025-lr2/?game=221182&tab=overview") {
    console.log("NOT ON SPECIFIC VLR.GG MATCH")
} else {
    // HTML clean-up using CSS, completely getting rid of clutter
    document.querySelector("div#wrapper").style.padding = "0"
    document.querySelector("div#wrapper").style.height = "100vh"
    document.querySelector("div#wrapper").style.display = "flex"
    document.querySelector("div#wrapper").style.boxShadow = "none"
    document.querySelector("div#wrapper").style.alignItems = "center"
    document.querySelector("div#wrapper").style.justifyContent = "center"
    document.querySelector("div#wrapper").style.backgroundColor = "rgba(0, 0, 0, 0)"

    document.querySelector("div.vm-stats-container").style.width = "750px"
    document.querySelector("div.vm-stats-container").style.borderRadius = "5px"
    document.querySelector("div.vm-stats-container").style.borderRadius = "5px"
    document.querySelector("div.vm-stats-container").style.boxShadow = "#5f5f5f 0px 2.5px 15px 2.5px"

    document.querySelector("div.footer").remove()
    document.querySelector("header.header").remove()
    document.querySelector("div.col.mod-1").remove()
    document.querySelector("div.col.mod-2").remove()
    document.querySelector("div > div.vm-stats-tabnav").parentElement.remove()

    document.querySelectorAll("div.ovw-table").forEach(table => { table.style.gridTemplateColumns = "minmax(max-content, 1fr) 36px max-content 32px 36px 36px 36px 28px 28px 32px" })
    document.querySelectorAll("div.ovw-row.mod-head > div.ovw-th[data-col='rating2']").forEach(cell => { cell.remove() })
    document.querySelectorAll("div.ovw-row > div.ovw-cell[data-col='rating2']").forEach(cell => { cell.remove() })

    document.querySelector("div.col-container > div.col.mod-3").prepend(document.querySelector("div.wf-card > .vm-stats"))

    Array.from(document.querySelectorAll("div.col.mod-3 > div")).forEach((div, index) => {
        if (index !== 0) { div.remove() }
    })

    // Table clean-up, removing the other games + some clutter
    Array.from(document.querySelectorAll(".vm-stats-game")).forEach(game => {
        if (!game.className.includes("mod-active")) {
            game.remove()
        } else {
            game.querySelector("div.vlr-rounds").remove()
            game.querySelector("div.ovw-filter").remove()
        }
    })

    // Remove all attack-side/defense-side numbers, leaving only the combined value of both in a span.mod-both
    Array.from(document.querySelectorAll("div.ovw-cell")).forEach(cell => {
        Array.from(cell.querySelectorAll("span.side")).forEach(side => {
            if (!side.className.includes("mod-both")) {
                side.remove()
            }
        })
    })

    Array.from(document.querySelectorAll("div.team")).forEach((team, index) => {
        team.querySelector("div.score").innerHTML = "0"
        team.querySelector("div.score").className = "score"

        team.querySelector("div:not(.score)").className = "info"
        
        let teamName = document.createElement("div")
        teamName.innerHTML = `Team ${index + 1}`
        teamName.className = "team-name"
        
        let span1 = document.createElement("span")
        let span2 = document.createElement("span")
        let span3 = document.createElement("span")
        span1.innerText = "0"
        span1.className = "1st-half"
        span2.innerText = "0"
        span2.className = "2nd-half"
        span3.innerText = "0"
        span3.className = "ot"
        
        let separator1 = document.createTextNode(" / ")
        let separator2 = document.createTextNode(" / ")

        team.querySelector("div.info").replaceChildren(
            teamName,
            span1,
            separator1,
            span2,
            separator2,
            span3
        )
    })

    let map = document.querySelector("div.map")
    let mapName = map.querySelector("div > span")
    let mapDuration = map.querySelector("div.map-duration")

    mapName.innerHTML = "Map"
    mapDuration.innerHTML = "00:00"

    // Changing data in cells, resetting them all.
    Array.from(document.querySelectorAll("i.flag")).forEach((playerFlag) => { playerFlag.className = "flag mod-nz" })
    Array.from(document.querySelectorAll("div.ovw-player-name")).forEach((playerName, index) => { playerName.innerHTML = `Player ${index + 1}` })
    Array.from(document.querySelectorAll("div.ovw-player-tag")).forEach((playerTag, index) => { playerTag.innerHTML = `Team ${index < 5 ? "1" : "2"}` })

    Array.from(document.querySelectorAll("div.ovw-agents")).forEach(container => {
        container.replaceChildren()
    })

    Array.from(document.querySelectorAll("div.ovw-cell span.side.mod-both")).forEach(cell => {
        cell.innerHTML = "0"
        cell.className = "side mod-both"
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "UPDATE_TABLE") {
        const game = message.payload
        console.log(game)

        Array.from(document.querySelectorAll("div.team")).forEach(((team, index) => {
            let teamIndex = `team${index + 1}`
            let attackingFirst = game.gameInfo.teamAttackingFirst

            team.querySelector(".score").innerHTML = Number(game.teams[teamIndex].atk) + Number(game.teams[teamIndex].def) + Number(game.teams[teamIndex].ot)

            let rounds = Array.from(team.querySelectorAll("div > span"))

            rounds[0].innerText = game.teams[teamIndex][attackingFirst ? "atk" : "def"] !== "" ? game.teams[teamIndex][attackingFirst ? "atk" : "def"] : "0"
            rounds[1].innerText = game.teams[teamIndex][attackingFirst ? "def" : "atk"] !== "" ? game.teams[teamIndex][attackingFirst ? "def" : "atk"] : "0"
            rounds[2].innerText = game.teams[teamIndex].ot !== "" ? game.teams[teamIndex].ot : "0"

            if (attackingFirst !== 0) {
                rounds[0].className = `1st-half ${attackingFirst === (index + 1) ? "mod-t" : "mod-ct"}`
                rounds[1].className = `2nd-half ${attackingFirst === (index + 1) ? "mod-ct" : "mod-t"}`
            } else {
                rounds[0].className = "1st-half"
                rounds[1].className = "2nd-half"
            }

            team.querySelector("div > div.team-name").innerHTML = game.teams[teamIndex].name !== "" ? game.teams[teamIndex].name : `Team ${index + 1}`

            team.querySelector(".score").className = "score"
            if (game.teams[teamIndex].winner) {
                team.querySelector(".score").className = "score mod-win"
            }
        }))

        const displayMapPick = () => {
            let span = document.createElement("span")

            span.className = `picked mod-${game.gameInfo.teamPickingFirst} ge-text-light`
            span.innerText = " PICK "

            if (game.gameInfo.teamPickingFirst === 0) {
                document.querySelectorAll("div.map > div span.picked").forEach(mapPick => {
                    mapPick.remove()
                })
            }
            
            if (game.gameInfo.teamPickingFirst === 1) { document.querySelector("div.map > div > span").prepend(span) }
            if (game.gameInfo.teamPickingFirst === 2) { document.querySelector("div.map > div > span").append(span) }
        }

        const setMap = () => {
            if (game.gameInfo.map === "Select a map...") {
                document.querySelector("div.map > div > span").innerText = "Map"
            } else {
                document.querySelector("div.map > div > span").innerText = game.gameInfo.map
            }
        }

        const setMatchDuration = () => {
            if (game.gameInfo.length > 0) {
                let totalSeconds = game.gameInfo.length
                let hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                let minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                let seconds = (totalSeconds % 60).toString().padStart(2, '0');
                
                document.querySelector(".map-duration").innerText = `${hours !== "00" ? hours + ":" : ""}${minutes}:${seconds}`
            } else {
                document.querySelector(".map-duration").innerText = "00:00"            
            }
        }

        Array.from(document.querySelectorAll("i.flag")).forEach((playerFlag, index) => {
            if (game.playerInfo[index].player.flag.trim() !== "") {
                playerFlag.className = `flag mod-${game.playerInfo[index].player.flag.toLowerCase().trim()}`
            }
        })
        
        Array.from(document.querySelectorAll("div.ovw-player-name")).forEach((playerName, index) => {
            let name = game.playerInfo[index].player.name.trim()
            playerName.innerHTML = name !== "" ? name : `Player ${index + 1}`
        })

        Array.from(document.querySelectorAll("div.ovw-player-tag")).forEach((playerTag, index) => {
            let team1Tag = game.teams.team1.tag.trim()
            let team2Tag = game.teams.team2.tag.trim()
            
            if (index < 5) {
                playerTag.innerHTML = team1Tag !== "" ? team1Tag : "TEAM 1"
            } else {
                playerTag.innerHTML = team2Tag !== "" ? team2Tag : "TEAM 2"
            }
        })

        Array.from(document.querySelectorAll("div.ovw-agents")).forEach((row, rowIndex) => {
            let { agents, ...playerInfo } = game.playerInfo[rowIndex]
            
            if (Array.from(row.children).length > 0) { row.replaceChildren() }

            Object.values(agents).forEach((agent) => {
                if (agent.name.trim() !== "none") {
                    if (agent.name.trim() === "kay/o") { row.appendChild(createAgentBlock("kayo")) }
                    else { row.appendChild(createAgentBlock(agent.name)) }
                }
            })
        })

        Array.from(document.querySelectorAll("div.ovw-row:not(.mod-head)")).forEach((row, rowIndex) => {
            Array.from(row.querySelectorAll("div.ovw-cell span.side.mod-both")).forEach(cell => {
                let cellWrapper = cell.parentElement.parentElement
                
                if (cellWrapper.attributes.getNamedItem("data-col") !== null) {
                    let cellID = cellWrapper.attributes["data-col"].value.split("-").at(0)

                    if (cellID !== "fk" && cellID !== "kd") {
                        let cellValue = game.playerInfo[rowIndex][cellID] !== "" ? game.playerInfo[rowIndex][cellID] : "0"
                        
                        cell.innerHTML = cellValue
                    } else {
                        let cellValue = game.playerInfo[rowIndex][`${cellID}-diff`] !== "" ? game.playerInfo[rowIndex][`${cellID}-diff`] : "0"

                        cell.innerHTML = cellValue
                        cell.className = `side mod-both ${isPositiveOrNegative(cellValue)}`
                    }
                } else {
                    let cellParent = cell.parentElement
                    let cellData = cellParent.attributes.getNamedItem("data-col").value
                    let cellValue = game.playerInfo[rowIndex][cellData[0]] !== "" ? game.playerInfo[rowIndex][cellData[0]] : "0"

                    cell.innerText = cellValue
                }
            })

        })

        setMap()
        displayMapPick()
        setMatchDuration()
    }

    if (message.action === "SCREENSHOT") {
        const board = document.querySelector("div.col-container")

        html2canvas(board).then(canvas => {
            canvas.toBlob(blob => {
                const date = new Date().toISOString().split("T")[0]
                const time = new Date().toISOString().split("T")[1].split(".")[0].split(":").join("-")
                const filename = `${date}_${time}.png`

                const url = URL.createObjectURL(blob)
                
                chrome.runtime.sendMessage({ action: "DOWNLOAD", url, filename })
            })
        })
    }
})

// Helper functions...
function isPositiveOrNegative(score) {
    if (score > 0) { return "mod-positive" }
    if (score < 0) { return "mod-negative" }
    
    return ""
}

function createAgentBlock(agentName) {
    const span = document.createElement("span")
    const img = document.createElement("img")

    span.className = "stats-sq mod-agent small"
    
    img.title = agentName
    img.alt = agentName.toLowerCase()
    img.src = `/img/vlr/game/agents/${agentName.toLowerCase()}.png`

    span.appendChild(img)
    
    return span
}