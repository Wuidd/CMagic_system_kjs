// priority:5

let sleepBoost = 4 //睡眠时的恢复乘数

//在指定方块上休息

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let level = event.level
    let block = null
    if (player.mainSupportingBlockPos.isPresent()){block = level.getBlock(player.mainSupportingBlockPos.get())}
    else {block = level.getBlock(player.blockPosition())}
    if (block.getId() == "minecraft:air"){return 0}
    let server = event.server
    let majo = isMajoPlayer(player)
    if (majo.majolizeScore > majo.majolize){return 0}
    let sleepMulti = 1
    if (player.sleeping){sleepMulti = sleepBoost}
    let fatigueScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue)
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    for (let restableBlock of Object.keys(global.restableBlockList)){
        if (block.getId() == restableBlock) {
            pressureScore.add(Math.ceil(-global.restableBlockList[restableBlock]*sleepMulti/majo.pressureMulti))
            fatigueScore.add(Math.ceil(-global.restableBlockList[restableBlock]*sleepMulti/(5*majo.fatigueMulti)))
            if (fatigueScore.get() < 0){
                fatigueScore.set(0)
            }
            if (pressureScore.get() < 0){
                pressureScore.set(0)
            }
            return 1
        }
    }
    for (let restableBlockTag of Object.keys(global.restableBlockTagList)){
        if (block.hasTag(restableBlockTag)) {
            pressureScore.add(Math.ceil(-global.restableBlockTagList[restableBlockTag]*sleepMulti/majo.pressureMulti))
            fatigueScore.add(Math.ceil(-global.restableBlockTagList[restableBlockTag]*sleepMulti/(5*majo.fatigueMulti)))
            if (fatigueScore.get() < 0){
                fatigueScore.set(0)
            }
            if (pressureScore.get() < 0){
                pressureScore.set(0)
            }
            return 1
        }
    }
})