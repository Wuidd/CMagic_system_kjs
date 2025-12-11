// priority:12
//特殊书籍

const columnOfPage = 19 //书页的列
const lineOfPage = 14 //书页的行
const charOfPage = 266 //书页上限字符量
const pagesOfBook = 100 //最大书页数
const writingDiaryTimePause = 40 //书写一条日志的间隔
const translateInfoPlace = "图书室" //可提供破译资料的位置

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

//翻译书籍
ServerEvents.commandRegistry(event =>{
    let {arguments:arg,commands:cmd} = event
    function translateTo(player,book,language,replace,server){
        let op = isOperator(player)
        if (!op){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        if (!book.is("minecraft:writable_book") && !book.is("minecraft:written_book")){
            player.tell({"text":"未识别到书籍。","color":"yellow"})
            return 0
        }
        if (language != "lojban" && language != "chinese"){
            player.tell({"text":"未知的语言。","color":"yellow"})
            return 0
        }
        let newBook = translate(book,language,{})
        if (!newBook){
            player.tell({"text":"无可转译的内容。","color":"yellow"})
            return 0
        }
        else {
            if (!replace){
                player.tell({"text":"转译完成。","color":"green"})
                server.runCommandSilent("/give "+player.name.string+" "+newBook)
            }
            else {
                player.tell({"text":"转译完成。","color":"green"})
                server.runCommandSilent("/item replace entity "+player.name.string+" weapon.mainhand with "+newBook)
            }
        }
    }
    event.register(
        cmd.literal('translate-to')
        .then(cmd.argument('language',arg.STRING.create(event))
        .executes(cmd =>{
            let player = cmd.source.playerOrException
            let book = player.getMainHandItem()
            let language = arg.STRING.getResult(cmd,'language')
            let server = cmd.source.server
            translateTo(player,book,language,false,server)
            return 1
        })
        .then(cmd.argument('replace',arg.BOOLEAN.create(event))
        .executes(cmd =>{
            let player = cmd.source.playerOrException
            let book = player.getMainHandItem()
            let language = arg.STRING.getResult(cmd,'language')
            let replace = arg.BOOLEAN.getResult(cmd,'replace')
            let server = cmd.source.server
            translateTo(player,book,language,replace,server)
            return 1
        })))
    )
})

ServerEvents.commandRegistry(event =>{
    let {arguments:arg,commands:cmd} = event
    function setTranslateBook(player){
        let op = isOperator(player)
        if (!op){
            player.tell({"text":"无权使用。","color":"red"})
            return 0
        }
        let book = player.getMainHandItem()
        if (book.is("minecraft:writable_book") && book.is("minecraft:written_book")){
            player.tell({"text":"未识别到书籍。","color":"yellow"})
            return 0
        }
        if (!book.customData.getString("TransferToType")){
            book.setCustomData(book.customData.merge({"TransferToType":"TRANSLATE"}))
            player.tell({"text":"已将书籍设为合法译本。","color":"green"})
            return 0
        }
        else {
            player.tell({"text":"书籍已为合法译本或已为其它笔记本。","color":"yellow"})
            return 0
        }
    }
    event.register(
        cmd.literal("setTranslateBook")
        .executes(cmd =>{
            let player = cmd.source.player
            setTranslateBook(player)
            return 0
        })
    )
})

//译本增添
ItemEvents.rightClicked("minecraft:writable_book",event =>{
    if (!isMajoProgressing){return 0}
    let player = event.player
    let majo = isMajoPlayer(player)
    if (!majo){return 0}
    let book = player.getOffHandItem()
    if (book.customData.getString("TransferToType") != "TRANSLATE"){return 0}
    let server = event.server
    if (!player.stages.has("Decipher")){
        if (!inSpecificStructure(player,translateInfoPlace)){return 0}
        let existKeys = readTranslateKeys(book)
        if (!existKeys){
            existKeys = {}
        }
        let queryDict = findCompKey(existKeys,global.lojDict)
        let queryDictKeys = Object.keys(queryDict)
        if (!queryDictKeys.length){
            player.tell({"text":"你已经完全掌握了这门诡谲的语言……这怎么可能？","color":"light_purple"})
            player.closeMenu()
            return 0
        }
        let queryKey = queryDictKeys[Math.floor(Math.random()*queryDictKeys.length)]
        let queryValue = queryDict[queryKey]
        majo.decipher["decipherBook"] = getItemStringRepresent(book)
        majo.decipher["target"] = queryValue
        majo.decipher["answer"] = queryKey
        majo.decipher["tryLeft"] = 6
        majo.decipher["try"] = []
        if (majo.name == "宝生玛格"){
            majo.decipher["tryLeft"] = 7
        }
        player.stages.add("Decipher")
        player.tell({"text":"你搜罗了一些资料，开始尝试破译……","color":"yellow"})
        player.tell({"text":"根据资料，「"+queryValue+"」可能对应一个「"+queryKey.length+"」个字母长的单词。","color":"yellow"})
        printDecipherTry(majo)
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
        player.closeMenu()
    }
    else {
        player.stages.remove("Decipher")
        player.tell({"text":"放弃破译了。","color":"yellow"})
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
        player.closeMenu()
    }
})

function tryDeciphering(majo,guess,server){
    let player = majo.player
    let book = player.getOffHandItem()
    if (player.stages.has("Decipher") && !majo.decipher["target"]){
        player.stages.remove("Decipher")
    }
    if (getItemStringRepresent(book) != majo.decipher["decipherBook"]){
        player.stages.remove("Decipher")
        player.tell({"text":"放弃破译了。","color":"yellow"})
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
    }
    let answer = majo.decipher["answer"]
    let guessResult = []
    for (let i=0;i<guess.length;i++){
        let guessChar = guess.charAt(i)
        let answerChar = answer.charAt(i)
        if (guessChar === answerChar){
            guessResult.push({
                "char":guessChar,
                "result":"CORRECT"
            })
        }
        else {
            let match = answer.match(new RegExp(guessChar))
            if (!match){
                guessResult.push({
                    "char":guessChar,
                    "result":"WRONG"
                })
            }
            else {
                let alreadyMatch = 0
                for (let result of guessResult){
                    if (result["char"] == guessChar && (result["result"] == "CORRECT" || result["result"] == "CONTAIN")){
                        alreadyMatch ++
                    }
                }
                if (alreadyMatch < match.length){
                    guessResult.push({
                        "char":guessChar,
                        "result":"CONTAIN"
                    })
                }
                else {
                    guessResult.push({
                        "char":guessChar,
                        "result":"WRONG"
                    })
                }
            }
        }
    }
    let tryLog = ''
    let allCorrect = 0
    majo.decipher["tryLeft"] --
    for (let result of guessResult){
        switch(result["result"]){
            case "CORRECT":
                tryLog += "§a["+result["char"]+"]§f"
                allCorrect ++
                break
            case "CONTAIN":
                tryLog += "§e["+result["char"]+"]§f"
                break
            case "WRONG":
                tryLog += "§7["+result["char"]+"]§f"
                break
        }
    }
    majo.decipher["try"].push(tryLog)
    printDecipherTry(majo)
    if (allCorrect >= answer.length){
        player.stages.remove("Decipher")
        player.tell({"text":"破译成功了！","color":"green"})
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bell voice @s")
        let newKey = "\n\""+majo.decipher["answer"]+"\":\""+majo.decipher["target"]+"\""
        let newBook = writeBookPage(book,newKey,false)
        if (!newBook){
            player.tell({"text":"已经知道了新的正确匹配「"+newKey+"」,但是笔记本已经写不下了……","color":"yellow"})
        }
        else {
            server.runCommandSilent("/item replace entity "+player.name.string+" weapon.offhand with "+newBook)
        }
    }
    if (majo.decipher["tryLeft"] <= 0){
        player.stages.remove("Decipher")
        player.tell({"text":"没破译出来呢……","color":"yellow"})
        server.runCommandSilent("/execute as "+player.name.string+" at @s run playsound minecraft:block.note_block.bass voice @s")
    }
}

function printDecipherTry(majo){
    let player = majo.player
    player.tell(' ')
    player.tell({"text":"目标「"+majo.decipher["target"]+"」 词长「"+majo.decipher["answer"].length+"」剩余尝试「"+majo.decipher["tryLeft"]+"」","color":"yellow"})
    if (majo.decipher["try"].length){
        for (let t of majo.decipher["try"]){
            player.tell(t)
        }
    }
    player.tell(' ')
}

//译本阅读
ItemEvents.rightClicked("minecraft:written_book",event =>{
    if (!isMajoProgressing){return 0}
    tryTranslating(event)
})

ItemEvents.rightClicked("minecraft:writable_book",event =>{
    if (!isMajoProgressing){return 0}
    tryTranslating(event)
})

function tryTranslating(event){
    let player = event.player
    let server = event.server
    let mainBook = player.getMainHandItem()
    if (!mainBook.is("minecraft:writable_book") && !mainBook.is("minecraft:written_book")){return 0}
    if (mainBook.customData.getString("TransferToType") == "TRANSLATE"){
        player.tell({"text":"这好像也是一份译本……","color":"yellow"})
        return 0
    }
    let offBook = player.getOffHandItem()
    if (offBook.customData.getString("TransferToType") != "TRANSLATE"){
        if (mainBook.customData.getBoolean("Translated")){
            let originalVersion = mainBook.customData.getString("OriginalVersion")
            if (!originalVersion){return 0}
            server.runCommandSilent("/item replace entity "+player.name.string+" weapon.mainhand with "+originalVersion)
            mainBook = player.getMainHandItem()
            mainBook.setCustomData(mainBook.customData.merge({"Translated":false,"OriginalVersion":''}))
        }
        return 0
    }
    let translateDict = readTranslateKeys(offBook)
    if (!translateDict){
        player.tell({"text":"译本好像没什么帮助……","color":"yellow"})
        return 0
    }
    else {
        let newMainBook = translate(mainBook,"chinese",translateDict)
        let originalVersion = mainBook.customData.getString("OriginalVersion")
        if (!originalVersion){
            originalVersion = getItemStringRepresent(mainBook)
        }
        server.runCommandSilent("/item replace entity "+player.name.string+" weapon.mainhand with "+newMainBook)
        mainBook = player.getMainHandItem()
        mainBook.setCustomData(mainBook.customData.merge({"Translated":true,"OriginalVersion":originalVersion}))
    }
}

//翻译书本内容
function translate(book,toLanguage,keyWords){
    for (let bookType of ["minecraft:writable_book","minecraft:written_book"]){
        if (!book.is(bookType)){continue}
        let keys = Object.keys(keyWords)
        let NBT = '\['
        for (let key of Object.keys(book.toNBT()["components"])){
            if (key != bookType+"_content"){
                NBT += key+'='+String(book.toNBT()["components"][key])+','
            }
        }
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
            let newPages = ''
            for (let i=0;i<pages.length;i++){
                let text = ''
                for (let j=i;j<pages.length;j++){
                    let newText = String(pages[j]["raw"])
                    let newTextChar
                    if (bookType == "minecraft:written_book"){
                        newText = newText.slice(2).slice(0,newText.length-4)
                        newTextChar = charUsedInThePage(newText)
                    }
                    else {
                        newText = newText.slice(1).slice(0,newText.length-2)
                        newTextChar = charUsedInThePage(newText)
                    }
                    text += newText
                    if (newTextChar < 252){
                        break
                    }
                    else {
                        i=j+1
                    }
                }
                if (toLanguage == "chinese"){
                    if (!keys.length){
                        for (let keyWord of global.lojDictKeys){
                            let regex = new RegExp('\\b'+keyWord+'\\s+',"g")
                            text = text.replace(regex,match => global.lojDict[keyWord] || match)
                        }
                    }
                    else {
                        for (let keyWord of keys){
                            let regex = new RegExp('\\b'+keyWord+'\\s+',"g")
                            text = text.replace(regex,match => keyWords[keyWord] || match)
                        }
                    }
                }
                else if (toLanguage == "lojban"){
                    if (!keys.length){
                        for (let keyWord of Object.keys(global.lojDictReverse)){
                            let regex = new RegExp(`\\b(${keyWord})\\b`,"g")
                            text = text.replace(regex,match => global.lojDictReverse[match]+' ' || match)
                        }
                    }
                    else {
                        for (let keyWord of keys){
                            let regex = new RegExp(`\\b(${keyWord})\\b`,"g")
                            text = text.replace(regex,match => keyWords[match]+' ' || match)  
                        }
                    }
                }
                if (bookType == "minecraft:written_book"){
                    newPages += generateBookNewPage(text,true)
                }
                else {
                    newPages += generateBookNewPage(text)
                }
                if (i < pages.length-1){
                    newPages += ','
                }
            }
            NBT += bookType+"_content={"+author+"pages:\["+String(newPages)+"]"+resolved+title+"}]"
            return bookType+NBT
        }
        else {
            return null
        }
    }
}

//获得物品的文本代表
function getItemStringRepresent(item){
    let NBT = '\['
    for (let key of Object.keys(item.toNBT()["components"])){
        NBT += key+'='+String(item.toNBT()["components"][key])+','
    }
    NBT += ']'
    return String(item.item)+NBT
}

//读取译本键
function readTranslateKeys(book){
    for (let bookType of ["minecraft:writable_book","minecraft:written_book"]){
        if (!book.is(bookType)){continue}
        if (Object.keys(book.toNBT()["components"]).includes(bookType+"_content")){
            let content = book.toNBT()["components"][bookType+"_content"]
            let pages = content["pages"]
            let text = ''
            for (let page of pages){
                let newText = String(page["raw"])
                if (bookType == "minecraft:written_book"){
                    newText = newText.slice(2).slice(0,newText.length-4)
                }
                else {
                    newText = newText.slice(1).slice(0,newText.length-2)
                }
                text += newText
            }
            let rawKeys = text.match(/["“][^"“”]+["”][:：]["“][^"“”]+["”]/g)
            if (!rawKeys){return null}
            let rawDict = {}
            for (let rawKey of rawKeys){
                let match = rawKey.match(/["“][^"“”]+["”]/g)
                let key = String(match[0]).slice(1,-1)
                let value = String(match[1]).slice(1,-1)
                rawDict[key] = value
            }
            if (!Object.keys(rawDict).length){return null}
            let finalDict = findCommonKey(rawDict,global.lojDict)
            if (!Object.keys(finalDict).length){return null}
            return finalDict
        }
        else {
            return null
        }
    }
}

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
        let textChar
        if (bookType == "minecraft:written_book"){
            textChar = charUsedInThePage(text)
        }
        else {
            textChar = charUsedInThePage(text)
        }
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
            let pageChar
            if (bookType == "minecraft:written_book"){
                lastPage = lastPage = lastPage.slice(2).slice(0,lastPage.length-4)
                pageChar = charUsedInThePage(lastPage)
            }
            else {
                lastPage = lastPage.slice(1).slice(0,lastPage.length-2)
                pageChar = charUsedInThePage(lastPage)
            }
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
                NBT += bookType+"_content={"+author+"pages:\["+newPages+"]"+resolved+title+"}]"
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
                result += '{raw:"\''+textTemp+'\'"}'
            }
            else {
                result += '{raw:"'+textTemp+'"}'
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

//字典取交
function findCommonKey(smallDict,bigDict){
    const result = {}
    const dictMap = new Map(Object.entries(bigDict))
    for (const [key,value] of Object.entries(smallDict)){
        if (dictMap.has(key) && dictMap.get(key) == value){
            result[key] = value
        }
    }
    return result
}

//字典取补
function findCompKey(smallDict,bigDict){
    let result = {}
    for (let key of Object.keys(bigDict)) {
        if (!(key in Object.keys(smallDict)) || bigDict[key] != smallDict[key]){
            result[key] = bigDict[key];
        }
    }
    return result
}

//自动日记的词库
const flashTimeLogWord = ["经过","路过"]
const shortTimeLogWord = ["暂留在","停留在","去了"]
const longTimeLogWord = ["待在","留在"]