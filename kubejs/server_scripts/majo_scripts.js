// priority: 1
//魔女与魔女化进程

const $ScoreHolder = Java.loadClass("net.minecraft.world.scores.ScoreHolder")

let isMajoProgressing = false //开关
let isFocusMode = false //焦点模式开关
let reloadTrigger = true //检测脚本被重载

let majoProgress = null //魔女化计分板
let fatigue = null //疲劳计分板
let pressure = null //压力计分板
let jump = null //跳跃计分板
let hunger = null //饱食度计分板
let weekdays = null //星期计分板
let days = null //日期计分板
let transferBookTo = null //笔记转化计分板
let neededScoreBoard = ["Majo_Progress","Fatigue","Pressure","Jump","Hunger","Weekdays","Days","transferBookTo"] //必要的计分板目录

let timeSynsTrigger = true //激活按天结算
let majolizeTimeTrigger = false //按天结算魔女化进度
let basicMajolizeSpeed = 100 //基础自然增长魔女化值
let majolizeInformTimePause = 100 //每隔该tick检查一次魔女化程度
let emaMajolizeFixTimePause = 1200 //每隔该tick触发一次艾玛的陪伴检定

//判断登录的玩家是否要赋予身份，如果需要，则赋予

PlayerEvents.loggedIn(event =>{
    let player = event.player
    let server = event.server
    let name = event.player.name.string
    if (!player.stages.has("firstIn")){
        player.tell("◆欢迎登岛，共犯君◆")
        server.runCommandSilent("/gamemode spectator "+name)
        player.stages.add("firstIn")
    }
    for (let i = 0;i<player.inventory.slots;i++){
        let item = player.inventory.getStackInSlot(i)
        if (item.has("minecraft:custom_data")){
            for (const majo of global.majoList){
                if (!majo.player && item.is(majo.token)){
                    setUpMajo(server,majo,player)
                    return true
                }
            }
        }    
    }
    if (isOperator(player)){
        let op = isOperator(player)
        op.player = player
        server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+name+'§e◆场务 '+op.color+op.name+'"}')
        if (isMajoProgressing){
            server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+op.color+'◆'+op.name+'"}')
            server.runCommandSilent("/gamemode spectator "+name)
            player.tell({"text":"演出已经开场了，您已被转换为观察者模式。","color":"green"})
            return true
        }
    }
    if (isMajoProgressing){
        server.runCommandSilent("/gamemode spectator "+name)
        player.tell({"text":"演出已经开场了，您已被转换为观察者模式并限制了发言频道。","color":"green"})
        return true
    }
})

//角色重设

PlayerEvents.loggedOut(event =>{
    let player = event.player
    let name = player.name.string
    let server = event.server
    server.runCommandSilent('/hiddennames setName '+name+' reset')
    if (isMajoPlayer(player)){
        majoPlayerAfterfix(event.server,isMajoPlayer(player))
    }
})

//死亡事件后

EntityEvents.death("player",event =>{
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let server = event.server
    let position = vecToArr(event.player.position()).toString()
    let type = event.source.type().msgId()
    let killer = null
    let killerMajo = null
    let killerMajoName = null
    let killerPosition = null
    let killerColor = null
    let hasWeapon = false
    let weapon = null
    let weaponName = null
    if(event.source.player){
        killer = event.source.player
        killerPosition = vecToArr(killer.position()).toString()
        killerMajo = isMajoPlayer(killer)
        if (killerMajo){
            killerColor = killerMajo.color
            killerMajoName = killerMajo.name
            if (killerMajo.majolizeScore < killerMajo.majolize){
                let score = server.scoreboard.getOrCreatePlayerScore(killerMajo.scoreHolder,majoProgress)
                score.set(Math.floor(score.get()/3))
                killerMajo.player.tell('§4你的黑暗面得到了释放……')
            }
            else {
                killerMajo.player.tell('§4还不够……还要杀死……更多……')
            }
        }
        else {
            killerMajoName = "非魔女角色"
            killerColor = "§f"
        }
        if(event.source.weaponItem != "air" && event.source.weaponItem){
            hasWeapon = true
            weapon = event.source.weaponItem.id.toString()
            weaponName = event.source.weaponItem.hoverName.string
        }
    }
    for (let operator of global.operatorList){
        let op = operator.username
        event.server.runCommandSilent('/tellraw '+op
            +' {"text":"['+majo.color+majo.name+'§e]，扮演者['+player.name.string
            +']死亡了！","color":"yellow"}')
        event.server.runCommandSilent('/tellraw '+op
            +' {"text":"-位置：'+position+'","color":"yellow"}')
        event.server.runCommandSilent('/tellraw '+op
            +' {"text":"-死因：'+type+'","color":"yellow"}')
        if (killer){
            event.server.runCommandSilent('/tellraw '+op
                +' {"text":"-凶手：['+killerColor+killerMajoName+'§e]，扮演者['+killer.name.string+']","color":"yellow"}')
            event.server.runCommandSilent('/tellraw '+op
                +' {"text":"-凶手的位置：'+killerPosition+'","color":"yellow"}')
        }
        if (hasWeapon){
            event.server.runCommandSilent('/tellraw '+op
                +' {"text":"-凶器：['+weaponName+'§e]，为物品['+weapon+']","color":"yellow"}')
        }       
    }
    desetUpMajo(server,majo)
})

//主进程

ServerEvents.tick(event =>{
    let server = event.server
    if (reloadTrigger){
        reloadScript(server)
    }
    if (!isMajoProgressing){return 0}
    let time = server.tickCount
    if (time % majolizeInformTimePause == 0){
        majolizeInform(server)
    }
    if (isFocusMode){return 0}
    if (majolizeTimeTrigger){
        majolizeProgress(server)
        majolizeTimeTrigger = false
    }
    if (time % emaMajolizeFixTimePause == 0){
        emaMajolizeFix(server)
    }
    
})

//魔女的持续修正

ServerEvents.tick(event =>{
    let majo = findMajo("冰上梅露露")
    if (majo.player){
        let player = majo.player
        player.potionEffects.add("minecraft:resistance",10,4,false,false)
        player.potionEffects.add("minecraft:regeneration",10,9,false,false)
    }
})

//完全魔女化的buff

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!player.stages.has("totallyMajolize")){return 0}
    player.potionEffects.add("minecraft:instant_health",10,99,false,false)
    player.potionEffects.add("minecraft:resistance",10,4,false,false)
    player.potionEffects.add("minecraft:speed",10,0,false,false)
    player.potionEffects.add("minecraft:jump_boost",10,1,false,false)
    player.potionEffects.add("minecraft:strength",10,2,false,false)
})

//审问开始

ItemEvents.rightClicked("yuushya:button_sign_play",event =>{
    let item = event.item
    let server = event.server
    if (item.customData.getBoolean("OperatorTool")){
        if (!isMajoProgressing){
            server.runCommandSilent('/title @a title {"text":"❀演出开场❀","color":"light_purple","bold":true}')
            server.runCommandSilent("/execute as @a at @s run playsound minecraft:block.note_block.harp voice @s")
            isMajoProgressing = true
            for (let player of server.playerList.players){
                let name = player.name.string
                if (isMajoPlayer(player)){
                    let majo = isMajoPlayer(player)
                    server.runCommandSilent("/gamemode survival "+name)
                    server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+majo.color+'◆'+majo.name+'"}')
                    player.tell({"text":"请开始您的表演。","color":"green"})
                    continue
                }
                if (isOperator(player)){
                    let op = isOperator(player)
                    server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+op.color+'◆'+op.name+'"}')
                    player.tell({"text":"请开始您的场务工作。","color":"green"})
                    continue
                }
                else {
                    server.runCommandSilent("/gamemode spectator "+name)
                    player.tell({"text":"您已被转换为观察者模式并限制了发言频道。","color":"green"})
                }
            }
        }
        else {
            for (let player of server.playerList.players){
                let name = player.name.string
                if (isMajoPlayer(player)){
                    let majo = isMajoPlayer(player)
                    server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+name+majo.color+'◆'+majo.name+'"}')
                    continue
                }
                if (isOperator(player)){
                    let op = isOperator(player)
                    server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+name+'§e◆场务 '+op.color+op.name+'"}')
                    continue
                }
            }
            server.runCommandSilent('/title @a title {"text":"❀演出落幕❀","color":"green","bold":true}')
            server.runCommandSilent("/execute as @a at @s run playsound minecraft:block.note_block.harp voice @s")
            isMajoProgressing = false
            isFocusMode = false
            isJudging = false
        }
    event.player.addItemCooldown("yuushya:button_sign_play",20)
    }
})

//焦点模式

ItemEvents.rightClicked("yuushya:button_sign_bookmark",event =>{
    let item = event.item
    let server = event.server
    let player = event.player
    if (item.customData.getBoolean("OperatorTool")){
        if (!isMajoProgressing){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.tell({"text":"演出还未开始，无法启用焦点模式。","color":"yellow"})
        }
        else {
            if (isJudging){
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                player.tell({"text":"审判正在进行，无法切换焦点模式。","color":"yellow"})
                event.player.addItemCooldown("yuushya:button_sign_bookmark",20)
                return 0
            }
            if (!isFocusMode){
                player.tell({"text":"焦点模式已启用，长周期系统已暂停生效。","color":"green"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                isFocusMode = true
            }
            else {
                player.tell({"text":"焦点模式已停用，长周期系统已恢复生效。","color":"yellow"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                isFocusMode = false
            }
        }
    event.player.addItemCooldown("yuushya:button_sign_bookmark",20)
    }
})

//脚本初始化

function reloadScript(server){
    let objectiveNames = server.scoreboard.objectiveNames;
    for (let objectives of neededScoreBoard){
        if (!objectiveNames.contains(objectives)){
            if (objectives == "Jump"){
                server.runCommandSilent("/scoreboard objectives add Jump minecraft.custom:minecraft.jump")
            }
            else if (objectives == "transferBookTo"){
                server.runCommandSilent("/scoreboard objectives add transferBookTo trigger")
            }
            else {
                server.runCommandSilent("/scoreboard objectives add "+objectives+" dummy")
            }
        }
    }
    server.runCommandSilent("/gamerule playersSleepingPercentage 200")
    server.runCommandSilent("/gamerule naturalRegeneration false")
    server.runCommandSilent("/gamerule doDaylightCycle false")
    majoProgress = server.scoreboard.getObjective('Majo_Progress')
    fatigue = server.scoreboard.getObjective('Fatigue')
    pressure = server.scoreboard.getObjective('Pressure')
    jump = server.scoreboard.getObjective('Jump')
    hunger = server.scoreboard.getObjective('Hunger')
    weekdays = server.scoreboard.getObjective("Weekdays")
    days = server.scoreboard.getObjective("Days")
    transferBookTo = server.scoreboard.getObjective("transferBookTo")
    currentDay = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly("day"),days).get()
    let weekDay = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly("day"),weekdays)
    if (weekDay.get() == 0){
        weekDay.set(1)
    }
    currentWeekDay = weekDay.get()
    switch(weekDay.get()){
        case 1:
            currentWeekDayString = '周一'
            break
        case 2:
            currentWeekDayString = '周二'
            break
        case 3:
            currentWeekDayString = '周三'
            break
        case 4:
            currentWeekDayString = '周四'
            break
        case 5:
            currentWeekDayString = '周五'
            break
        case 6:
            currentWeekDayString = '周六'
            break
        case 7:
            currentWeekDayString = '周日'
            break
    }
    reloadTrigger = false
}

//魔女初始化

function setUpMajo(server,majo,player){
    majo.player = player
    let name = player.name.string
    if (!findScoreHolder(server,majo.name)){
        server.runCommandSilent("/scoreboard players set "+majo.name+" Majo_Progress 0")
    }
    majo.scoreHolder = findScoreHolder(server,majo.name)
    majo.majolizeScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).get()
    majo.extraMajolizeMulti = 9*majo.majolizeScore/majo.debris+1
    majoPlayerPrefix(server,majo)
    player.tell("§2您正在扮演"+majo.color+"◆"+majo.name)
    server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+name+majo.color+'◆'+majo.name+'"}')
    if (isMajoProgressing){
        server.runCommandSilent('/hiddennames setName '+name+' name {"text":"'+majo.color+'◆'+majo.name+'"}')
        player.tell({"text":"演出已经开场了，请继续您的表演。","color":"green"})
    }
}

//魔女前修正

function majoPlayerPrefix(server,majo){
    let player = majo.player
    let name = player.name.string
    server.runCommandSilent("/attribute "+name+" minecraft:generic.scale base set "+majo.scaleMulti)
    server.runCommandSilent("/attribute "+name+" minecraft:generic.knockback_resistance base set "+majo.knockBackResistance)
    server.runCommandSilent("/gamemode survival "+name)
    server.runCommandSilent("/tag "+name+" add majo")
    player.setMaxHealth(majo.maxHealth)
    if (majo.name == "冰上梅露露"){
        server.runCommandSilent("/effect give "+name+" mocai:witchfication infinite 3 true")
        server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).set(4*majo.majolize/5+440)
    }
}

//魔女角色重置

function desetUpMajo(server,majo){
    majoPlayerAfterfix(server,majo)
    majo.majolizeScore = 0
    majo.extraMajolizeMulti = 1
    server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).reset()
    server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue).reset()
    server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure).reset()
    server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,jump).reset()
    server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,hunger).reset()
}

//魔女后修正

function majoPlayerAfterfix(server,majo){
    let player = majo.player
    let name = player.name.string
    player.setMaxHealth(20)
    server.runCommandSilent("/attribute "+name+" minecraft:generic.scale base set 1")
    server.runCommandSilent("/gamemode spectator "+name)
    server.runCommandSilent("/tag "+name+" remove majo")
    server.runCommandSilent('/hiddennames setName '+name+' reset')
    majo.player = null
}

//魔女化进程

function majolizeProgress(server){
    for (let majo of global.majoList){
        if (majo.player){
            let majoScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress)
            majo.extraMajolizeMulti = 9*majo.majolizeScore/majo.debris+1
            majoScore.add(Math.floor(basicMajolizeSpeed*majo.majolizeMulti*majo.extraMajolizeMulti))
        }
    }
}

//魔女化通知与改动

function majolizeInform(server){
    for (let majo of global.majoList){
        if (majo.player){
            let player = majo.player
            let name = player.name.string
            let oldScore = majo.majolizeScore
            let newScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).get()
            if (newScore < 0){
                newScore = 0
                server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).set(0)
            }
            let oldStage = Math.floor(5*oldScore/majo.majolize)
            let newStage = Math.floor(5*newScore/majo.majolize)
            if (oldStage > 5){oldStage = 5}
            if (newStage > 5){newStage = 5}
            let debris = majo.debris
            server.runCommandSilent("/effect clear "+name+" mocai:witchfication")
            if(newStage > 0 && newStage < 5){server.runCommandSilent("/effect give "+name+" mocai:witchfication infinite "+(newStage-1)+" true")}
            if(newStage > 4) {server.runCommandSilent("/effect give "+name+" mocai:witchfication infinite 4 false")}
            majo.majolizeScore = newScore
            if (newScore > debris){
                server.runCommandSilent("/damage "+name+" 9999 magic")
                server.runCommandSilent("/execute as "+name+" at @s run playsound minecraft:entity.wither.death voice @s ~ ~ ~ 1 1")
                for (let operator of global.operatorList){
                    let op = operator.username
                    server.runCommandSilent('/tellraw '+op
                        +' {"text":"['+majo.color+majo.name+'§e]已残骸化","color":"yellow"}')
                }
                continue
            }
            if (newStage > oldStage){
                switch (newStage){
                    case 1:
                        player.tell("§4你感到惴惴不安……")
                        break
                    case 2:
                        player.tell("§4有什么在心底滋长……")
                        break
                    case 3:
                        player.tell("§4黑暗的想法爬满了心头……")
                        break
                    case 4:
                        player.tell("§4深渊只有一步之遥……")
                        break
                    case 5:
                        player.tell("§4你已经彻底堕为魔女了……也许仍有一线生机……")
                        player.setMaxHealth(40)
                        player.stages.add("totallyMajolize")
                        server.runCommandSilent("/attribute "+name+" minecraft:generic.knockback_resistance base set 1")
                        break
                }
                server.runCommandSilent("/execute as "+name+" at @s run playsound minecraft:entity.wither.spawn voice @s ~ ~ ~ "+(0.2*newStage)+" "+(1/newStage))
                continue
            }
            if (newStage < oldStage){
                switch (oldStage){
                    case 1:
                        player.tell("§2你感到安心多了……")
                        break
                    case 2:
                        player.tell("§2心底的冲动逐渐平息……")
                        break
                    case 3:
                        player.tell("§2心头的阴霾驱散了少许……")
                        break
                    case 4:
                        player.tell("§2深渊的召唤逐渐消失了……")
                        break
                    case 5:
                        player.tell("§2你竟然真的爬出了深渊……暂时……")
                        player.setMaxHealth(majo.maxHealth)
                        player.stages.remove("totallyMajolize")
                        server.runCommandSilent("/attribute "+name+" minecraft:generic.knockback_resistance base set "+majo.knockBackResistance)
                        break
                }
                server.runCommandSilent("/execute as "+name+" at @s run playsound minecraft:block.beacon.power_select voice @s ~ ~ ~ "+(0.2*(newStage+1))+" 1")
                continue
            }
        }
    }
}

//艾玛的魔女化修正

const emaPressureInfection = 10000 //艾玛对其它人的精力影响
function emaMajolizeFix(server){
    let ema = findMajo("樱羽艾玛")
    if (!ema.player){return 0}
    let score = server.scoreboard.getOrCreatePlayerScore(ema.scoreHolder,majoProgress)
    let oldScore = score.get()
    for (let player of server.playerList.players){
        if (!isMajoPlayer(player)){continue}
        if (isMajoPlayer(player).name == "樱羽艾玛"){continue}
        let distance = player.distanceToEntity(ema.player)
        if (distance > 5){continue}
        let majo = isMajoPlayer(player)
        let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
        pressureScore.add(emaPressureInfection)
        score.add(-1)
        if (score.get() < 0){score.set(0)}
    }
    let newScore = score.get()
    if (newScore < oldScore || newScore == 0){
        ema.extraMajolizeMulti -= 0.1
        if (ema.extraMajolizeMulti < 1){ema.extraMajolizeMulti = 1}
    }
    else {
        ema.extraMajolizeMulti += 0.1
    }
}