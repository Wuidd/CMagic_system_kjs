//角色卡的类

function Majo(name,height,color,token,physique,mentality){
    this.player = null
    this.name = name
    this.token = token
    this.physique = physique
    this.mentality = mentality
    this.color = color
    
    this.maxHealth = Math.round(6+0.04*physique)
    this.recoverMulti = 0.02*physique
    this.speedMulti = 0.0006*physique
    this.scaleMulti = height/180
    
    this.maxFatigue = 6000+200*physique+30*mentality
    this.fatigueMulti = 1.5-0.01*physique
    this.fatigueMultiFromPressure = 1
    this.gaspTimePause = 0
    this.exhausted = false

    this.maxPressure = 150000+1000*mentality+200*physique
    this.pressureMulti = 1.5-0.01*mentality
    this.faint = false
    
    this.majolizeMulti = 1.3-0.01*mentality
    this.majolize = 10000+40*mentality
    this.debris = 13000+40*mentality
    this.majolizeScore = 0
    this.extraMajolizeMulti = 1

    this.scoreHolder = null
    this.selectedSlot = null
}

//角色卡

const sakuraba_ema = new Majo("樱羽艾玛",156,'§d',"mocai:ema_sakura",60,100)
const nikaido_hiro = new Majo("二阶堂希罗",157,'§c',"mocai:hiro_red_lily",90,100)
const sawatari_koko = new Majo("泽渡可可",158,"§6","mocai:coco_headphone",40,60)
const tachibana_sheri = new Majo("橘雪莉",162,"§1","mocai:sheri_magnifying_glass",100,100)
const tono_hanna = new Majo("远野汉娜",148,"§a","mocai:hannaheaddressflower",80,40)
const natsume_anan = new Majo("夏目安安",145,"§9","mocai:anan_drawing_book",20,50)
const jogasaki_noa = new Majo("城崎诺亚",150,"§b","mocai:noacolorpalette",30,70)
const hasumi_reia = new Majo("莲见蕾雅",172,"§e","mocai:reia_crown",90,70)
const saeki_miria = new Majo("佐伯米莉亚",163,"§e","mocai:milia_bowknot",50,80)
const kurobe_nanoka = new Majo("黑部奈叶香",161,"§8","mocai:nanoka_hair_band",80,80)
const hosho_mago = new Majo("宝生玛格",160,"§5","mocai:margo_tarot",50,90)
const shito_arisa = new Majo("紫藤亚里沙",154,"§4","mocai:arisa_anklet",60,40)
const hikami_meruru = new Majo("冰上梅露露",158,"§f","mocai:meruru_cross",40,80)

//登记的将生效的角色卡

global.majoList = [sakuraba_ema,nikaido_hiro,sawatari_koko,tachibana_sheri,
tono_hanna,natsume_anan,jogasaki_noa,hasumi_reia,saeki_miria,
kurobe_nanoka,hosho_mago,shito_arisa,hikami_meruru]

//vector3到近似整数数组的变化

global.vecToArr = function(vec3){
    let Arr = [vec3.x,vec3.y,vec3.z]
    Arr.forEach((cor,index) => Arr[index] = Math.round(cor))
    return Arr
}

//从魔女名字检索玩家

global.majoPlayerIs = function(name){
    for (let majo of global.majoList){
        if (majo.name == name){return majo.player}
    }
}

//从魔女名字检索魔女

global.findMajo = function(name){
    for (let majo of global.majoList){
        if (majo.name == name){return majo}
    }
}

//是否为魔女玩家，如果是，返回魔女角色

global.isMajoPlayer = function(player){
    try {
        if (typeof player == "string"){
            for (let majo of global.majoList){
                if (majo.player){
                    if (player == majo.player.name.string){return majo}
                }
            }
            return null
        }
    }
    finally {
        for (let majo of global.majoList){
            if (majo.player){
                if (player.name.string == majo.player.name.string){return majo}
            }
        }
        return null
    }
}

//搜索指定名字的计分板代表

global.findScoreHolder = function(server,name){
    let trackedPlayers = server.scoreboard.getTrackedPlayers()
    if (trackedPlayers){
        for (let player of trackedPlayers){
            if (player){
                return player.forNameOnly(name)
            }
            return null
        }
    }
    return null
}