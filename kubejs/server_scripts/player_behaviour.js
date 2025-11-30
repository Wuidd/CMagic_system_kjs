// priority: 2
//玩家行为

const $EntityPickupEvent = Java.loadClass("tschipp.carryon.events.EntityPickupEvent")

let spongeWord = ".." //混淆替换词
let noSpongeChar = [",","，",".","。","？","?","!","！"] //不予混淆的字符
let shoutRadius = [35,40,45] //大声发的收听范围
let talkRadius = [8,12,16] //普通谈话的收听范围
let whispRadius = [2,3,4] //耳语的收听范围
let localRadius = shoutRadius[2] //本地听取的收听范围
let disableEffectTimePause = 20 //消除禁用效果的间隔
let nightSpeedMulti = 0.5 //夜晚流逝速度

//禁用掉落物消失且禁用丢出特殊物品

ItemEvents.dropped(event =>{
    let player = event.player
    let item = event.item
    if (isMajoPlayer(player)){
        if (item.id.includes('yuushya:button_sign')){
            player.addItem(item)
            event.cancel()
        }
        let itemEntity = event.itemEntity
        itemEntity.setNoDespawn()
    }
})

//临时禁用一些效果
ServerEvents.tick(event =>{
    let server = event.server
    let time = server.tickCount
    if (time % disableEffectTimePause == 0){
        server.runCommandSilent('/effect clear @a kaleidoscope_cookery:flatulence')
        server.runCommandSilent('/effect clear @a kaleidoscope_cookery:satiated_shield')
    }
})

//发言规范

PlayerEvents.chat(event =>{
    let player = event.player
    let username = event.username
    let message = String(event.message)
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
                receiver.tell("<"+username+"§e◆场务§f "+isOperator(player).name+"> "+message)
            }
            event.cancel()
        }
        for (let receiver of allPlayers){
            receiver.tell("<"+username+"> "+message)
        }
        event.cancel()
    }
    else {
        if (isJudging){return 0}
        if (isMajoPlayer(player)){
            let majo = isMajoPlayer(player)
            let ananOrder = false
            let ananOrderRadius = -1
            let ananOrderReceived = []
            let ananMessageReceived = []
            if (majo.name == "夏目安安"){
                let order = messagePrefix(message)
                order = String(order)
                order = order.replace("\[","【")
                order = order.replace("\]","】")
                if (order.charCodeAt(0) === "【" && (order.charCodeAt((order.length)-1) === "【" || order.charCodeAt((order.length)-1) === "】")){
                    if (order.length > 2){
                        ananOrder = true
                        switch (message.charCodeAt(0)){
                        case "#":
                            ananOrderRadius = shoutRadius[0]
                            break
                        case "$":
                        case "￥":
                            ananOrderRadius = whispRadius[0]
                            break
                        default:
                            ananOrderRadius = talkRadius[0]
                            break
                        }
                    }
                    else (
                        event.cancel()
                    )
                }
            }
            if (majo.faint || player.sleeping){message = faintWords[Math.floor(Math.random()*faintWords.length)]}
            for (let receiver of allPlayers){
                if (isMajoPlayer(receiver)){
                    let distance = receiver.distanceToEntity(player)
                    if (distance < ananOrderRadius && ananOrder){
                        if (messagePrefix(message).includes(isMajoPlayer(receiver).name)){
                            ananOrderReceived.push(isMajoPlayer(receiver))
                            message = message.replace(isMajoPlayer(receiver).name,'')
                            let order = messagePrefix(message)
                            order = String(order)
                            order = order.replace("\[","【")
                            order = order.replace("\]","】")
                            if (order === "【】"){
                                event.cancel()
                            }
                        }
                        ananMessageReceived.push(isMajoPlayer(receiver))
                        continue
                    } 
                    let speaker = majo.color+"◆"+majo.name
                    if (majo.name == '宝生玛格'){
                        let imitated = majo.learnedSound[majo.selectedSound]
                        speaker = imitated.color+"◆"+imitated.name
                    }
                    if (isMajoPlayer(receiver).faint){continue}
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
                    if (majo.faint){radiusSet = whispRadius}
                    if (distance > radiusSet[2]){continue}
                    if (distance > radiusSet[1] && distance <= radiusSet[2]){
                        speaker = "◆未知"
                    }
                    receiver.tell(speaker)
                    receiver.tell("  "+messageSponge(messagePrefix(message),Math.max(0,(distance-radiusSet[0])/(radiusSet[1]-radiusSet[0]))))
                }
                else {
                    if (receiver.stages.has("#local")){
                        let distance = receiver.distanceToEntity(player)
                        if (distance > localRadius){continue}
                    }
                    let speaker = majo.color+"◆"+majo.name
                    if (majo.name == '宝生玛格'){
                        let imitated = majo.learnedSound[majo.selectedSound]
                        speaker = imitated.color+"◆"+imitated.name+"§f("+majo.color+"◆"+majo.name+"§f)"
                        if (imitated.name == '宝生玛格'){
                            speaker = majo.color+"◆"+majo.name
                        }
                    }
                    receiver.tell(speaker)
                    receiver.tell("  "+messagePrefix(message))
                }
            }
            if (ananOrder){
                if (!ananOrderReceived.length){
                    for (let receiver of global.majoList){
                        if (receiver.player){
                            if (receiver.player.distanceToEntity(player) <= ananOrderRadius && receiver.name != "夏目安安"){
                                ananOrderReceived.push(receiver)
                            }
                        }
                    }
                }
                if (!ananOrderReceived.length){event.cancel()}
                let order = messagePrefix(message)
                order = String(order)
                order = order.slice(0,0)+"【"+order.slice(1)
                order = order.slice(0,order.length-1)+'】'
                for (let orderReceiver of ananMessageReceived){
                    orderReceiver.player.tell(majo.color+"◆"+majo.name)
                    orderReceiver.player.tell("  "+order)
                }
                for (let orderReceiver of ananOrderReceived){
                    if (orderReceiver.player){
                        let receiverName = orderReceiver.player.name.string
                        orderReceiver.player.potionEffects.add("minecraft:nausea",140,0,false,false)
                        server.runCommandSilent("/shader apply "+receiverName+" exposure:shaders/post/light_blue_tint.json")
                        orderReceiver.shadering = true
                        server.runCommandSilent('/title '+receiverName+' title {"text":"'+majo.color+order+'"}')
                        server.runCommandSilent("/execute as "+receiverName+" at @s run playsound minecraft:entity.wither.spawn ambient @s ~ ~ ~ 1 2")
                        server.scheduleInTicks(100,event =>{
                            server.runCommandSilent("/shader remove "+receiverName)
                            orderReceiver.shadering = false
                        })
                    }
                }
            }
            event.cancel()
        }
        if (isOperator(player)){
            if (message == "#local"){
                server.runCommandSilent("/execute as "+username+" at @s run playsound minecraft:block.note_block.harp voice @s")
                if (!player.stages.has("#local")){
                    player.tell("§e切换至听取本地聊天")
                    player.stages.add("#local")
                    event.cancel()
                }
                else {
                    player.tell("§e您已在听取本地聊天了")
                    event.cancel()
                }
            }
            if (message == "#all"){
                server.runCommandSilent("/execute as "+username+" at @s run playsound minecraft:block.note_block.harp voice @s")
                if (player.stages.has("#local")){
                    player.tell("§e切换至听取全局聊天")
                    player.stages.remove("#local")
                    event.cancel()
                }
                else {
                    player.tell("§e您已在听取全局聊天了")
                    event.cancel()
                }
            }
            for (let receiver of allPlayers){
                if (isMajoPlayer(receiver)){
                    let speaker = "◆"+isOperator(player).name
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
                    if (receiver.stages.has("#local")){
                        let distance = receiver.distanceToEntity(player)
                        if (distance > localRadius){continue}
                    }
                    receiver.tell("◆"+isOperator(player).name)
                    receiver.tell("  "+messagePrefix(message))
                }
            }
            event.cancel()
        }
        if (message == "#local"){
            server.runCommandSilent("/execute as "+username+" at @s run playsound minecraft:block.note_block.harp voice @s")
            if (!player.stages.has("#local")){
                player.tell("§e切换至听取本地聊天")
                player.stages.add("#local")
                event.cancel()
            }
            else {
                player.tell("§e您已在听取本地聊天了")
                event.cancel()
            }
        }
        if (message == "#all"){
            server.runCommandSilent("/execute as "+username+" at @s run playsound minecraft:block.note_block.harp voice @s")
            if (player.stages.has("#local")){
                player.tell("§e切换至听取全局聊天")
                player.stages.remove("#local")
                event.cancel()
            }
            else {
                player.tell("§e您已在听取全局聊天了")
                event.cancel()
            }
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

//时间校对/幕间的角色保护

PlayerEvents.tick(event =>{
    let level = event.level
    if (!timeSynsTrigger){
        if (level.night){
            timeSynsTrigger = true
            majolizeTimeTrigger = true
            mahoRifleReloadTimeTrigger = true
        }
    }
    if (timeSynsTrigger){
        if (!level.night){
            timeSynsTrigger = false
        }
    }
    if (isMajoProgressing){return 0}
    let player = event.player
    if (isMajoPlayer(player)){
        event.server.runCommandSilent("/effect give "+player.name.string+" minecraft:resistance 2 4 true")
    }    
})

//临时允许夜间时间流动

ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let server = event.server
    if (!server.getLevel("overworld").isNight()){return 0}
    let time = server.tickCount
    if (time % Math.floor(1/nightSpeedMulti) == 0){
        for (let player of server.playerList.players){
            if (player.sleeping){
                server.runCommandSilent("/time add 1")
                return 1
            }
        }
    }
})

//禁用方块破坏

BlockEvents.broken(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let block = event.block
    for (let allowed of global.breakableBlockList){
        if (block.id == allowed || block.hasTag(allowed)){return 0}
    }
    event.cancel()
})

//被抱起时的标签

NativeEvents.onEvent($EntityPickupEvent,event =>{
    if (event.target.isPlayer()){
        if (isMajoPlayer(event.target)){
            isMajoPlayer(event.target).carrior = event.player
        }
    }
})

PlayerEvents.tick(event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.carrior){
        if (!majo.carrior.carryOnData.isCarrying("player")){
            majo.carrior = null
        }
    }
})

//搬运尸体时不产生掉落物

let corpseInventoryTemp = {}

NativeEvents.onEvent($EntityPickupEvent,event =>{
    if (event.target.type == "corpse:corpse"){
        let nbt = event.target.nbt
        corpseInventoryTemp[nbt["Death"]["PlayerName"]] = [nbt["Death"]["MainInventory"],nbt["Death"]["OffHandInventory"],nbt["Death"]["ArmorInventory"]]
        nbt["Death"]["OffHandInventory"] = []
        nbt["Death"]["ArmorInventory"] = []
        nbt["Death"]["MainInventory"] = []
        event.target.setNbt(nbt)
    }
})

EntityEvents.spawned("corpse:corpse",event =>{
    if (!Object.keys(corpseInventoryTemp).length){return 0}
    let nbt = event.entity.nbt
    if (corpseInventoryTemp[nbt["Death"]["PlayerName"]]){
        nbt["Death"]["MainInventory"] = corpseInventoryTemp[nbt["Death"]["PlayerName"]][0]
        nbt["Death"]["OffHandInventory"] = corpseInventoryTemp[nbt["Death"]["PlayerName"]][1]
        nbt["Death"]["ArmorInventory"] = corpseInventoryTemp[nbt["Death"]["PlayerName"]][2]
        event.entity.setNbt(nbt)
        delete corpseInventoryTemp[nbt["Death"]["PlayerName"]]
    }
})

//不允许放置功能按钮

BlockEvents.rightClicked(event =>{
    let item = event.item
    if (item.id.includes('yuushya:button_sign')){
        let player = event.player
        let server = event.server
        let newItem = item.copy()
        if (player.getMainHandItem().id == item.id){
            server.scheduleInTicks(1,event =>{
                player.setMainHandItem(newItem)
            })
        }
        if (player.getOffHandItem().id == item.id){
            server.scheduleInTicks(1,event =>{
                player.setOffHandItem(newItem)
            })
        }
    }
})

BlockEvents.placed(event =>{
    let block = event.block
    let level = event.level
    if (block.id.toString().includes('yuushya:button_sign')){
        level.removeBlock(block.pos,false)
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