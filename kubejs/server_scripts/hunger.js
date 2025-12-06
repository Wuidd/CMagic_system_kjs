// priority:7
//饱食度系统

const basicHungerSpeed = -40 //每刻减少的饱食度值
const foodDiscount = 0.5 //食物饱食度修正
const sleepHungerDiscount = 0.5 //不在清醒时的饱食度消耗

//主进程

PlayerEvents.tick(event =>{
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    if (!isMajoProgressing || majo.majolizeScore>majo.majolize){
        player.setFoodLevel(20)
        return 0
    }
    let server = event.server
    let hungerScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,hunger)
    if (!hungerScore.get() || hungerScore.get() > majo.maxFood){
        hungerScore.set(majo.maxFood)
    }
    player.setFoodLevel(Math.round(20*hungerScore.get()/majo.maxFood))
    player.setSaturation(0)
    let hungerMulti = majo.extraFoodNeed*majo.extraFoodNeedFromSporting
    if (majo.faint || player.sleeping){hungerMulti = hungerMulti*sleepHungerDiscount}
    if (Math.round(20*hungerScore.get()/majo.maxFood) > 0 && !isFocusMode){hungerScore.add(basicHungerSpeed*hungerMulti)}
})

//食品

ItemEvents.foodEaten(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let food = event.item
    let server = event.server
    let hungerScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,hunger)
    let hungerRecovery = food.getFoodProperties(player).nutrition()*48000+food.getFoodProperties(player).saturation()*48000
    hungerRecovery = Math.round(foodDiscount*hungerRecovery)
    hungerScore.add(hungerRecovery)
    if (isFocusMode){return 0}
    for (let pressuredis of Object.keys(global.pressureDiscountFoodList)){
        if (food.is(pressuredis) || food.hasTag(pressuredis)){
            server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure).add(global.pressureDiscountFoodList[pressuredis])
        }
    }
})

BlockEvents.rightClicked(event =>{
    if (!isMajoProgressing){return 0}
    let server = event.server
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let foodBlock = event.block
    let food = Item.getItem(foodBlock.id)
    if (food){
        if (food.getFoodProperties){
            let property = food.getFoodProperties(foodBlock.id,player)
            let nutrition = property.nutrition()
            let saturation = property.saturation()
            if (property && nutrition && saturation){
                let hungerScore = server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,hunger)
                let hungerRecovery = nutrition*48000+saturation*48000
                console.log(hungerRecovery)
                hungerRecovery = Math.round(foodDiscount*hungerRecovery)
                console.log(hungerRecovery)
                hungerScore.add(hungerRecovery)
            }
        }
    }
    if (isFocusMode){return 0}
    for (let pressuredis of Object.keys(global.pressureDiscountFoodList)){
        if (foodBlock.id == pressuredis || foodBlock.hasTag(pressuredis)){
            server.scoreboard.getOrCreatePlayerScore(majo.scoreHolder,pressure).add(global.pressureDiscountFoodList[pressuredis])
        }
    }
})