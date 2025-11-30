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