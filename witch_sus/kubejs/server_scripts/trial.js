// priority:10
//庭审机制

let isJudging = false //开关

let defaultMaxTrialRounds = 4 //默认的审判轮数
let setMaxTrialRounds = 0 //设定的审判轮数
let defaultStartTrialRound = 1 //默认的审判起始轮
let currentTrialRound = 1 //当前的审判起始轮
let defaultRoundTime = 30000 //默认的每轮时间
let defaultSpeechTime = 3000 //默认的每段发言时间
let defaultPrepareTime = 4800 //默认的首轮准备时间
let setRoundTime = 30000 //设定的当前轮时间
let setSpeechTime = 3000 //设定的当前发言时间
let currentRoundTime = 0 //当前轮已用时间
let currentSpeechTime = 0 //当前发言已用时间
let roundRepeated = true //当前轮是否为重复轮
let closingOpenState = false //是否已设置结束发言

let candidates = 0 //审判参与者
let currentParticipants = 0 //现有的参与者
let participantsSynsMaxTimeOut = 600 //失去同步的最大时间
let participantsSynsTimeOut = 0 //失去同步时间
let participantsSyns = true //人数是否符合

let currentSpeecher = [] //发言人
let currentSpeecherForced = [] //强制发言人
let waitingSpeecher = [] //等待发言人
let beginningSpeecher = [] //仅在第一轮使用的强制轮询名单
let maxSoloTimes = 3 //最大允许连续单人发言次数
let soloTimes = 0 //连续单人发言次数

let approve = 0 //赞成票
let disapprove = 0 //反对票

let musicTime = 100 //歌曲计时器
let normalMusic = {"mocai_music:trial_asking":6420,"mocai_music:trial_chossing":6460,"mocai_music:trial_thinking":2080} //普通轮歌曲
let crucialMusic = {"mocai_music:trial_asking_final":8220,"mocai_music:trial_defensing":4760,"mocai_music:trial_defensing_determination":4740} //关键轮歌曲
let breakInMusic = {"mocai_music:character_ema_breaking":5300,"mocai_music:character_hiro_breaking":6340,"mocai_music:trial_asking_final":8220} //打断歌曲

//启用审判
ItemEvents.rightClicked('yuushya:button_sign_notice',event =>{
    let item = event.item
    let player = event.player
    let server = event.server
    if (item.customData.getBoolean("OperatorTool")){
        if (!isMajoProgressing){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.tell({"text":"演出还未开始，无法开启审判。","color":"yellow"})
            player.addItemCooldown('yuushya:button_sign_notice',20)
            return 0
        }
        if (!isJudging){
            isFocusMode = true
            isJudging = true
            roundRepeated = true
            setMaxTrialRounds = defaultMaxTrialRounds
            currentTrialRound = defaultStartTrialRound
            currentRoundTime = 0
            currentSpeechTime = 0
            candidates = 0
            soloTimes = 0
            currentSpeecher = []
            currentSpeecherForced = []
            waitingSpeecher = []
            beginningSpeecher = []
            let randomMajoList = shuffleArray(global.majoList)
            beginningSpeecher.push("OPEN")
            currentSpeecherForced.push("PREPARE")
            for (let majo of randomMajoList){
                if (majo.player){
                    candidates ++
                    beginningSpeecher.push(majo)
                    majo.player.stages.add("joinTrial")
                }
            }
            resetVote()
            server.runCommandSilent('/title @a title {"text":"⚖审判开始⚖","color":"red","bold":true}')
            server.runCommandSilent("/stopsound @a weather")
            server.runCommandSilent("/execute as @a at @s run playsound mocai_music:trial_beginning weather @s")
            musicTime = 4800
            server.scheduleInTicks(60,event =>{
            for (let player of server.playerList.players){
                if (isMajoPlayer(player)){
                    player.tell({"text":"审判开始了……先静下心来整理思路吧……","color":"yellow"})
                    player.tell({"text":"四分钟后，讨论将正式开始。","color":"yellow"})
                }
                else if (isOperator(player)){
                    player.tell({"text":"审判开始了。焦点模式已自动启用。","color":"yellow"})
                }
                else {
                    player.tell({"text":"审判开始了……","color":"yellow"})
                }
            }
        })
        }
        else{
            isJudging = false
            resetVote()
            server.runCommandSilent('/title @a title {"text":"⚖审判终了⚖","color":"red","bold":true}')
            server.runCommandSilent("/stopsound @a weather")
            server.runCommandSilent("/execute as @a at @s run playsound sound_effect:church_bell_2 weather @s")
            for (let player of server.playerList.players){
                if (isOperator(player)){
                    player.tell({"text":"审判结束了。请注意此时仍处于焦点模式。 ","color":"yellow"})
                }
                else {
                    player.tell({"text":"审判结束了……","color":"yellow"})
                }
            }
        }
        player.addItemCooldown('yuushya:button_sign_notice',20)
    }
})

//轮数加减
ItemEvents.rightClicked('yuushya:button_sign_true',event =>{
    let item = event.item
    let player = event.player
    let server = event.server
    if (item.customData.getBoolean("OperatorTool")){
        if (!isJudging){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.tell({"text":"审判还未开始，无法调整轮数。","color":"yellow"})
        }
        else {
            setMaxTrialRounds ++
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
            player.tell({"text":"审判轮数+1，总计"+setMaxTrialRounds+"轮","color":"green"})
        }
        player.addItemCooldown('yuushya:button_sign_true',20)
    }
})

ItemEvents.rightClicked('yuushya:button_sign_false',event =>{
    let item = event.item
    let player = event.player
    let server = event.server
    if (item.customData.getBoolean("OperatorTool")){
        if (!isJudging){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.tell({"text":"审判还未开始，无法调整轮数。","color":"yellow"})
        }
        else {
            if (currentTrialRound < setMaxTrialRounds && setMaxTrialRounds > 2){
                setMaxTrialRounds --
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                player.tell({"text":"审判轮数-1，总计"+setMaxTrialRounds+"轮","color":"yellow"})
            }
            else {
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                player.tell({"text":"无法将审判轮数减少到当前轮数以下或2轮以下。","color":"yellow"})
            }
        }
        player.addItemCooldown('yuushya:button_sign_false',20)
    }
})

//跳过时段
ItemEvents.rightClicked('yuushya:button_sign_question',event =>{
    let item = event.item
    let player = event.player
    let server = event.server
    if (item.customData.getBoolean("OperatorTool")){
        if (!isJudging){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.tell({"text":"审判还未开始，无法跳过时段。","color":"yellow"})
        }
        else {
            player.tell({"text":"跳过了当前时段。","color":"green"})
            currentRoundTime += setSpeechTime-currentSpeechTime
            currentSpeechTime = setSpeechTime
        }
        player.addItemCooldown('yuushya:button_sign_question',20)
        for (let majo of global.majoList){
            if (majo.player){
                player.cooldowns.removeCooldown("yuushya:button_sign_notice")
                player.cooldowns.removeCooldown("yuushya:button_sign_bookmark")
            }
        }
    }
})

//玩家操作
//结束发言
ItemEvents.rightClicked("yuushya:button_sign_play",event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let item = event.item
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    if (item.customData.getBoolean("PlayerTrialTool")){
        let finded = false
        if (currentSpeecher.length == 1){
            if (currentSpeecher[0].player.name.string == player.name.string){
                finded = true
            }
        }
        if (currentSpeecherForced.length == 1){
            if (currentSpeecherForced[0] == "PREPARE" || currentSpeecherForced[0] == "OPEN"){
                finded = false
            }
            else if (currentSpeecherForced[0].player.name.string == player.name.string){
                finded = true
            }
        }
        if (finded){
            currentSpeechTime = setSpeechTime
        }
        else {
            player.tell({"text":"现在无法结束发言。","color":"yellow"})
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
        }
        player.addItemCooldown("yuushya:button_sign_play",20)
    }
})

//赞同
ItemEvents.rightClicked("yuushya:button_sign_like",event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let item = event.item
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    if (item.customData.getBoolean("PlayerTrialTool")){
        if (roundRepeated){
            player.tell({"text":"当前投票不可用。","color":"yellow"})
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
        }
        else {
            if (!player.stages.has("inTrialApprove")){
                player.tell({"text":"观点改变为「赞同」。","color":"green"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                player.stages.add("inTrialApprove")
                if (player.stages.has("inTrialDisapprove")){
                    player.stages.remove("inTrialDisapprove")
                }
            }
            else {
                player.tell({"text":"观点已经为「赞同」。","color":"green"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
            }
        }
        player.addItemCooldown("yuushya:button_sign_like",20)
    }
})

//反对
ItemEvents.rightClicked("yuushya:button_sign_dislike",event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let item = event.item
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    if (item.customData.getBoolean("PlayerTrialTool")){
        if (roundRepeated){
            player.tell({"text":"当前投票不可用。","color":"yellow"})
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
        }
        else {
            if (!player.stages.has("inTrialDisapprove")){
                player.tell({"text":"观点改变为「反对」。","color":"red"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                player.stages.add("inTrialDisapprove")
                if (player.stages.has("inTrialApprove")){
                    player.stages.remove("inTrialApprove")
                }
            }
            else {
                player.tell({"text":"观点已经为「反对」。","color":"red"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
            }
        }
        player.addItemCooldown("yuushya:button_sign_dislike",20)
    }
})

//打断
ItemEvents.rightClicked("yuushya:button_sign_notice",event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let item = event.item
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    if (item.customData.getBoolean("PlayerTrialTool")){
        if (currentSpeecherForced.length){
            player.tell({"text":"当前发言不可打断。","color":"yellow"})
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.addItemCooldown("yuushya:button_sign_notice",20)
            return 0
        }
        else {
            for (let majo of currentSpeecher){
                if (majo.player.name.string == player.name.string){
                    player.tell({"text":"不可打断自己的发言。","color":"yellow"})
                    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                    player.addItemCooldown("yuushya:button_sign_notice",20)
                    return 0
                }
            }
            let breaker = isMajoPlayer(player)
            beepNoticer(server,{"text":breaker.color+"◆"+breaker.name+"§e打断了发言！"},false)
            server.runCommandSilent("/stopsound @a weather")
            musicTime += 100
            server.runCommandSilent("/execute as @a at @s run playsound sound_effect:crack_01 voice @s")
            server.scheduleInTicks(10,event =>{
                server.runCommandSilent("/execute as @a at @s run playsound sound_effect:crack_02 voice @s")
            })
            server.scheduleInTicks(60,event =>{
                let breakInMus = Object.keys(breakInMusic)[Math.floor(Math.random()*Object.keys(breakInMusic).length)]
                musicTime = breakInMusic[breakInMus]
                server.runCommandSilent("/execute as @a at @s run playsound "+breakInMus+" weather @s ~ ~ ~ 0.5 1")
            })
            currentSpeecher.push(breaker)
            currentSpeechTime = 0
            player.addItemCooldown("yuushya:button_sign_notice",setSpeechTime)
            for (let majo of global.majoList){
                if (majo.player){
                    majo.player.addItemCooldown("yuushya:button_sign_notice",setSpeechTime)
                }
            }
        }
    }
})

//准备与邀请
ItemEvents.rightClicked("yuushya:button_sign_bookmark",event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let item = event.item
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let server = event.server
    if (item.customData.getBoolean("PlayerTrialTool")){
        let majo = isMajoPlayer(player)
        let target = player.rayTrace(50).entity
        let isMainSpeecher = false
        if (currentSpeecher.length){
            for (let speecher of currentSpeecher){
                if (speecher.player.name.string == player.name.string){
                    isMainSpeecher = true
                    break
                }
            }
        }
        if (isMainSpeecher){
            if (target){
                if (target.isPlayer()){
                    if (isMajoPlayer(target)){
                        let invited = isMajoPlayer(target)
                        for (let speecher of currentSpeecher){
                            if (speecher.name == invited.name){
                                player.tell({"text":"该角色已经在发言时段中。","color":"yellow"})
                                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                                player.addItemCooldown("yuushya:button_sign_bookmark",20)
                                return 0
                            }
                        }
                        beepNoticer(server,{"text":majo.color+"◆"+majo.name+"§e邀请了"+invited.color+"◆"+invited.name+"§e进行发言。"},true)
                        currentSpeecher.push(invited)
                        currentSpeechTime = 0
                        for (let majo of global.majoList){
                            if (majo.player){
                                majo.player.addItemCooldown("yuushya:button_sign_bookmark",setSpeechTime)
                            }
                        }
                        return 1
                    }
                }
            }
            player.tell({"text":"请对准需要邀请的角色。","color":"yellow"})
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
            player.addItemCooldown("yuushya:button_sign_bookmark",20)
            return 0
        }
        if (beginningSpeecher.length && !isMainSpeecher){
            if (beginningSpeecher[0] == "OPEN"){
                player.tell({"text":"已准备陈述案情。","color":"green"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                player.addItemCooldown("yuushya:button_sign_bookmark",20)
                beginningSpeecher[0] = majo
            }
            else {
                player.tell({"text":"已有准备发言。","color":"yellow"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                player.addItemCooldown("yuushya:button_sign_bookmark",20)
            }
        }
        else if(!isMainSpeecher){
            if (waitingSpeecher.length){
                if (waitingSpeecher[0] == "OPEN"){
                    player.tell({"text":"接下来是强制公开发言时间。","color":"yellow"})
                    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                    player.addItemCooldown("yuushya:button_sign_bookmark",20)
                }
                else {
                    player.tell({"text":"已有准备发言。","color":"yellow"})
                    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
                    player.addItemCooldown("yuushya:button_sign_bookmark",20)
                }
            }
            else {
                player.tell({"text":"已准备进行发言。","color":"green"})
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
                player.addItemCooldown("yuushya:button_sign_bookmark",20)
                waitingSpeecher.push(majo)
            }
        }
    }
})

//检查人数
ServerEvents.tick(event =>{
    if (!isJudging){return 0}
    let server = event.server
    currentParticipants = 0
    for (let majo of global.majoList){
        if (majo.player){
            if (majo.player.stages.has("inTrial")){
                currentParticipants ++
            }
        }
    }
    if (currentParticipants >= candidates){
        if (!participantsSyns){
            for (let player of server.playerList.players){
                player.tell({"text":"缺席者已到场，审判继续。","color":"green"})
                server.runCommandSilent("/execute as @a at @s run playsound minecraft:block.note_block.bell voice @s")
            }
        }
        participantsSynsTimeOut = 0
        participantsSyns = true
    }
    else (
        participantsSynsTimeOut ++
    )
    if (participantsSynsTimeOut > participantsSynsMaxTimeOut){
        if (participantsSyns){
            for (let player of server.playerList.players){
                player.tell({"text":"有参与者长时间缺席，审判暂停。","color":"yellow"})
                server.runCommandSilent("/execute as @a at @s run playsound minecraft:block.note_block.bell voice @s")
            }
        }
        participantsSyns = false
        participantsSynsTimeOut = participantsSynsMaxTimeOut+1
    }
})

//检查物品栏
PlayerEvents.tick(event =>{
    let player = event.player
    let server = event.server
    if (!isMajoPlayer(player)){return 0}
    if (isJudging && player.stages.has("joinTrial")){
        player.stages.add("inTrial")
        player.stages.remove("joinTrial")
        server.runCommandSilent("/inventory_slots set_available "+player.name.string+" 14")
        let inv = player.inventory
        for (let i = 0;i < 5;i++){
            inv.setStackInSlot(i+9,inv.getStackInSlot(i))
            inv.setStackInSlot(i,"air")
            let item = null
            switch(i){
                case 0:
                    inv.setStackInSlot(i,"yuushya:button_sign_play")
                    item = inv.getStackInSlot(i)
                    item.setCustomData({"PlayerTrialTool":true})
                    item.setCustomName({"text":"结束发言","color":"yellow","italic":false})
                    item.setLore([{"text":"若只有自己在发言，使自己退出发言时段","color":"white","italic":false}])
                    break
                case 1:
                    inv.setStackInSlot(i,"yuushya:button_sign_like")
                    item = inv.getStackInSlot(i)
                    item.setCustomData({"PlayerTrialTool":true})
                    item.setCustomName({"text":"观点：赞同","color":"green","italic":false})
                    item.setLore([{"text":"表示赞同当前轮次的讨论结果","color":"white","italic":false},
                        {"text":"票数占多或平票时，当前轮次将在时间结束后推进","color":"white","italic":false}])
                    break
                case 2:
                    inv.setStackInSlot(i,"yuushya:button_sign_dislike")
                    item = inv.getStackInSlot(i)
                    item.setCustomData({"PlayerTrialTool":true})
                    item.setCustomName({"text":"观点：反对","color":"red","italic":false})
                    item.setLore([{"text":"表示反对当前轮次的讨论结果","color":"white","italic":false},
                        {"text":"票数占多时，当前轮次将在时间结束后重复至多一次","color":"white","italic":false}])
                    break
                case 3:
                    inv.setStackInSlot(i,"yuushya:button_sign_notice")
                    item = inv.getStackInSlot(i)
                    item.setCustomData({"PlayerTrialTool":true})
                    item.setCustomName({"text":"打断发言","color":"yellow","italic":false})
                    item.setLore([{"text":"使自己加入他人的发言时段，并重置发言时间","color":"white","italic":false},
                        {"text":"所有参与者共享打断的冷却时间，但打断发起者冷却时间额外加一倍","color":"white","italic":false},
                    ])
                    break
                case 4:
                    inv.setStackInSlot(i,"yuushya:button_sign_bookmark")
                    item = inv.getStackInSlot(i)
                    item.setCustomData({"PlayerTrialTool":true})
                    item.setCustomName({"text":"准备与邀请","color":"green","italic":false})
                    item.setLore([{"text":"若下一发言时段暂无发言人，使自己成为下一时段的发言人","color":"white","italic":false},
                        {"text":"若自己是当前时段的发言人，使准星对准的角色加入发言时段，并重置发言时间","color":"white","italic":false},
                        {"text":"若如此做，冷却时间为一个发言时段，且所有参与者共享","color":"white","italic":false}
                    ])
                    break
            }
        }
    }
    if (!isJudging && player.stages.has("inTrial")){
        player.stages.remove("inTrial")
        server.runCommandSilent("/clear "+player.name.string+" yuushya:button_sign_play")
        server.runCommandSilent("/clear "+player.name.string+" yuushya:button_sign_like")
        server.runCommandSilent("/clear "+player.name.string+" yuushya:button_sign_dislike")
        server.runCommandSilent("/clear "+player.name.string+" yuushya:button_sign_notice")
        server.runCommandSilent("/clear "+player.name.string+" yuushya:button_sign_bookmark")
        server.runCommandSilent("/inventory_slots set_available "+player.name.string+" 9")
    }
})

//计票
ServerEvents.tick(event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let approveTemp = 0
    let disapproveTemp = 0
    for (let majo of global.majoList){
        if (majo.player){
            if (majo.player.stages.has("inTrialApprove")){
                approveTemp ++
            }
            if (majo.player.stages.has("inTrialDisapprove")){
                disapproveTemp ++
            }
        }
    }
    approve = approveTemp
    disapprove = disapproveTemp
})

//审判详情计算
let speaker = null
let nextSpeaker = null
let roundTimeMin = 0
let roundTimeSec = 0
let speakTimeMin = 0
let speakTimeSec = 0
let voteSitu = null
let showTime = 0 //切换提示的计时器
let switchShowTime = 100
let showContent = "ROUND"

ServerEvents.tick(event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    speaker = displayCurrentSpeecher()
    nextSpeaker = displayNextSpeecher()
    let roundTime = tickToTime(setRoundTime-currentRoundTime)
    roundTimeMin = roundTime[0]
    roundTimeSec = roundTime[1]
    let speakTime = tickToTime(setSpeechTime-currentSpeechTime)
    speakTimeMin = speakTime[0]
    speakTimeSec = speakTime[1]
    if (roundRepeated){
        voteSitu = "§e当前投票不可用§f"
    }
    else {
        voteSitu = approve+'§a👍§f/'+disapprove+'§4👎§f'
    }
    showTime ++
    if (showTime >= switchShowTime){
        if (showContent == "ROUND"){showContent = "SPEECHER"}
        else if (showContent == "SPEECHER"){showContent = "ROUND"}
        showTime = 0
    }
})

//审判详情提示
PlayerEvents.tick(event =>{
    if (!isJudging){return 0}
    let player = event.player
    let server = event.server
    if (isMajoPlayer(player)){
        let majo = isMajoPlayer(player)
        if (player.getMainHandItem().is(majo.token) || player.getOffHandItem().is(majo.token)){
            return 0
        }
    }
    if (!participantsSyns){
        server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"等待离席人员..."}')
        return 0
    }
    if (showContent == "ROUND"){
        server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"「轮次」'+currentTrialRound+'/'+setMaxTrialRounds+
        ' '+roundTimeMin+':'+roundTimeSec+'「观点」'+voteSitu+'"}')
    }
    else if (showContent == "SPEECHER"){
        server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"「当前」'+speaker+speakTimeMin+':'+speakTimeSec+'「后续」'+nextSpeaker+'"}')
    }
})

//主进程
ServerEvents.tick(event =>{
    if (!isJudging){return 0}
    if (!participantsSyns){return 0}
    let server = event.server
    if (currentTrialRound == 1 && currentSpeecherForced[0] == "PREPARE"){
        setSpeechTime = defaultPrepareTime
    }
    else {
        setSpeechTime = defaultSpeechTime
    }
    setRoundTime = defaultRoundTime //可用于轮时间的改动
    currentRoundTime ++
    currentSpeechTime ++
    if (currentSpeechTime >= setSpeechTime){
        currentSpeechTime = 0
        beepNoticer(server,{"text":displayCurrentSpeecher()+"§e发言时段结束。"},false)
        currentSpeecher = []
        currentSpeecherForced = []
        if (beginningSpeecher.length){
            currentSpeecherForced.push(beginningSpeecher[0])
            beginningSpeecher.splice(0,1)
            if ((setRoundTime-currentRoundTime)<=setSpeechTime){
                currentRoundTime = setRoundTime - setSpeechTime
            }
        }
        else {
            if (waitingSpeecher.length){
                if (waitingSpeecher[0] == 'OPEN'){
                    currentSpeecherForced.push(waitingSpeecher[0])
                    waitingSpeecher.splice(0,1)
                    soloTimes = 0
                }
                else {
                    currentSpeecher.push(waitingSpeecher[0])
                    waitingSpeecher.splice(0,1)
                    soloTimes ++
                }
            }
            else {
                currentSpeecherForced.push('OPEN')
                soloTimes = 0
            }
            if (soloTimes >= maxSoloTimes){
                waitingSpeecher.push('OPEN')
            }
            if ((setRoundTime-currentRoundTime)<=2*setSpeechTime && waitingSpeecher[0] != "OPEN" && !closingOpenState){
                waitingSpeecher.push('OPEN')
                closingOpenState = true
            }
        }
        beepNoticer(server,{"text":displayCurrentSpeecher()+"§e发言时段开始。"},true)
    }
    if (currentRoundTime >= setRoundTime){
        currentRoundTime = 0
        closingOpenState = false
        resetVote()
        if (!roundRepeated){
            if (approve < disapprove){
                beepNoticer(server,{"text":"§e大家反对了本轮讨论结果，轮次必须重新开始。"},false)
                server.runCommandSilent('/title @a title {"text":"⚖讨论重演⚖","color":"red","bold":true}')
                roundRepeated = true
            }
            else {
                if (currentTrialRound == setMaxTrialRounds){
                    beepNoticer(server,{"text":"§e大家赞同了最后的结论，审判的结果即将揭晓……。"},false)
                }
                else {
                    beepNoticer(server,{"text":"§e大家赞同了本轮讨论结果，轮次向前推进。"},false)
                    server.runCommandSilent('/title @a title {"text":"⚖讨论推进⚖","color":"red","bold":true}')
                }
                currentTrialRound ++
            }
        }
        else {
            if (currentTrialRound == 1){
                beepNoticer(server,{"text":"§e大家各自陈述完毕，轮次向前推进。"},false)
                server.runCommandSilent('/title @a title {"text":"⚖讨论推进⚖","color":"red","bold":true}')
            }
            else {
                if (currentTrialRound == setMaxTrialRounds){
                    beepNoticer(server,{"text":"§e时间消耗殆尽，审判的结果即将揭晓……"},false)
                }
                else {
                    beepNoticer(server,{"text":"§e没有时间可浪费了，不论如何都得进行下一轮次。"},false)
                    server.runCommandSilent('/title @a title {"text":"⚖讨论推进⚖","color":"red","bold":true}')
                }
            }
            currentTrialRound ++
            roundRepeated = false
        }
        if (currentTrialRound > setMaxTrialRounds){
            isJudging = false
            server.runCommandSilent('/title @a title {"text":"⚖审判终了⚖","color":"red","bold":true}')
            server.runCommandSilent("/stopsound @a weather")
            server.runCommandSilent("/execute as @a at @s run playsound sound_effect:church_bell_2 weather @s")
            for (let op of global.operatorList){
                op.player.tell({"text":"请注意此时仍处于焦点模式。 ","color":"yellow"})
            }
        }
    }
})

//审判时的发言规范
PlayerEvents.chat(event =>{
    if (!isJudging){return 0}
    let player = event.player
    let username = event.username
    let message = String(event.message)
    if (!messagePrefix(message)){event.cancel()}
    let server = event.server
    let allPlayers = server.playerList.players
    if (isMajoPlayer(player)){
        let majo = isMajoPlayer(player)
        if (!participantsSyns){
            player.tell("§e在离席人员归位之前无法发言。")
            event.cancel()
        }
        let maySpeech = false
        if (currentSpeecherForced.length){
            if (currentSpeecherForced[0] == "OPEN"){
                maySpeech = true
            }
            else if (currentSpeecherForced[0] == "PREPARE"){
                maySpeech = false
            }
            else {
                for (let speaker of currentSpeecherForced){
                    if (speaker.player.name.string == player.name.string){
                        maySpeech = true
                        break
                    }
                }
            }
        }
        if (!maySpeech && currentSpeecher.length){
            for (let speaker of currentSpeecher){
                if (speaker.player.name.string == player.name.string){
                    maySpeech = true
                    break
                }
            }
        }
        if (!maySpeech){
            player.tell("§e现在不是自己的发言时段。")
            event.cancel()
        }
        let ananOrder = false
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
                }
                else (
                    event.cancel()
                )
            }
        }
        if (majo.faint || player.sleeping){message = faintWords[Math.floor(Math.random()*faintWords.length)]}
        for (let receiver of allPlayers){
            if (isMajoPlayer(receiver)){
                if (isMajoPlayer(receiver).faint){continue}
                if (ananOrder){
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
                receiver.tell(speaker)
                receiver.tell("  "+messagePrefix(message))
                }
            else {
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
                        if (receiver.name != "夏目安安"){
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
        for (let receiver of allPlayers){
            receiver.tell("◆"+isOperator(player).name)
            receiver.tell("  "+messagePrefix(message))
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
})

//点歌姬
ServerEvents.tick(event =>{
    if (!isJudging){return 0}
    musicTime --
    if (musicTime > 0){return 0}
    let server = event.server
    if (currentTrialRound <= Math.ceil(setMaxTrialRounds/2)){
        let mus = Object.keys(normalMusic)[Math.floor(Math.random()*Object.keys(normalMusic).length)]
        musicTime = normalMusic[mus]
        server.runCommandSilent("/stopsound @a weather")
        server.runCommandSilent("/execute as @a at @s run playsound "+mus+" weather @s ~ ~ ~ 0.5 1")
    }
    else {
        let mus = Object.keys(crucialMusic)[Math.floor(Math.random()*Object.keys(crucialMusic).length)]
        musicTime = crucialMusic[mus]
        server.runCommandSilent("/stopsound @a weather")
        server.runCommandSilent("/execute as @a at @s run playsound "+mus+" weather @s ~ ~ ~ 0.5 1")
    }
})

//显示当前的发言人
function displayCurrentSpeecher(){
    if (currentSpeecherForced.length){
        if (currentSpeecherForced[0] == 'PREPARE'){
            return "§e◆准备§f"
        }
        if (currentSpeecherForced[0] == 'OPEN'){
            return "§e◆公开§f"
        }
        let result = '§e强制§f'
        for (let i = 0;i < currentSpeecherForced.length;i++){
            let majo = currentSpeecherForced[i]
            result = result+' '+majo.color+'◆'+majo.name+"§f"
        }
        return result
    }
    else {
        if (currentSpeecher.length){
            let result = ''
            for (let i = 0;i < currentSpeecher.length;i++){
                let majo = currentSpeecher[i]
                result = result+majo.color+'◆'+majo.name+"§f "
            }
            return result
        }
        return "§f暂无"
    }
}

//显示下一个发言人
function displayNextSpeecher(){
    if (beginningSpeecher.length){
        if (beginningSpeecher[0] == "OPEN"){
            return "§e◆请案情陈述人「准备」§f"
        }
        let majo = beginningSpeecher[0]
        return '§e强制§f '+majo.color+'◆'+majo.name+"§f"
    }
    else {
        if (waitingSpeecher.length){
            if (waitingSpeecher[0] == "OPEN"){
                return "§e强制 ◆公开§f"
            }
            let majo = waitingSpeecher[0]
            return majo.color+'◆'+majo.name+"§f"
        }
        return "§f◆公开"
    }

}

//通知所有人
function beepNoticer(server,component,bell){
    for (let player of server.playerList.players){
        player.tell(component)
        if (bell){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
        }
    }
}

//洗去票数
function resetVote(){
    for (let majo of global.majoList){
        if (majo.player){
            if (majo.player.stages.has("inTrialApprove")){
                majo.player.stages.remove("inTrialApprove")
            }
            if (majo.player.stages.has("inTrialDisapprove")){
                majo.player.stages.remove("inTrialDisapprove")
            }
        }
    }
}

//将刻数转化为60进制时间文本数组
function tickToTime(tick){
    let min = Math.floor(tick/1200)
    let sec = Math.floor((tick-min*1200)/20)
    if (sec < 10){
        sec.toString()
        sec = '0'+sec
    }
    else {
        sec.toString()
    }
    min.toString()
    return [min,sec]
}