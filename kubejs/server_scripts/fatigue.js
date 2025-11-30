// priority:3
//体力系统
let basicFatigueSpeed = 5 //基础疲劳积累速度
let basicDeFatigueSpeed = -8 //基础疲劳削减速度
let exhaustedDeFatigueSpeed = -4 //力竭后疲劳削减速度
let exhaustedPressure = 80000 //力竭压力惩罚
let waterFatigueSpeed = 5 // 在水中的额外疲劳积累速度
let jumpMulti = 50 //跳跃的额外疲劳乘数
let fatigueShaderTimePause = 20 //疲劳视野遮罩的间歇

//主进程

PlayerEvents.tick(event =>{
    if (!jump){return 0}
    let server = event.server
    let player = event.player
    let jumpCount = server.scoreboard.getOrCreatePlayerScore(findScoreHolder(server,player.name.string),jump)
    if (!isMajoProgressing){
        jumpCount.set(0)
        return 0
    }
    if (!isMajoPlayer(player)){return 0}
    let time = event.server.tickCount
    let majo = isMajoPlayer(player)
    let fatigueScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue)
    if (majo.majolizeScore > majo.majolize){fatigueScore.set(0)}
    let fatigueStage = Math.floor(8*fatigueScore.get()/majo.maxFatigue)
    if (fatigueStage> 8){
        fatigueStage = 8
    }
    let defaultSpeed = player.getDefaultMovementSpeed()
    let totalSpeedMulti = majo.speedMulti-3*(Math.max(0.01,majo.fatigueMultiFromPressure/100)-0.01)
    majo.gaspTimePause -= 1
    if (player.isEyeInFluidType("minecraft:water")){majo.gaspTimePause = 1}
    if (majo.gaspTimePause < 0){majo.gaspTimePause = 0}
    if (fatigueStage > 1 && majo.gaspTimePause == 0){
        if (time % Math.round(10*(8/fatigueStage)+10) == 0){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:entity.player.breath voice @a ~ ~ ~ 0.1 "+(1.68+Math.random()*0.04))
            majo.gaspTimePause = Math.round(7.5*(8/fatigueStage)+7.5)
            server.scheduleInTicks(Math.round(5*(8/fatigueStage)+5),() =>{
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:entity.player.breath voice @a ~ ~ ~ 0.1 "+(1.48+Math.random()*0.04))
            })
        }
    }
    if (fatigueStage > 7 && !majo.exhausted){
        player.tell("§4你实在是力竭了……")
        server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure).add(exhaustedPressure*majo.pressureMulti)
        majo.exhausted = true
    }
    if (fatigueStage > 3){
        totalSpeedMulti = majo.speedMulti*(2-1/(2*(1-fatigueScore.get()/(majo.maxFatigue+600))))-3*(Math.max(0.01,majo.fatigueMultiFromPressure/100)-0.01)
        if (majo.exhausted){
            totalSpeedMulti -= 100
        }
    }
    if (fatigueStage > 6){
        if(!majo.shadering){
            server.runCommandSilent("/shader apply "+player.name.string+" minecraft:shaders/post/blur.json")
            majo.shadering = true
            server.scheduleInTicks(fatigueShaderTimePause,event =>{
                server.runCommandSilent("/shader remove "+player.name.string)
                majo.shadering = false
            })
        }
    }
    let sporting = false
    if (player.sprinting && !majo.faint){
        player.setMovementSpeedAddition(totalSpeedMulti)
        fatigueScore.add(Math.ceil(basicFatigueSpeed*majo.fatigueMulti*majo.fatigueMultiFromPressure))
        majo.extraFoodNeedFromSporting = player.totalMovementSpeed/player.defaultMovementSpeed
        sporting = true
    }
    else {
        player.setMovementSpeedAddition(Math.min(0,0.3*defaultSpeed+totalSpeedMulti))
    }
    if (jumpCount.get() > 0 && !majo.faint){
        fatigueScore.add(Math.ceil(basicFatigueSpeed*majo.fatigueMulti*jumpMulti*majo.fatigueMultiFromPressure))
        majo.extraFoodNeedFromSporting = jumpMulti*player.totalMovementSpeed/player.defaultMovementSpeed
        jumpCount.set(0)
        sporting = true
    }
    if (player.isInFluidType("minecraft:water") && !majo.faint){
        fatigueScore.add(Math.ceil(waterFatigueSpeed*majo.fatigueMulti*majo.fatigueMultiFromPressure))
    }
    if (majo.exhausted && !majo.faint){
        if (fatigueScore.get() > majo.maxFatigue){fatigueScore.set(majo.maxFatigue)}
        fatigueScore.add(Math.ceil(exhaustedDeFatigueSpeed/(majo.fatigueMulti*majo.fatigueMultiFromPressure)))
        server.runCommandSilent("/effect give "+player.name.string+" minecraft:blindness 2 0 true")
        if (fatigueStage < 7){
            majo.exhausted = false
        }
        return 0
    }
    if (!sporting && !majo.faint){
        fatigueScore.add(Math.ceil(basicDeFatigueSpeed/(majo.fatigueMulti*majo.fatigueMultiFromPressure)))
        majo.extraFoodNeedFromSporting = 1
        if (fatigueScore.get() < 0){
            fatigueScore.set(0)
        }
    }
})


