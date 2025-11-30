// priority:5

let sleepBoost = 2 //睡眠时的恢复乘数

//在指定方块上休息

PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let level = event.level
    let block = null
    let pos = vecToArr(player.position())
    let restValue = 0
    for (let i=-1;i<2;i++){
        if (!restValue){
            block = level.getBlock(pos[0],pos[1]+i,pos[2])
            for (let restableBlock of Object.keys(global.restableBlockList)){
                if (block.getId() == restableBlock){
                    restValue = -global.restableBlockList[restableBlock]
                    break
                }
            }
            if (!restValue){
                for (let restableBlockTag of Object.keys(global.restableBlockTagList)){
                    if (block.hasTag(restableBlockTag)){
                        restValue = -global.restableBlockTagList[restableBlockTag]
                        break
                    }
                }
            }
        }
        else {
            break
        }
    }
    if (!restValue){return 0}
    let server = event.server
    let majo = isMajoPlayer(player)
    if (majo.majolizeScore > majo.majolize){return 0}
    let sleepMulti = 1
    if (player.sleeping){sleepMulti = sleepBoost}
    let fatigueScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue)
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    pressureScore.add(Math.ceil(restValue*sleepMulti*Math.max(1,Math.min(3,6*pressureScore.get()/majo.maxPressure-1))/majo.pressureMulti))
    fatigueScore.add(Math.ceil(restValue*sleepMulti/(5*majo.fatigueMulti)))
    if (fatigueScore.get() < 0){
        fatigueScore.set(0)
    }
    if (pressureScore.get() < 0){
        pressureScore.set(0)
    }
    if (majo.majolizeFromFaint > 0){
        majo.majolizeFromFaint = majo.majolizeFromFaint-0.025*restValue
    }
})