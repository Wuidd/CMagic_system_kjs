// priority:9
//HYW

PlayerEvents.tick(event =>{
    let player = event.player
    if (player.isSpectator()){return 0}
    let op = isOperator(player)
    if (!op){return 0}
    if (op.name != "月代雪"){return 0}
    let server = event.server
    if (player.shiftKeyDown && op.flipTrigger > -1){
        op.flipTrigger ++
    }
    if (!player.shiftKeyDown && op.flipTrigger > 0){
        op.flipTrigger --
    }
    if (op.flipTrigger > 20 && !player.shiftKeyDown){
        op.flipTrigger = -1
        switch(Math.round(Math.random())){
            case 0:
                server.runCommandSilent('/ysm play '+player.name.string+' "parcool:flipping_back"')
                break
            case 1:
                server.runCommandSilent('/ysm play '+player.name.string+' "parcool:flipping_front"')
                break
        }
        server.runCommandSilent('/execute as '+player.name.string+' at @s run playsound minecraft:entity.egg.throw player @a ~ ~ ~ 1 0.5')
        player.potionEffects.add("levitation",5,4,false,false)
        server.scheduleInTicks(10,event=>{
            op.flipTrigger = 0
            server.runCommandSilent("/ysm play "+player.name.string+" empty")
        })
    }
})