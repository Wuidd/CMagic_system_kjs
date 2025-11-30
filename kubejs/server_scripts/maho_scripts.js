// priority:6
//魔法复现

let meruruMahoCost = 10000 //梅露露魔法的精力消耗
let meruruMahoBenefit = 5 //梅露露魔法提供的魔女化乘子减免
let hannaMahoCost = 20 //汉娜魔法的体力消耗
let hannaMahoTimePause = 6 //调整汉娜的漂浮速率
let mahoRifleReloadTimeTrigger = false //按天为魔法步枪恢复弹药

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
/*ItemEvents.rightClicked("minecraft:air",event=>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!isMajoPlayer(player)){return 0}
    let majo = isMajoPlayer(player)
    if (majo.name != "紫藤亚里沙"){return 0}
    player.inventoryMenu.clicked
})*/