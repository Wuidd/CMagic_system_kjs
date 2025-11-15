// priority: 2
//玩家行为

let spongeWord = ".." //混淆替换词
let noSpongeChar = [",","，",".","。","？","?","!","！"] //不予混淆的字符
let shoutRadius = [24,32,40] //大声发的收听范围
let talkRadius = [6,10,14] //普通谈话的收听范围
let whispRadius = [1,2,3] //耳语的收听范围

//禁用掉落物消失

ItemEvents.dropped(event =>{
    let player = event.player
    if (isMajoPlayer(player)){
        let itemEntity = event.itemEntity
        itemEntity.setNoDespawn()
    }
})

//发言规范

PlayerEvents.chat(event =>{
    let player = event.player
    let username = event.username
    let message = event.message
    if (!messagePrefix(message)){event.cancel()}
    let server = event.server
    let allPlayers = server.playerList.players
    if (!isMajoProgressing){
        if (isMajoPlayer(player)){
            let majo = isMajoPlayer(player)
            for (let receiver of allPlayers){
                receiver.tell("<"+username+majo.color+"◆"+majo.name+"§f> "+message)
            }
            event.cancel()
        }
        if (isOperator(player)){
            for (let receiver of allPlayers){
                receiver.tell("<"+username+"§e◆场务§f "+operatorList[username]+"> "+message)
            }
            event.cancel()
        }
        for (let receiver of allPlayers){
            receiver.tell("<"+username+"> "+message)
        }
        event.cancel()
    }
    else {
        if (isMajoPlayer(player)){
            let majo = isMajoPlayer(player)
            if (majo.faint || player.sleeping){message = faintWords[Math.floor(Math.random()*faintWords.length)]}
            for (let receiver of allPlayers){
                if (isMajoPlayer(receiver)){
                    console.log("done")
                    let distance = receiver.distanceToEntity(player)
                    let speaker = majo.color+"◆"+majo.name
                    let radiusSet = []
                    switch (message.charCodeAt(0)){
                        case "#":
                            radiusSet = shoutRadius
                            break
                        case "$":
                        case "￥":
                            radiusSet = whispRadius
                            break
                        default:
                            radiusSet = talkRadius
                            break
                    }
                    console.log(radiusSet)
                    if (majo.faint){radiusSet = whispRadius}
                    if (distance > radiusSet[2]){continue}
                    if (distance > radiusSet[1] && distance <= radiusSet[2]){
                        speaker = "◆未知"
                    }
                    console.log(distance)
                    receiver.tell(speaker)
                    receiver.tell("  "+messageSponge(messagePrefix(message),Math.max(0,(distance-radiusSet[0])/(radiusSet[1]-radiusSet[0]))))
                }
                else {
                    receiver.tell(majo.color+"◆"+majo.name)
                    receiver.tell("  "+messagePrefix(message))
                }
            }
            event.cancel()
        }
        if (isOperator(player)){
            for (let receiver of allPlayers){
                if (isMajoPlayer(receiver)){
                    let speaker = "◆"+operatorList[username]
                    let radiusSet = []
                    switch (message.charCodeAt(0)){
                        case "%":
                            receiver.tell(speaker)
                            receiver.tell("  "+messagePrefix(message))
                            continue
                        case "#":
                            radiusSet = shoutRadius
                            break
                        case "$":
                        case "￥":
                            radiusSet = whispRadius
                            break
                        default:
                            radiusSet = talkRadius
                            break
                    }
                    let distance = receiver.distanceToEntity(player)
                    if (distance > radiusSet[2]){continue}
                    if (distance > radiusSet[1] && distance <= radiusSet[2]){
                        speaker = "◆未知"
                    }
                    receiver.tell(speaker)
                    receiver.tell("  "+messageSponge(messagePrefix(message),Math.max(0,(distance-radiusSet[0])/(radiusSet[1]-radiusSet[0]))))
                }
                else {
                    receiver.tell("◆"+operatorList[username])
                    receiver.tell("  "+messagePrefix(message))
                }
            }
            event.cancel()
        }
        for (let receiver of allPlayers){
            if (isMajoPlayer(receiver) || isOperator(receiver)){
                continue
            }
            else {
                receiver.tell("<"+username+"> "+message)
            }
        }
        event.cancel()
    }
})

//时间校对

PlayerEvents.tick(event =>{
    if (timeSynsTrigger){
        let level = event.level
        if (level.isNight()){timeSynsTrigger = false}
    }    
})

//规范化字符串

function messagePrefix(message){
    let messageNoNote = ''
    switch (message.charCodeAt(0)){
        case "#":
        case "$":
        case "￥":
        case "%":
            messageNoNote = message.slice(1)
            break
        default:
            messageNoNote = message
            break
    }
    let messageNoSpace = messageNoNote.trim()
    if (messageNoSpace == ''){return null}
    else {return messageNoSpace}
}

//文本混淆化

function messageSponge(message,percent){
    if (percent == 0){return message}
    if (percent > 1){
        let result = ''
        for (let i = 0;i < message.length;i++){
            let valid = false
            for (let noSponge of noSpongeChar){
                if (message.charCodeAt(i) == noSponge) {
                    valid = true
                    break
                }
            }
            if (valid) {result += message.charCodeAt(i)}
            else {result += spongeWord}
        }
        return result
    }
    let chars = message.split('')
    let validIndices = []
    chars.forEach((char,index)=>{
        let valid = false
        for (let noSponge of noSpongeChar){
            if (char.trim() == noSponge) {
                valid = false
                break
            }
            valid = true
        }
        if (valid) {
            validIndices.push(index)
        }
    })
    if (validIndices.length == 0) {return message}
    let replaceCount = Math.ceil(validIndices.length*percent)
    let selectedIndices = []
    for (let i = 0;i < replaceCount;i++){
        let randomPos = Math.floor(Math.random()*validIndices.length)
        selectedIndices.push(validIndices[randomPos])
        validIndices.splice(randomPos,1)
    }
    return selectedIndices.reduce((acc,index) =>{
        return acc.slice(0,index)+spongeWord+acc.slice(index+1)
    },message)
}