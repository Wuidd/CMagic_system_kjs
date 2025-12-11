// priority:11
//环境信息

const dayTicksInOneDay = 24000 //一天的天刻数
const dayTicksInOneHour = dayTicksInOneDay/24
const dayTicksInOneMin = dayTicksInOneDay/1440
const dayTicksInOneSec = dayTicksInOneDay/86400
const dayTicksEqualToRealisticTicks = 86400*20/dayTicksInOneDay
const baseLogTimePause = 20 //最少的日志更新间歇
const totalLogUpLim = 500 //全日志的最大数量
const memorableLogUpLim = 100 //可记日志的最大数量
const envHintPlayTimePause = 30 //环境文本的播放间歇
const envHintLength = 25 //环境文本的播放长度

const startHourInOneDay = 6 //日出时的小时数
let currentDay = 0 //当前日
let oldDay = -1 //旧日时间戳
let currentWeekDay = 0
let currentWeekDayString = '' //当前为星期中的哪一日
let currentDayHour = 0 //现在的小时数
let oldDayHour = -1 //旧小时时间戳
let currentDayMin = 0  //现在的分钟数
let oldDayMin = 0 //旧分钟时间戳
let currentDaySec = 0 //现在的秒数

let dayTickPause = 0 //流逝间歇
const dayTickPauseInDay = 3 //白天流逝时间间隔刻
const dayTickPauseInNight = 1 //夜晚流逝时间间隔刻
const serverTicksInOneDay = 12000*(dayTickPauseInDay+1+dayTickPauseInNight+1)
let timeSpeedMulti = 1 //流速倍率

//接管时间控制
ServerEvents.tick(event =>{
    let server = event.server
    let level = server.getLevel("minecraft:overworld")
    let time = level.dayTime()
    if (!isMajoProgressing){return 0}
    if (isFocusMode){
        if (dayTickPause <= 0){
            dayTickPause = dayTicksEqualToRealisticTicks
            level.setDayTime(time+1)
        }
        else {
            dayTickPause -= 1
        }
    }
    else if (level.isNight()){
        if (dayTickPause <= 0){
            dayTickPause = dayTickPauseInNight
            if (time > 13000 && time < 23200){
                level.setDayTime(time+1*timeSpeedMulti)
            }
            else {
                level.setDayTime(time+1)
            }
        }
        else {
            dayTickPause -= 1
        }
    }
    else {
        if (dayTickPause <= 0){
            dayTickPause = dayTickPauseInDay
            level.setDayTime(time+1)
        }
        else {
            dayTickPause -= 1
        }
    }
})

//计时
ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let server = event.server
    let level = server.getLevel("overworld")
    currentDayHour = Math.floor(level.dayTime()/dayTicksInOneHour)+startHourInOneDay
    currentDayMin = Math.floor((level.dayTime()-(currentDayHour-startHourInOneDay)*dayTicksInOneHour)/dayTicksInOneMin)
    server.runCommandSilent("/execute store result score day Days run time query day")
    if (weekdays){
        currentWeekDay = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly("day"),weekdays).get()
    }
    if (currentDayHour >= 24){
        currentDayHour = currentDayHour % 24
    }
    if (currentDayMin == 0 && currentDayMin != oldDayMin){
        for (let player of server.playerList.players){
            player.tell({"text":"钟声敲响，现在是"+currentDayHour+":00","color":"yellow"})
        }
        if (currentDayHour == 6 || currentDayHour == 22){
            server.runCommandSilent("/execute as @a at @s run playsound sound_effect:church_bell_2 voice @s")
        }
    }
    if (weekdays && oldDay >= 0 && oldDayHour >= 0){
        let shouldChangeDay = false
        if (currentDayHour < 6){
            if (currentDayHour < oldDayHour){
                shouldChangeDay = true
                currentDay += 1
            }
        }
        else {
            currentDay = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly("day"),days).get()
            if (currentDay > oldDay){
                shouldChangeDay = true
            }
        }
        if (shouldChangeDay){
            let weekDay = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly("day"),weekdays)
            weekDay.add(1)
            if (weekDay.get() > 7){
                weekDay.set(1)
            }
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
        }
    }
    oldDay = currentDay
    oldDayHour = currentDayHour
    oldDayMin = currentDayMin
})

//睡眠时加速

ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isFocusMode){
        timeSpeedMulti = 1
        return 0
    }
    let level = event.server.getLevel("overworld")
    if (level.day){return 0}
    let time = level.dayTime()
    if (time <= 13000 && time >= 23200){
        timeSpeedMulti = 1
        return 0
    }
    for (let majo of global.majoList){
        let player = majo.player
        if (majo.player){
            if (!player.isSleeping()){
                timeSpeedMulti = 1
                return 0
            }
            timeSpeedMulti = 20
        }
    }
})

//为旁观者报时
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (isJudging){return 0}
    if (event.player.isSpectator()){
        let fixHour = numberToStringWithPreZero(currentDayHour,2)
        let fixMin = numberToStringWithPreZero(currentDayMin,2)
        event.server.runCommandSilent('/title '+event.player.name.string+' actionbar {"text":"「时间」'+fixHour+':'+fixMin+' '+currentWeekDayString+'"}')
    }
})

//角色日志生成
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    if (majo.logTimePause){
        majo.logTimePause -= 1
        return 0
    }
    else {
        majo.logTimePause = baseLogTimePause+Math.round(Math.random()*baseLogTimePause)
    }
    let structure = inStructure(player)
    if (!structure){return 0}
    let memorableStructure = inMemorableSturcture(player)
    if (!majo.totalLog.length){
        majo.totalLog.push(getActionLog(structure))
    }
    else {
        let latestTotalLog = majo.totalLog[majo.totalLog.length-1]
        if (structure.name == latestTotalLog["structure"].name){
            if (currentWeekDay != latestTotalLog["weekDay"]){
                majo.totalLog[majo.totalLog.length-1]["endHour"] = 23
                majo.totalLog[majo.totalLog.length-1]["endMin"] = 59
                let newerLog = getActionLog(structure)
                newerLog["beginHour"] = 0
                newerLog["beginMin"] = 0
                majo.totalLog.push(newerLog)
            }
            else {
                if (currentDayHour == latestTotalLog["endHour"] && currentDayMin == latestTotalLog["endMin"]){
                }
                else {
                    majo.totalLog[majo.totalLog.length-1]["endHour"] = currentDayHour
                    majo.totalLog[majo.totalLog.length-1]["endMin"] = currentDayMin
                }
            }
        }
        else {
            majo.totalLog.push(getActionLog(structure))
        }
        if (majo.totalLog.length > totalLogUpLim){
            majo.totalLog.splice(0,1)
        }
    }
    if (!memorableStructure){return 0}
    if (!majo.memorableLog.length){
        majo.memorableLog.push(getActionLog(memorableStructure))
    }
    else {
        let latestMemorableLog = majo.memorableLog[majo.memorableLog.length-1]
        if (memorableStructure.name == latestMemorableLog["structure"].name){
            if (currentWeekDay != latestMemorableLog["weekDay"]){
                majo.memorableLog[majo.memorableLog.length-1]["endHour"] = 23
                majo.memorableLog[majo.memorableLog.length-1]["endMin"] = 59
                let newerLog = getActionLog(memorableStructure)
                newerLog["beginHour"] = 0
                newerLog["beginMin"] = 0
                majo.memorableLog.push(newerLog)
            }
            else {
                if (currentDayHour == latestMemorableLog["endHour"] && currentDayMin == latestMemorableLog["endMin"]){
                }
                else {
                    majo.memorableLog[majo.memorableLog.length-1]["endHour"] = currentDayHour
                    majo.memorableLog[majo.memorableLog.length-1]["endMin"] = currentDayMin
                }
            }
        }
        else {
            majo.memorableLog.push(getActionLog(memorableStructure))
        }
        if (majo.memorableLog.length > memorableLogUpLim){
            majo.memorableLog.splice(0,1)
        }
    }
})

//判断角色是否在户外
PlayerEvents.tick(event =>{
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let level = player.level.name.string
    let pos = vecToArr(player.position())
    for (let checkPoint of global.checkPointOutDoors){
        let area = checkPoint.area
        if (level != checkPoint.level){continue}
        for (let cube of area){
            let startApex = cube[0]
            let endApex = cube[1]
            if (startApex[0] <= pos[0] && startApex[1] <= pos[1] && startApex[2] <= pos[2] &&
                endApex[0] >= pos[0] && endApex[1] >= pos[1] && endApex[2] >= pos[2]){
                if (!player.stages.has("inCheckPoint")){
                    if (player.stages.has("outDoors")){
                        player.stages.remove("outDoors")
                    }
                    else {
                        player.stages.add("outDoors")
                    }
                    player.stages.add("inCheckPoint")
                }
                return 1
            }
        }
    }
    player.stages.remove("inCheckPoint")
})

//清晨-牢房 Time=23460
ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let server = event.server
    let level = server.getLevel("minecraft:overworld")
    let dayTime = level.dayTime()
    if (dayTime < 23459 || dayTime > 23461){return 0}
    let players = findPlayersInStructure("牢房",server)
    switch (dayTime){
        case 23459:
            for (let p of players){
                if (!isMajoPlayer(p)){continue}
                if (p.isSleeping()){p.stages.add("sleepToMorning")}
                else {p.stages.remove("sleepToMorning")}
            }
            break
        case 23460:
            for (let p of players){
                let majo = isMajoPlayer(p)
                if (!majo){continue}
                if (p.stages.has("sleepToMorning") && !p.stages.has("morningTextPushed")){
                    let hint
                    if (Math.floor(5*majo.majolizeScore/majo.majolize) < 4 || majo.majolizeMulti == 0){
                        hint = global.wakeUpText[Math.floor(Math.random()*global.wakeUpText.length)]
                    }
                    else {
                        hint = global.wakeUpMajolizeText[Math.floor(Math.random()*global.wakeUpMajolizeText.length)]
                    }
                    let hintCopy = new EnvHint(hint.text,hint.color)
                    majo.envHintBox.push(hintCopy)
                    p.stages.add("morningTextPushed")
                }
                else if (!p.stages.has("morningTextPushed")){
                    let hint
                    if (Math.floor(5*majo.majolizeScore/majo.majolize) < 4 || majo.majolizeMulti == 0){
                        hint = global.insomniaText[Math.floor(Math.random()*global.insomniaText.length)]
                    }
                    else {
                        hint = global.insomniaMajolizeText[Math.floor(Math.random()*global.insomniaMajolizeText.length)]
                    }
                    let hintCopy = new EnvHint(hint.text,hint.color)
                    majo.envHintBox.push(hintCopy)
                    p.stages.add("morningTextPushed")
                }
            }
            break
        case 23461:
            for (let p of server.playerList.players){
                p.stages.remove("morningTextPushed")
                p.stages.remove("sleepToMorning")
            }
            break
    }
})

//宵禁 Time=16000
ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let server = event.server
    let level = server.getLevel("minecraft:overworld")
    let dayTime = level.dayTime()
    if (dayTime < 16000 || dayTime > 16001){return 0}
    let playersInJail = findPlayersInStructure("牢房",server)
    let playersOutDoors = []
    for (let player of server.playerList.players){
        if (player.stages.has("outDoors") && !player.stages.has("curfewTextPushed")){
            playersOutDoors.push(player)
        }
    }
    switch (dayTime){
        case 16000:
            for (let p of playersInJail){
                if (!p.stages.has("curfewTextPushed")){
                    let majo = isMajoPlayer(p)
                    if (!majo){continue}
                    let hint
                    if (Math.floor(5*majo.majolizeScore/majo.majolize) < 4 || majo.majolizeMulti == 0){
                        hint = global.curfewText[Math.floor(Math.random()*global.curfewText.length)]
                    }
                    else {
                        hint = global.curfewMajolizeText[Math.floor(Math.random()*global.curfewMajolizeText.length)]
                    }
                    let hintCopy = new EnvHint(hint.text,hint.color)
                    majo.envHintBox.push(hintCopy)
                    p.stages.add("curfewTextPushed")
                }
            }
            for (let p of playersOutDoors){
                if (!p.stages.has("curfewTextPushed")){
                    let majo = isMajoPlayer(p)
                    let hint = global.stayOutText[Math.floor(Math.random()*global.stayOutText.length)]
                    let hintCopy = new EnvHint(hint.text,hint.color)
                    majo.envHintBox.push(hintCopy)
                    player.stages.add("curfewTextPushed")
                }
            }
            break
        case 16001:
            for (let p of server.playerList.players){
                p.stages.remove("curfewTextPushed")
            }
            break
    }
})

//环境文本播放器
PlayerEvents.tick(event =>{
    let player = event.player
    if (player.stages.has("envHintPlayTimePause")){return 0}
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    if (!majo.envHintBox.length){return 0}
    let server = event.server
    let hint = majo.envHintBox[0]
    if (hint.text.length <= envHintLength){
        player.tell({"text":hint.text,"color":hint.color})
        player.stages.add("envHintPlayTimePause")
        majo.envHintBox.splice(0,1)
        server.scheduleInTicks(envHintPlayTimePause,event =>{
            player.stages.remove("envHintPlayTimePause")
        })
    }
    else {
        player.tell({"text":hint.text.slice(0,envHintLength),"color":hint.color})
        player.stages.add("envHintPlayTimePause")
        majo.envHintBox[0].text = hint.text.slice(envHintLength)
        server.scheduleInTicks(envHintPlayTimePause,event =>{
            player.stages.remove("envHintPlayTimePause")
        })
    }
})

//单条日志生成
function getActionLog(structure){
    return {
        "beginHour":currentDayHour,
        "beginMin":currentDayMin,
        "endHour":currentDayHour,
        "endMin":currentDayMin,
        "weekDay":currentWeekDay,
        "weekDayString":currentWeekDayString,
        "structure":structure,
    }
}

//将大于1的数字转换为至少指定位数的字符，如果不够长，在前面补0
function numberToStringWithPreZero(number,digitcount){
    if (number < 1){
        return String((digitcount-1)*"0"+number.toString())
    }
    if (number < Math.pow(10,digitcount-1)){
        let fixNumber = number.toString()
        for (let i=0;i<digitcount-1;i++){
            fixNumber = '0'+number
        }
        return String(fixNumber)
    }
    return String(number)
}

//环境文本
function EnvHint(text,color){
    this.text = text
    this.color = color
}