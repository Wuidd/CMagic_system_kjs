// priority:8
//合成表与类合成表

//特雷德基姆的涂药功能
let tredecimAttachable = ['minecraft:enchantable/sword','c:tools/melee_weapon','minecraft:arrows'] //可上药的tag

ItemEvents.rightClicked(event =>{
    let item = event.item
    if (item.customData.getBoolean("tredecim")){return 0}
    let offHandItem = event.player.getOffHandItem()
    if (!offHandItem.is("mocai:tredecim")){return 0}
    for (let attachable of tredecimAttachable){
        if (item.hasTag(attachable) && item.count < 2){
            event.player.setOffHandItem("minecraft:glass_bottle")
            event.player.getOffHandItem().setLore({"text":"有未知的药液残存其中","color":"light_purple"})
            item.setCustomData(item.customData.merge({"tredecim":true}))
            item.setLore({"text":"有未知的药液附着其上","italic":false,"color":"light_purple"})
        }
    }
})

//制作特殊书籍
ItemEvents.rightClicked("minecraft:writable_book",event =>{
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let item = player.getOffHandItem()
    if (!item.is( "minecraft:writable_book")){
        return 0
    }
    if (item.customData.getBoolean("Transfered")){
        return 0
    }
    let server = event.server
    player.closeMenu()
    player.tell({"text":"你决定把这本笔记本专门用作(点击以选择):","color":"green"})
    server.runCommandSilent("/scoreboard players enable "+player.name.string+" transferBookTo")
    player.tell({"text":"-[日记]","click":{"action":"run_command","value":"/trigger transferBookTo set 1"},"color":"green"})
    player.tell({"text":"-[译本]","click":{"action":"run_command","value":"/trigger transferBookTo set 2"},"color":"green"})
})

//转化
PlayerEvents.tick(event =>{
    let player = event.player
    let server = event.server
    if (!transferBookTo){return 0}
    let trans = server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly(player.name.string),transferBookTo).get()
    if (!trans){return 0}
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let item = player.getOffHandItem()
    if (item.is("minecraft:writable_book")){
        if (item.customData.allKeys.contains("Transfered")){
            player.tell({"text":"这本笔记本已经另有他用了……","color":"yellow"})
        }
        else {
            let server = event.server
            switch (trans){
                case 1:
                    item.setCustomData(item.customData.merge({"Transfered":true,"TransferToType":"DIARY","Owner":majo.name}))
                    item.setCustomName({"text":majo.name+"的日记本","italic":false})
                    player.tell({"text":"你决定用这个笔记本写日记……","color":"green"})
                    break
                case 2:
                    item.setCustomData(item.customData.merge({"Transfered":true,"TransferToType":"TRANSLATE","Owner":majo.name}))
                    item.setCustomName({"text":majo.name+"的译本","italic":false})
                    player.tell({"text":"你决定用这个笔记本记录破译的文字……","color":"green"})
                    break
            }
            server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
        }
    }
    else {
        player.tell({"text":"需要将普通的笔记本拿在副手……","color":"yellow"})
    }
    server.scoreboard.getOrCreatePlayerScore($ScoreHolder.forNameOnly(player.name.string),transferBookTo).set(0)
})