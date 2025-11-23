// priority:4

//精力系统
let basicPressureSpeed = 2 //基础压力积累速度
let extraPressure = 100 //交互时的额外精力消耗
let maxMWPossibility = 0.1 //最大走神可能性
let maxDropPossibility = 0.0001 //最大每刻脱手可能性
let maxSleepyPossibility = 0.0003 //最大每刻困倦可能性
let faintMajolize = 500 //昏迷惩罚
let faintRecovery = -50 //昏迷时的恢复速度
let noPressureCostItem = ["mocai:margo_tarot","minecraft:clock","minecraft:air","mocai:hannafan"] //无须消耗精力互动的物品

//主进程

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    let majo = isMajoPlayer(player)
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    let fatigueScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue)
    if (majo.majolizeScore > majo.majolize){pressureScore.set(0)}
    if (pressureScore.get() < 0){
        pressureScore.set(0)
    }
    if (majo.faint){
        let pos = majo.pos
        if (!majo.carrior){
            server.runCommandSilent("/tp "+player.name.string+" "+pos[0]+" "+pos[1]+" "+pos[2])
            server.runCommandSilent("/ysm play "+player.name.string+" climbing")
        }
        else {
            majo.pos = vecToArr(player.position())
        }
        player.setSelectedSlot(majo.selectedSlot)
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 2 0 true")
        pressureScore.add(Math.ceil(faintRecovery/majo.pressureMulti))
        fatigueScore.add(Math.ceil(faintRecovery/(5*majo.fatigueMulti)))
        if (fatigueScore.get() < 0){
            fatigueScore.set(0)
        }
        if (pressureScore.get() < 0){
            pressureScore.set(0)
        }
        if (pressureScore.get() == 0){
            server.runCommandSilent("/ysm play "+player.name.string+" empty")
            majo.fatigueMultiFromPressure = 1
            majo.faint = false
        }
        return 1
    }
    if(!player.isSleeping()){pressureScore.add(Math.ceil(basicPressureSpeed*majo.pressureMulti))}
    majo.fatigueMultiFromPressure = Math.max(1,2*pressureScore.get()/majo.maxPressure)
    if (pressureScore.get() > majo.maxPressure && !majo.faint){
        majo.faint = true
        player.tell("§4你累得昏过去了……")
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.beacon.deactivate voice @s ~ ~ ~ 1 0.1")
        server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).add(faintMajolize*majo.majolizeMulti*majo.extraMajolizeMulti)
        majo.fatigueMultiFromPressure = 10000
        majo.selectedSlot = player.selectedSlot
        majo.pos = vecToArr(player.position())
    }
})

//焦点模式下的昏迷事件

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (!isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    let majo = isMajoPlayer(player)
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    if (majo.faint){
        let pos = majo.pos
        if (!majo.carrior){
            server.runCommandSilent("/tp "+player.name.string+" "+pos[0]+" "+pos[1]+" "+pos[2])
            server.runCommandSilent("/ysm play "+player.name.string+" climbing")
        }
        else {
            majo.pos = vecToArr(player.position())
        }
        player.setSelectedSlot(majo.selectedSlot)
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 2 0 true")
        return 1
    }
    if (pressureScore.get() > majo.maxPressure && !majo.faint){
        majo.faint = true
        player.tell("§4你累得昏过去了……")
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.beacon.deactivate voice @s ~ ~ ~ 1 0.1")
        server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,majoProgress).add(faintMajolize*majo.majolizeMulti*majo.extraMajolizeMulti)
        majo.fatigueMultiFromPressure = 10000
        majo.selectedSlot = player.selectedSlot
        majo.pos = vecToArr(player.position())
    }
})

//走神事件与额外精力消耗

EntityEvents.beforeHurt(event =>{
    if (!isMajoProgressing){return 0}
    if (!event.source.player){return 0}
    let player = event.source.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.faint){
        event.setDamage(0) 
        return 0
    }
    if (isFocusMode){return 0}
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    pressureScore.add(extraPressure*majo.pressureMulti)
    if (Math.random() < maxMWPossibility*Math.max(0,(2*pressureScore.get()/majo.maxPressure-1))){
        event.setDamage(0)
        if (!majo.faint){MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))}
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 1 0 true")
    }
})

ItemEvents.entityInteracted(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.faint){event.cancel()}
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    pressureScore.add(extraPressure*majo.pressureMulti)
    if (Math.random() < maxMWPossibility*Math.max(0,(2*pressureScore.get()/majo.maxPressure-1))){
        if(!majo.faint){MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))}
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 1 0 true")
        event.cancel()
    }
})

ItemEvents.rightClicked(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let item = event.item
    let majo = isMajoPlayer(player)
    if (majo.faint){event.cancel()}
    for (let noCost of noPressureCostItem){
        if (item.is(noCost)){return 0}
    }
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    pressureScore.add(extraPressure*majo.pressureMulti)
    if (Math.random() < maxMWPossibility*Math.max(0,(2*pressureScore.get()/majo.maxPressure-1))){
        if(!majo.faint){MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))}
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 1 0 true")
        event.cancel()
    }
})

BlockEvents.rightClicked(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.faint){event.cancel()}
    let block = event.block
    for (let ignoreBlock of global.ignoreMWEventBlockList){
        if (block.getId() == ignoreBlock){return 0} 
    }
    for (let ignoreBlockTag of global.ignoreMWEventBlockTagList){
        if (block.hasTag(ignoreBlockTag)){return 0}
    }
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    pressureScore.add(extraPressure*majo.pressureMulti)
    if (Math.random() < maxMWPossibility*Math.max(0,(2*pressureScore.get()/majo.maxPressure-1))){
        if(!majo.faint){MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))}
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 1 0 true")
        event.cancel()
    }
})

//物品脱手

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    if (player.sleeping){return 0}
    let item = player.getMainHandItem()
    let itemOffHand = player.getOffHandItem()
    let majo = isMajoPlayer(player)
    if ((item.is("minecraft:air") && itemOffHand.is("minecraft:air")) || (item.is(majo.token) && itemOffHand.is(majo.token))){return 0}
    if (majo.faint){return 0}
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    if (pressureScore.get()/majo.maxPressure < 0.5){return 0}
    if (Math.random() < maxDropPossibility*Math.exp((pressureScore.get()-majo.maxPressure)/majo.maxPressure)){
        if(!item.is(majo.token)){
            player.drop(item,false,false)
            player.setMainHandItem("air")
        }
        if(!itemOffHand.is(majo.token)){
            player.drop(itemOffHand,false,false)
            player.setOffHandItem("air")
        }
        MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))
        player.tell("§4拿着的东西脱手了……")
    }
})

//困倦

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    if (player.sleeping){return 0}
    let majo = isMajoPlayer(player)
    if (majo.faint){return 0}
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    if (pressureScore.get()/majo.maxPressure < 0.5){return 0}
    if (Math.random() < maxSleepyPossibility*Math.exp((pressureScore.get()-majo.maxPressure)/majo.maxPressure)){
        player.potionEffects.add("minecraft:darkness",100,0,true,true)
        MWInform(player,Math.ceil(6*pressureScore.get()/majo.maxPressure))
    }
})

//走神提示

function MWInform(player,num){
    let MWWords = null
    if (num > 6){num = 6}
    switch(num){
        case 1:
        case 2:
        case 3:
            MWWords = MWWordsStage1
            break
        case 4:
        case 5:
            MWWords = MWWordsStage2
            break
        case 6:
            MWWords = MWWordsStage3
            break
    }
    player.tell(MWWords[Math.floor(Math.random()*MWWords.length)])
}

//走神词库

let MWWordsStage1 = ["§e……走神了……？","§e欸……刚刚……","§e什么……？","§e感觉有点不清醒……"]
let MWWordsStage2 = ["§e有点犯困……","§e啊……啊……？","§e专注不了……","§e欸……？突然去想了别的事情……"]
let MWWordsStage3 = ["§4好困……","§4睁不开眼了……","§4要睡着了……","§4得……想办法休息一下……"]

//昏迷词库

let faintWords = ["呃……唔……","唔……","唔嗯……","唔唔……","哼呜……"]