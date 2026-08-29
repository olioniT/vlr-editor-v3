document.getElementById("modal").style.display = "none"

function createAgentCard(icon, name) {
    let card = document.createElement("img")
    
    card.className = "agent-card"
    card.oncontextmenu = false
    card.src = icon

    card.addEventListener("click", async () => {
        agentSelectButton.innerHTML = ""
        agentSelectButton.style.backgroundImage = `url(${icon})`
        agentSelectButton.attributes.agent.value = name.toLowerCase()
        
        await chrome.storage.local.set({
            tableData: getDataFromTable()
        })

        hideModal()
    })

    return card
}

async function populateModal() {
    let agents = await getAgents()
    let modal = document.querySelector("div#modal > div#body")

    agents.forEach(agent => {
        modal.appendChild(createAgentCard(agent.displayIconSmall, agent.displayName))
    })
}

overlay.addEventListener("click", () => { hideModal() })