// priority:12
//特殊书籍

const columnOfPage = 19 //书页的列
const lineOfPage = 14 //书页的行
const charOfPage = 266 //书页上限字符量
const pagesOfBook = 100 //最大书页数
const writingDiaryTimePause = 40 //书写一条日志的间隔

//日记
//开始回想
ItemEvents.rightClicked("minecraft:writable_book",event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (player.stages.has("writingDiary")){return 0}
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let item = player.getOffHandItem()
    if (!item.is( "minecraft:writable_book")){return 0}
    if (!item.customData.getBoolean("Transfered")){return 0}
    if (item.customData.getString("TransferToType") != "DIARY" || item.customData.getString("Owner") != majo.name){return 0}
    if (!majo.memorableLog.length){
        player.tell({"text":"暂时没什么可写的……","color":"yellow"})
        player.closeMenu()
        return 0
    }
    player.tell({"text":"正在回想……","color":"green"})
    player.stages.add("writingDiary")
    player.closeMenu()
})

//主动取消
ItemEvents.rightClicked("minecraft:writable_book",event =>{
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    if (majo.writingLogTimePause){
        player.tell({"text":"先写到这里好了。","color":"yellow"})
        player.closeMenu()
        player.stages.remove("writingDiary")
        majo.writingLogTimePause = 0
    }
})

//正在书写
PlayerEvents.tick(event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    if (!player.stages.has("writingDiary")){return 0}
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    player.potionEffects.add("slowness",10,2,false,false)
    let item = player.getOffHandItem()
    if (!item.is( "minecraft:writable_book") || item.customData.getString("TransferToType") != "DIARY" || item.customData.getString("Owner") != majo.name){
        player.tell({"text":"先写到这里好了。","color":"yellow"})
        player.stages.remove("writingDiary")
        majo.writingLogTimePause = 0
        return 0
    }
    if (majo.writingLogTimePause){
        majo.writingLogTimePause -= 1
        return 0
    }
    let server = event.server
    majo.writingLogTimePause = writingDiaryTimePause
    let log = majo.memorableLog[0]
    let logDuration = 60*(log["endHour"]-log["beginHour"])+log["endMin"]-log["beginMin"]
    let logDescriptionSet
    if (logDuration <= 5){
        logDescriptionSet = flashTimeLogWord
    }
    else if (logDuration <= 30){
        logDescriptionSet = shortTimeLogWord
    }
    else {
        logDescriptionSet = longTimeLogWord
    }
    let logString = "\n"+numberToStringWithPreZero(log["beginHour"],2)+":"+numberToStringWithPreZero(log["beginMin"],2)+"-"
                    +numberToStringWithPreZero(log["endHour"],2)+":"+numberToStringWithPreZero(log["endMin"],2)+"\n"+logDescriptionSet[Math.floor(Math.random()*logDescriptionSet.length)]
                    +"「"+log["structure"].name+"」"
    let pages = null
    let lastPageTitle = null
    let pageChar
    let logChar
    if (Object.keys(item.toNBT()["components"]).includes("minecraft:writable_book_content")){
        pages = item.toNBT()["components"]["minecraft:writable_book_content"]["pages"]
        let lastPage = String(pages[pages.length-1]["raw"])
        lastPageTitle = lastPage.slice(1,3)
        pageChar = charUsedInThePage(lastPage)
        logChar = charUsedInThePage(logString)
    }
    let newBook
    if (lastPageTitle == log["weekDayString"] && pageChar+logChar<= charOfPage){
        newBook = writeBookPage(item,logString,false)
    }
    else {
        logString = log["weekDayString"]+logString
        newBook = writeBookPage(item,logString,true)
    }
    if (!newBook){
        player.tell({"text":"这本笔记本已经写不下了……","color":"yellow"})
        player.stages.remove("writingDiary")
        majo.writingLogTimePause = 0
        return 0
    }
    else {
        server.runCommandSilent("/item replace entity "+player.name.string+" weapon.offhand with "+newBook)
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound exposure:misc.write voice @s")
        majo.memorableLog.splice(0,1)
        let logRemain = majo.memorableLog.length
        if (logRemain){
            player.tell({"text":"书写日志……(还有"+logRemain+"条)","color":"green"})
        }
        else {
            player.tell({"text":"回想完成！","color":"green"})
            player.stages.remove("writingDiary")
            majo.writingLogTimePause = 0
            return 1
        }
    }
})

//管理员日志
//右切换
ItemEvents.rightClicked("minecraft:written_book",event =>{
    let player = event.player
    if (player.shiftKeyDown){return 0}
    let item = event.item
    if (item != player.getMainHandItem()){return 0}
    if (item.customData.getString("TransferToType") != "OP_DIARY" || item.customData.getBoolean("Tracing")){return 0}
    let tracingIndex
    if (!item.customData.getInt("TracingIndex")){
        item.setCustomData(item.customData.merge({"TracingIndex":0}))
        tracingIndex = 1
    }
    else {
        tracingIndex = item.customData.getInt("TracingIndex")
        tracingIndex += 1
        if (tracingIndex >= global.majoList.length+1){
            tracingIndex = 1
        }
    }
    item.setCustomName({"text":"日志:"+global.majoList[tracingIndex-1].name,"italic":false})
    let newData = item.customData
    newData["TracingIndex"] = tracingIndex
    item.setCustomData(newData)
})

//左切换
ItemEvents.firstLeftClicked("minecraft:written_book",event =>{
    let player = event.player
    let item = event.item
    if (item != player.getMainHandItem()){return 0}
    if (item.customData.getString("TransferToType") != "OP_DIARY" || item.customData.getBoolean("Tracing")){return 0}
    let tracingIndex
    if (!item.customData.getInt("TracingIndex")){
        item.setCustomData(item.customData.merge({"TracingIndex":0}))
        tracingIndex = 1
    }
    else {
        tracingIndex = item.customData.getInt("TracingIndex")
        tracingIndex -= 1
        if (tracingIndex < 1){
            tracingIndex = global.majoList.length
        }
    }
    item.setCustomName({"text":"日志:"+global.majoList[tracingIndex-1].name,"italic":false})
    let newData = item.customData
    newData["TracingIndex"] = tracingIndex
    item.setCustomData(newData)
})

//填写
ItemEvents.rightClicked("minecraft:written_book",event =>{
    let player = event.player
    if (!player.shiftKeyDown){return 0}
    let item = event.item
    if (item != player.getMainHandItem()){return 0}
    if (item.customData.getString("TransferToType") != "OP_DIARY" || item.customData.getBoolean("Tracing")){return 0}
    let tracingIndex
    if (!item.customData.getInt("TracingIndex")){
        item.setCustomData(item.customData.merge({"TracingIndex":0}))
        tracingIndex = 1
    }
    else {
        tracingIndex = item.customData.getInt("TracingIndex")
    }
    let majo = global.majoList[tracingIndex-1]
    if (!majo.totalLog.length){
        player.tell({"text":"暂无日志。","color":"yellow"})
        return 0
    }
    else {
        let server = event.server
        let newData = item.customData
        let logString = ''
        let weekDayStringTemp = ''
        for (let log of majo.totalLog){
            if (log["weekDayString"] != weekDayStringTemp){
                logString += log["weekDayString"]+JSON.stringify("\\n").slice(1,4)
                weekDayStringTemp = log["weekDayString"]
            }
            logString += numberToStringWithPreZero(log["beginHour"],2)+":"+numberToStringWithPreZero(log["beginMin"],2)+"-"
                        +numberToStringWithPreZero(log["endHour"],2)+":"+numberToStringWithPreZero(log["endMin"],2)+" "+log["structure"].name+JSON.stringify("\\n").slice(1,4)
        }
        let logChar = charUsedInThePage(logString)
        if (logChar > pagesOfBook*charOfPage){
            logString = logString.slice(logchar-pagesOfBook*charOfPage)
            player.tell({"text":"日志过长，较旧的日志已舍弃。","color":"yellow"})
        }
        logString = String(logString)
        let newBook = writeBookPage(item,logString,true)
        console.log(newBook)
        server.runCommandSilent("/item replace entity "+player.name.string+" weapon.mainhand with "+newBook)
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound exposure:misc.write voice @s")
        player.tell({"text":"已读取日志。","color":"green"})
        item = player.getMainHandItem()
        item.setCustomName({"text":"日志:"+global.majoList[tracingIndex-1].name,"italic":false,"color":"light_purple","bold":true})
        newData["TracingIndex"] = tracingIndex
        newData["Tracing"] = true
        item.setCustomData(newData)
    }
})

//擦除
ItemEvents.firstLeftClicked("minecraft:written_book",event =>{
    let player = event.player
    let item = event.item
    if (item != player.getMainHandItem()){return 0}
    if (item.customData.getString("TransferToType") != "OP_DIARY" || !item.customData.getBoolean("Tracing")){return 0}
    let tracingIndex
    if (!item.customData.getInt("TracingIndex")){
        item.setCustomData(item.customData.merge({"TracingIndex":0}))
        tracingIndex = 1
    }
    else {
        tracingIndex = item.customData.getInt("TracingIndex")
    }
    let newData = item.customData
    let server = event.server
    newData["TracingIndex"] = tracingIndex
    newData["Tracing"] = false
    player.setMainHandItem("minecraft:written_book")
    item = player.getMainHandItem()
    item.setCustomName({"text":"日志:"+global.majoList[tracingIndex-1].name,"italic":false})
    item.setCustomData(newData)
    server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound exposure:misc.write voice @s ~ ~ ~ 1 0.5")
    player.tell({"text":"已擦除日志。","color":"yellow"})
})

//续写书页，shouldNew表示是否强制新开书页
function writeBookPage(book,text,shouldNew){
    for (let bookType of ["minecraft:writable_book","minecraft:written_book"]){
        if (!book.is(bookType)){continue}
        let NBT = '\['
        for (let key of Object.keys(book.toNBT()["components"])){
            if (key != bookType+"_content"){
                NBT += key+'='+String(book.toNBT()["components"][key])+','
            }
        }
        let textChar = charUsedInThePage(text)
        if (Object.keys(book.toNBT()["components"]).includes(bookType+"_content")){
            let content = book.toNBT()["components"][bookType+"_content"]
            let author = ''
            let resolved = ''
            let title = ''
            if (bookType == "minecraft:written_book"){
                if (Object.keys(content).includes("author")){
                    author = 'author:'+String(content["author"])+','
                }
                if (Object.keys(content).includes("resolved")){
                    resolved = ',resolved:1b,'
                }
                if (Object.keys(content).includes("title")){
                    title = 'title:{raw:'+String(content["title"]["raw"])+'}'
                }
            }
            let pages = content["pages"]
            let lastPage = String(pages[pages.length-1]['raw'])
            if (bookType == "minecraft:written_book"){
                lastPage = lastPage = lastPage.slice(2).slice(0,lastPage.length-3)
            }
            else {
                lastPage = lastPage.slice(1).slice(0,lastPage.length-2)
            }
            let pageChar = charUsedInThePage(lastPage)
            if (pageChar+textChar > charOfPage || shouldNew){
                if (Math.ceil(textChar/charOfPage) <= pagesOfBook-pages.length){
                    let newPages
                    if (bookType == "minecraft:written_book"){
                        newPages = generateBookNewPage(text,true)
                    }
                    else {
                        newPages = generateBookNewPage(text,false)
                    }
                    NBT += bookType+"_content={"+author+"pages:"+String(pages).slice(0,String(pages).length-1)+","+newPages+"]"+resolved+title+"}]"
                    return bookType+NBT
                }
                else {
                    return null
                }
            }
            else {
                lastPage += text
                pages[pages.length-1]['raw'] = lastPage
                NBT += bookType+"_content={"+author+"pages:"+String(pages)+resolved+title+"}]"
                return bookType+NBT
            }
        }
        else {
            let author = ''
            let resolved = ''
            let title = ''
            if (bookType == "minecraft:written_book"){
                author = 'author:"未知",'
                resolved = ',resolved:1b,'
                title = 'title:{raw:"未知的书籍"}'
            }
            if (Math.ceil(textChar/charOfPage) <= pagesOfBook){
                let newPages
                if (bookType == "minecraft:written_book"){
                    newPages = generateBookNewPage(text,true)
                }
                else {
                    newPages = generateBookNewPage(text,false)
                }
                NBT += bookType+"_content={"+author+"pages:["+newPages+"]"+resolved+title+"}]"
                return bookType+NBT
            }
            else {
                return null
            }
        }
    }
}

//生成新书页
function generateBookNewPage(text,strict){
    let pageCount = Math.ceil(charUsedInThePage(text)/charOfPage)
    let textTemp = text
    let result = ''
    for (let i=0;i<pageCount;i++){
        let charUsed = 0
        let lineRemain = 19
        let lineValid = 14
        let index = 0
        for (let j=0;j<textTemp.length;j++){
            if (i == pageCount-1){
                break
            }
            if (lineValid <= 0){
                index = j+2
                break
            }
            let char = text.codePointAt(j)
            if (isChineseChar(char)){
                if (charUsed + 1.5 > charOfPage){
                    index = j
                    break
                }
                charUsed += 1.5
                if (lineRemain < 1.5){
                    lineRemain = 19
                }
                lineRemain -= 1.5
            }
            else if (char == 0x000A){
                if (charUsed + lineRemain > charOfPage){
                    index = j
                    break
                }
                charUsed += lineRemain
                lineRemain = 19
            }
            else if (char == 0x005C && text.codePointAt(j+1) == 0x005C && text.codePointAt(j+2) == 0x006E && strict){
                if (charUsed + lineRemain> charOfPage){
                    index = j
                    break
                }
                charUsed += lineRemain
                lineRemain = 19
                lineValid -= 1
            }
            else{
                if (charUsed + 1 > charOfPage){
                    index = j
                    break
                }
                charUsed += 1
                if (lineRemain < 1){
                    lineRemain = 19
                }
                lineRemain -= 1
            }
        }
        if (i<pageCount-1){
            if (strict){
                result += '{raw:"\''+textTemp.slice(0,index)+'\'"},'
            }
            else {
                result += '{raw:"'+textTemp.slice(0,index)+'"},'
            }
            textTemp = textTemp.slice(index)
        }
        else {
            if (strict){
                result += '{raw:"\''+textTemp+'\'"},'
            }
            else {
                result += '{raw:"'+textTemp+'"},'
            }
        }
    }
    return String(result)
}

//返回一串字符的占用值
function charUsedInThePage(str) {
    if (str == ''){return 0}
    let charUsed = 0
    let lineRemain = 19
    for (let i=0;i<str.length;i++){
        let char = str.codePointAt(i)
        if (isChineseChar(char)){
            charUsed += 1.5
            if (lineRemain < 1.5){
                lineRemain = 19
            }
            lineRemain -= 1.5
        }
        else if (char == 0x000A){
            charUsed += lineRemain
            lineRemain = 19
        }
        else{
            charUsed += 1
            if (lineRemain < 1){
                lineRemain = 19
            }
            lineRemain -= 1
        }
    }
    return charUsed
}

function isChineseChar(code) {
    return (code >= 0x4e00 && code <= 0x9fff) ||
           (code >= 0x3400 && code <= 0x4DBF) ||
           (code >= 0x20000 && code <= 0x2A6DF) ||
           (code >= 0x2A700 && code <= 0x2B73F) ||
           (code >= 0x2B740 && code <= 0x2B81F) ||
           (code >= 0x2B820 && code <= 0x2CEAF) ||
           (code >= 0xF900 && code <= 0xFAFF) ||
           (code >= 0x2F800 && code <= 0x2FA1F)
}

//自动日记的词库
const flashTimeLogWord = ["经过","路过"]
const shortTimeLogWord = ["暂留在","停留在","去了"]
const longTimeLogWord = ["待在","留在"]