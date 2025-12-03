// priority:0

//vector3到近似整数数组的变化

function vecToArr(vec3){
    let Arr = [vec3.x,vec3.y,vec3.z]
    Arr.forEach((cor,index) => Arr[index] = Math.floor(cor))
    return Arr
}

//从魔女名字检索魔女

function findMajo(name){
    for (let majo of global.majoList){
        if (majo.name == name){return majo}
    }
}

//是否为魔女玩家，如果是，返回魔女角色

function isMajoPlayer(player){
    try {
        if (typeof player == "string"){
            for (let majo of global.majoList){
                if (majo.player){
                    if (player == majo.player.name.string){return majo}
                }
            }
            return null
        }
    }
    finally {
        for (let majo of global.majoList){
            if (majo.player){
                if (player.name.string == majo.player.name.string){return majo}
            }
        }
        return null
    }
}

//玩家是否在某结构中，如果是，返回结构

function inStructure(player){
    let pos = vecToArr(player.position())
    let level = player.level.name.string
    for (let structure of global.structureList){
        if (level != structure.level){continue}
        let area = structure.area
        for (let cube of area){
            let startApex = cube[0]
            let endApex = cube[1]
            if (startApex[0] <= pos[0] && startApex[1] <= pos[1] && startApex[2] <= pos[2] &&
                endApex[0] >= pos[0] && endApex[1] >= pos[1] && endApex[2] >= pos[2]){
                if (player.isInFluidType("minecraft:water") && structure.waterRedirect){
                    if (pos[1] <= structure.waterRedirect.waterAlt){
                        return structure.waterRedirect
                    }
                    return structure
                }
                return structure
            }
        }
    }
    return null
}

//玩家是否在可记忆的结构中，如果是，返回结构或其所属结构

function inMemorableSturcture(player){
    let pos = vecToArr(player.position())
    let level = player.level.name.string
    for (let structure of global.memorableStructureList){
        if (level != structure.level){continue}
        let area = structure.area
        for (let cube of area){
            let startApex = cube[0]
            let endApex = cube[1]
            if (startApex[0] <= pos[0] && startApex[1] <= pos[1] && startApex[2] <= pos[2] &&
                endApex[0] >= pos[0] && endApex[1] >= pos[1] && endApex[2] >= pos[2]){
                if (player.isInFluidType("minecraft:water") && structure.waterRedirect){
                    if (pos[1] <= structure.waterRedirect.waterAlt){
                        if (structure.waterRedirect.attachTo){
                            return structure.waterRedirect.attachTo
                        }
                        return structure.waterRedirect
                    }
                    if (structure.attachTo){
                        return structure.attachTo
                    }
                    return structure
                }
                if (structure.attachTo){
                    return structure.attachTo
                }
                return structure
            }
        }
    }
    return null
}

//玩家是否在指定结构中

function inSpecificStructure(player,name){
    let structure = findStructure(name)
    if (!structure){return false}
    let pos = vecToArr(player.position())
    let level = player.level.name.string
    if (level != structure.level){return false}
    let area = structure.area
    for (let cube of area){
        let startApex = cube[0]
        let endApex = cube[1]
        if (startApex[0] <= pos[0] && startApex[1] <= pos[1] && startApex[2] <= pos[2] &&
            endApex[0] >= pos[0] && endApex[1] >= pos[1] && endApex[2] >= pos[2]){
            return true
        }
    }
    return false
}

//寻找结构

function findStructure(name){
    let structure = null
    for (let s of global.structureList){
        if (s.name == name){
            structure = s
        }
    }
    return (structure)
}

//寻找某结构中的玩家

function findPlayersInStructure(name,server){
    let structure = findStructure(name)
    if (!structure){return []}
    else {
        let result = []
        for (let player of server.playerList.players){
            let pos = vecToArr(player.position())
            let level = player.level.name.string
            if (level != structure.level){continue}
            let area = structure.area
            for (let cube of area){
                let startApex = cube[0]
                let endApex = cube[1]
                if (startApex[0] <= pos[0] && startApex[1] <= pos[1] && startApex[2] <= pos[2] &&
                endApex[0] >= pos[0] && endApex[1] >= pos[1] && endApex[2] >= pos[2]){
                    result.push(player)
                    break
                }
            }
        }
        return (result)
    }
}

//寻找多个结构的玩家

function findPlayersInMultiStructure(names,server){
    let result = []
    for (let name of names){
        result = result.concat(findPlayersInStructure(name,server))
    }
    return result
}

//搜索指定名字的计分板代表

function findScoreHolder(server,name){
    let trackedPlayers = server.scoreboard.getTrackedPlayers()
    if (trackedPlayers){
        for (let player of trackedPlayers){
            if (player){
                return player.forNameOnly(name)
            }
            return null
        }
    }
    return null
}

//确认场务

function isOperator(player){
    try{
        if (typeof player == "string"){
            for (let op of global.operatorList){
                if (player == op.username){return op}
            }
            return null
        }
    }
    finally {
        for (let op of global.operatorList){
            if (player.name.string == op.username){return op}
        }
        return null
    }
}

//洗牌数组

function shuffleArray(arr) {
    for (let i = arr.length-1;i > 0;i--){
        const j = Math.floor(Math.random()*(i+1))
        let temp = arr[i]
        arr[i] = arr[j]
        arr[j] = temp
    }
    return arr
}