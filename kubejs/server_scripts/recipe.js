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
            event.player.setOffHandItem("air")
            item.setCustomData(item.customData.merge({"tredecim":true}))
            item.setLore({"text":"有未知的药液附着其上","italic":false,"color":"light_purple"})
        }
    }
})
