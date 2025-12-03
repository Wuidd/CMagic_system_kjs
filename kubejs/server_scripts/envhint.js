// priority:11
//环境信息

const dayTicksInOneDay = 24000 //一天的天刻数
const dayTicksInOneHour = dayTicksInOneDay/24
const dayTicksInOneMin = dayTicksInOneDay/1440
const dayTicksInOneSec = dayTicksInOneDay/86400
const dayTicksEqualToRealisticTicks = 86400*20/dayTicksInOneDay
const dayTicksEqualToServerTicks = 72000/dayTicksInOneDay
let noticeTimePauseForMin
const baseLogTimePause = 20 //最少的日志更新间歇
const envHintPlayTimePause = 30 //环境文本的播放间歇
const envHintLength = 25 //环境文本的播放长度

const startHourInOneDay = 6 //日出时的小时数
let currentWeekDay = 0
let currentWeekDayString = '' //当前为星期中的哪一日
let currentDayHour = 0 //现在的小时数
let oldDayHour = -1 //上一个小时时间戳
let currentDayMin = 0  //现在的分钟数
let currentDaySec = 0 //现在的秒数
let clockNotice = false //防止重复报时
let dayNotice = false //防止重复计日

//计时
ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (!isFocusMode){
        noticeTimePauseForMin = Math.round(dayTicksInOneMin*dayTicksEqualToServerTicks)
    }
    else {
        noticeTimePauseForMin = Math.round(dayTicksInOneMin*dayTicksEqualToRealisticTicks)
    }
    let server = event.server
    let level = server.getLevel("overworld")
    currentDayHour = Math.floor(level.dayTime()/dayTicksInOneHour)+startHourInOneDay
    currentDayMin = Math.floor((level.dayTime()-(currentDayHour-startHourInOneDay)*dayTicksInOneHour)/dayTicksInOneMin)
    if (currentDayHour >= 24){
        currentDayHour = currentDayHour % 24
    }
    if (level.dayTime() % Math.round(dayTicksInOneHour) == 0 && !clockNotice){
        for (let player of server.playerList.players){
            player.tell({"text":"钟声敲响，现在是"+currentDayHour+":00","color":"yellow"})
        }
        clockNotice = true
        server.scheduleInTicks(noticeTimePauseForMin,event =>{
            clockNotice = false
        })
    }
    if (day && weekdays && currentDayHour < oldDayHour && !dayNotice){
        dayNotice = true
        let weekDay = server.scoreboard.getOrCreatePlayerScore(day,weekdays)
        weekDay.add(1)
        if (weekDay.get() > 7){
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
        server.scheduleInTicks(noticeTimePauseForMin,event =>{
            dayNotice = false
        })
    }
    oldDayHour = currentDayHour
})

//焦点模式的计时
ServerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    if (!isFocusMode){return 0}
    let server = event.server
    let time = server.tickCount
    if (time % Math.ceil(dayTicksEqualToRealisticTicks) == 0){
        server.runCommandSilent("/time add 1")
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
                let server = event.server
                server.scheduleInTicks(2,event =>{
                    if (inSpecificStructure(player,checkPoint.inside.name)){
                        player.stages.remove("outDoors")
                    }
                    else {
                        player.stages.add("outDoors")
                    }
                })
                return 1
            }
        }
    }
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