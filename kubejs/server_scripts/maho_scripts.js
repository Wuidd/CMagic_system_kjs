// priority:6
//魔法复现

let meruruMahoCost = 100000 //梅露露魔法的精力消耗
let meruruMahoBenefit = 5 //梅露露魔法提供的魔女化乘子减免
let hannaMahoCost = 20 //汉娜魔法的体力消耗
let hannaMahoTimePause = 6 //调整汉娜的漂浮速率
let defaultArisaFireAmbient = 0.001
let arisaFireAmbient = 0.001 //亚里沙火焰燃烧音效的频率
let mahoRifleReloadTimeTrigger = false //按天为魔法步枪恢复弹药
let arisaIgnitable = {"minecraft:bookshelf_books":"supplementaries:ash",'minecraft:paper':"supplementaries:ash","minecraft:potion":'minecraft:glass_bottle[custom_name=\'{"text":"炙烤瓶子","italic":false}\']'} //亚里沙可以点燃的物品tag或物品

//梅露露的魔法
ItemEvents.entityInteracted("mocai:meruru_cross",event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "冰上梅露露"){return 0}
    if (majo.faint || majo.exhausted){return 0}
    let entity = event.target
    let server = event.server
    let pressureScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure)
    entity.potionEffects.add("minecraft:regeneration",200,0,false,true)
    if (isMajoPlayer(entity)){
        let patient = isMajoPlayer(entity)
        patient.extraMajolizeMulti -= meruruMahoBenefit
        if (patient.extraMajolizeMulti < 1){
            patient.extraMajolizeMulti = 1
        }
    }
    pressureScore.add(meruruMahoCost)
    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.beacon.ambient voice @a ~ ~ ~ 0.5 2")
    player.addItemCooldown("mocai:meruru_cross",1200)
})

//涂了特雷德基姆的武器
EntityEvents.afterHurt(event =>{
    if (!isMajoProgressing){return 0}
    if (!event.source.player){return 0}
    if (!event.source.weaponItem){return 0}
    if (event.source.weaponItem == "air"){return 0}
    if (event.entity.potionEffects.isActive("mocai:witchfication") && event.source.weaponItem.customData.getBoolean("tredecim")){
        event.entity.kill()
    }
})

//奈叶香的枪
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    for (let i = 0;i<player.inventory.slots;i++){
        let item = player.inventory.getStackInSlot(i)
        if (item.is("tacz:modern_kinetic_gun")){
            if (item.customData.contains("maho")){
                let ammoCount = item.customData.getInt("GunCurrentAmmoCount")
                let barrelAmmo = item.customData.getInt("HasBulletInBarrel")
                if ((ammoCount > 4 && barrelAmmo == 1) || (ammoCount > 5 && barrelAmmo == 0)){return 0}
                if (!mahoRifleReloadTimeTrigger){return 0}
                let newItem = 'tacz:modern_kinetic_gun[custom_data={GunCurrentAmmoCount:'+(ammoCount+1)+',GunFireMode:'+item.customData.getString("GunFireMode")+',GunId:'+item.customData.get("GunId")+',HasBulletInBarrel:'+item.customData.get("HasBulletInBarrel")+',maho:1b}]'
                player.inventory.setStackInSlot(i,newItem)
                mahoRifleReloadTimeTrigger = false
            }
        }
    }    
})

//玛格的魔法
//玛格的发言实现见player_behaviour部分
//玛格的模仿录入
ItemEvents.entityInteracted("mocai:margo_tarot",event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "宝生玛格"){return 0}
    let target = event.target
    if (!target.isPlayer()){return 0}
    if (!isMajoPlayer(target)){return 0}
    let targetMajo = isMajoPlayer(target)
    let server = event.server
    for (let learned of majo.learnedSound){
        if (targetMajo.name == learned.name){
            player.tell("§e这个声音已经学过了……")
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.harp voice @s")
            return 0
        }
    }
    majo.learnedSound.push(targetMajo)
    player.tell("§2学会了模仿祂的声音……")
    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.harp voice @s")
})

//手持提示
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "宝生玛格"){return 0}
    if (majo.selectedSound >= majo.learnedSound.length || majo.faint){majo.selectedSound = 0}
    if (majo.selectedSound < 0){majo.selectedSound = majo.learnedSound.length-1}
    let item = player.getMainHandItem()
    if (!item.is("mocai:margo_tarot")){
        item = player.getOffHandItem()
        if (!item.is("mocai:margo_tarot")){
            return 0
        }
    }
    let imitated = majo.learnedSound[majo.selectedSound]
    let server = event.server
    server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"正在使用声音:'+imitated.color+"◆"+imitated.name+'"}')
})

//选择
ItemEvents.rightClicked("mocai:margo_tarot",event=>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "宝生玛格"){return 0}
    majo.selectedSound += 1
})

ItemEvents.firstLeftClicked("mocai:margo_tarot",event=>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "宝生玛格"){return 0}
    majo.selectedSound -= 1
})

//汉娜的魔法
//开关
ItemEvents.rightClicked("mocai:hannafan",event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "远野汉娜"){return 0}
    let server = event.server
    if (!majo.flying){
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.harp voice @s")
        majo.flying = true
    }
    else {
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.harp voice @s")
        majo.flying = false
    }
})

//手持提示
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "远野汉娜"){return 0}
    let item = player.getMainHandItem()
    if (!item.is("mocai:hannafan")){
        item = player.getOffHandItem()
        if (!item.is("mocai:hannafan")){
            return 0
        }
    }
    let server = event.server
    if (!majo.flying){
        server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"不在飞行desuwa","color":"yellow"}')
    }
    else {
        server.runCommandSilent('/title '+player.name.string+' actionbar {"text":"正在飞行desuwa","color":"green"}')
    }
})

//漂浮
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "远野汉娜"){return 0}
    if (player.sleeping || majo.exhausted || majo.faint){
        majo.flying = false
        return 0
    }
    if (majo.flying){
        let server = event.server
        let level = event.level
        let pos = vecToArr(player.position())
        let time = server.tickCount
        if (time % hannaMahoTimePause == 0 || level.getBlock(pos[0],Math.floor(player.position().y-0.5),pos[2]).getId() != "minecraft:air" || player.shiftKeyDown){
            player.potionEffects.add("minecraft:levitation",Math.floor(hannaMahoTimePause/2),0,false,false)
        }
        player.potionEffects.add("minecraft:slow_falling",60,0,false,false)
        if (player.shiftKeyDown){
            player.potionEffects.add("minecraft:levitation",20,0,false,false)
        }
        if (level.getBlock(pos[0],pos[1],pos[2]).getId() != "minecraft:air"){return 0}
        let fatigueScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,fatigue)
        fatigueScore.add(hannaMahoCost*majo.fatigueMulti*majo.fatigueMultiFromPressure)
    }
})

//安安的魔法实现见player_behaviour部分

//亚里沙的魔法
//点燃
ItemEvents.firstLeftClicked("minecraft:air",event=>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    if (majo.ignite){return 0}
    let server = event.server
    if (player.getMainHandItem().is("air") && player.shiftKeyDown){
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:item.flintandsteel.use voice @a ~ ~ ~ 0.5 1")
        player.setMainHandItem("mocai:arisa_fire")
    }
})

PlayerEvents.tick(event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    let server = event.server
    let item = player.getMainHandItem()
    if (item.is("mocai:arisa_fire")){majo.ignite = true}
    else {majo.ignite = false}
    if (majo.ignite){
        if (Math.random() < arisaFireAmbient){
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.ambient voice @a")
            arisaFireAmbient = defaultArisaFireAmbient
        }
        else (
            arisaFireAmbient += 0.001
        )
    }
})

//物品管制
PlayerEvents.tick(event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    let server = event.server
    if (!player.getMainHandItem().is("mocai:arisa_fire")){
        for (let i=0;i<player.inventory.slots;i++){
            let item = player.inventory.getStackInSlot(i)
            if (item.is("mocai:arisa_fire")){
                player.inventory.setStackInSlot(i,"air")
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.extinguish voice @a ~ ~ ~ 0.2 2")
                return 1
            }
        }
    }
})

PlayerEvents.inventoryOpened(event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    let server = event.server
    if (majo.ignite){
        if (player.getMainHandItem().is("mocai:arisa_fire")){
            player.setMainHandItem("air")
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.extinguish voice @a ~ ~ ~ 0.2 2")
            return 1
        }
    }
})

ItemEvents.dropped("mocai:arisa_fire",event =>{
    let player = event.player
    let server = event.server
    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.extinguish voice @a ~ ~ ~ 0.2 2")
    if (isMajoPlayer(player)){
        let majo = isMajoPlayer(player)
        if (majo.name == "紫藤亚里沙"){
            event.cancel()
        }
    }
})

ItemEvents.firstLeftClicked("mocai:arisa_fire",event =>{
    let player = event.player
    let server = event.server
    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.extinguish voice @a ~ ~ ~ 0.2 2")
    if (player.getMainHandItem().is("mocai:arisa_fire")){
        player.setMainHandItem("air")
    }
    if (isMajoPlayer(player)){
        let majo = isMajoPlayer(player)
        if (majo.name == "紫藤亚里沙"){
        }
    }
})

//点燃实体
ItemEvents.entityInteracted("mocai:arisa_fire",event =>{
    let server = event.server
    event.target.setRemainingFireTicks(100)
    server.runCommandSilent("/execute as "+event.player.name.string+" at @s run playsound minecraft:block.fire.ambient voice @a")
})

//点燃方块
BlockEvents.rightClicked("kaleidoscope_cookery:stove",event =>{
    let item = event.item
    if (!item.is("mocai:arisa_fire")){return 0}
    let block = event.block.toString()
    let player = event.player
    if (block.includes("lit=false")){
        let server = event.server
        block = block.replace("lit=false","lit=true")
        let pos = vecToArr(event.block.pos)
        console.log(block)
        server.runCommandSilent("/setblock "+pos[0]+" "+pos[1]+" "+pos[2]+" "+block)
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.ambient voice @a")
    }
})

//烧毁物品
ItemEvents.rightClicked("mocai:arisa_fire",event =>{
    let player = event.player
    if (!player.getOffHandItem().is("air")){
        let item = player.getOffHandItem()
        let server = event.server
        for (let ignitable of Object.keys(arisaIgnitable)){
            if (item.hasTag(ignitable) || item.is(ignitable)){
                server.runCommandSilent("/item replace entity "+player.name.string+" weapon.offhand with "+arisaIgnitable[ignitable])
                server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.fire.ambient voice @a")
                event.cancel()
            }
        }
    }
})

//远程投掷
ItemEvents.rightClicked("mocai:arisa_fire",event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    if (player.rayTrace(8).entity){
        let server = event.server
        let entity = player.rayTrace(8).entity
        let distance = entity.distanceToEntity(player)
        let startPos = player.eyePosition
        let endPos = entity.eyePosition
        for (let i=0;i<distance;i+=0.5){
            let pos = [i*(endPos.x()-startPos.x())/distance+startPos.x(),i*(endPos.y()-startPos.y())/distance+startPos.y(),i*(endPos.z()-startPos.z())/distance+startPos.z()]
            for (let j=0;j<5;j++){
                server.scheduleInTicks(i,event =>{
                    let randPos = [pos[0]+Math.random()-0.5,pos[1]+Math.random()-0.5,pos[2]+Math.random()-0.5]
                    server.runCommandSilent("/particle minecraft:flame "+randPos[0]+" "+randPos[1]+" "+randPos[2])
                })
            }
        }
        entity.setRemainingFireTicks(100)
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:entity.blaze.shoot voice @a")
        if (player.getMainHandItem().is("mocai:arisa_fire")){
            player.setMainHandItem("air")
        }
    }
})

//免疫火焰
PlayerEvents.tick(event =>{
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    player.potionEffects.add("minecraft:fire_resistance",10,0,false,false)
    if (player.remainingFireTicks){
        player.setRemainingFireTicks(0)
    }
})

//雪的魔法
ServerEvents.commandRegistry(event =>{
    let {arguments:arg,commands:cmd} = event
    function shock(player,target,showIdentity,message,server){
        if (!isMajoProgressing){
            player.tell({"text":"当前不可用。","color":"yellow"})
            return 0
        }
        let op = isOperator(player)
        if (!op){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        if (op.name != "月代雪" && op.name != "测试人员"){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        target.potionEffects.add("minecraft:darkness",200,0,false,false)
        target.potionEffects.add("minecraft:slowness",200,255,false,false)
        server.scheduleInTicks(30,event =>{
            target.potionEffects.add("minecraft:blindness",170,0,false,false)
            server.runCommandSilent("/execute as "+target.name.string+" at @s run playsound minecraft:entity.warden.sonic_charge voice @s ~ ~ ~ 1 0.2")
        })
        for (let i = 30;i <105;i++){
            server.scheduleInTicks(i,event =>{
                target.tell({"text":"111111111111111111111111111111111111111111111","obfuscated":true})
            })
        }
        server.scheduleInTicks(105,event =>{
            server.runCommandSilent("/execute as "+target.name.string+" at @s run playsound minecraft:entity.warden.sonic_boom voice @s ~ ~ ~ 1 0.2")
        })
        server.scheduleInTicks(110,event =>{
            if (showIdentity){
                target.tell({"text":"◆月代雪","color":"red","bold":true,"hover":{"text":"是谁在说话？","color":"red"}})
            }
            else {
                target.tell({"text":"◆未知","color":"red","bold":true,"hover":{"text":"是谁在说话？","color":"red"}})
            }
            target.tell({"text":" "+String(message).replace("literal{","").slice(0,-1),"color":"red","bold":true,"hover":{"text":"是谁在说话？","color":"red"}})
        })
    }

    event.register(
        cmd.literal('yuki_shock')
        .then(cmd.argument('target',arg.PLAYER.create(event))
        .then(cmd.argument('showIdentity',arg.BOOLEAN.create(event))
        .then(cmd.argument('message',arg.MESSAGE.create(event))
        .executes(cmd =>{
            let player = cmd.source.playerOrException
            let target = arg.PLAYER.getResult(cmd,'target')
            let showIdentity = arg.BOOLEAN.getResult(cmd,"showIdentity")
            let message = arg.MESSAGE.getResult(cmd,"message")
            let server = cmd.source.server
            shock(player,target,showIdentity,message,server)
            return 1
        }))))
    )
})

ServerEvents.commandRegistry(event =>{
    let {arguments:arg,commands:cmd} = event
    function whisper(player,target,showIdentity,message,server){
        if (!isMajoProgressing){
            player.tell({"text":"当前不可用。","color":"yellow"})
            return 0
        }
        let op = isOperator(player)
        if (!op){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        if (op.name != "月代雪" && op.name != "测试人员"){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        target.tell({"text":"111111111111111111111111111111111111111111111","obfuscated":true})
        if (showIdentity){
            target.tell({"text":"◆月代雪","color":"white"})
        }
        else {
            target.tell({"text":"◆未知","color":"white"})
        }
        target.tell({"text":" "+String(message).replace("literal{","").slice(0,-1)})
        target.tell({"text":"111111111111111111111111111111111111111111111","obfuscated":true})
        server.runCommandSilent("/execute as "+target.name.string+" at @s run playsound minecraft:ambient.cave voice @s ~ ~ ~ 1 0.2")
    }
    event.register(
        cmd.literal('yuki_whisper')
        .then(cmd.argument('target',arg.PLAYER.create(event))
        .then(cmd.argument('showIdentity',arg.BOOLEAN.create(event))
        .then(cmd.argument('message',arg.MESSAGE.create(event))
        .executes(cmd =>{
            let player = cmd.source.playerOrException
            let target = arg.PLAYER.getResult(cmd,'target')
            let showIdentity = arg.BOOLEAN.getResult(cmd,"showIdentity")
            let message = arg.MESSAGE.getResult(cmd,"message")
            let server = cmd.source.server
            whisper(player,target,showIdentity,message,server)
            return 1
        }))))
    )
})