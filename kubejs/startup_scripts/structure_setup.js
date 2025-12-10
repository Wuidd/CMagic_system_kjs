//结构的类

function Structure(name,area,level){
    this.name = name
    this.area = area
    this.level = level
    this.waterRedirect = null
    this.waterAlt = null
    this.attachTo = null
}

//结构

const canteen = new Structure("食堂",[[[17,36,-82],[37,43,-50]]],"minecraft:overworld")
const kitchen = new Structure("厨房",[[[37,36,-83],[20,43,-91]]],"minecraft:overworld")
const trialchamber_hallway = new Structure("审判庭入口走廊",[[[7,37,-75],[16,44,-15]],[[17,37,-48],[37,44,-15]],[[4,37,-25],[6,44,-19]],[[38,37,-43],[74,41,-39]]],"minecraft:overworld")
const trialchamber = new Structure("审判庭",[[[47,37,-90],[95,60,-42]]],"minecraft:overworld")
const entrancehall = new Structure("玄关大厅",[[[-27,36,-45],[-20,44,-15]],[[-19,37,-40],[3,44,-15]]],"minecraft:overworld")
const entrancehall_hallway = new Structure("玄关门道",[[[-27,36,-14],[-21,44,-6]]],"minecraft:overworld")
entrancehall_hallway.attachTo = entrancehall
const entrancehall_stairs = new Structure("玄关楼梯",[[[-19,37,-45],[2,46,-41]],[[-15,47,-45],[2,55,-36]]],"minecraft:overworld")
const firstfloor_hallway = new Structure("一楼外侧走廊",[[[-102,37,-83],[-96,44,-23]],[[-96,37,-29],[-90,44,-24]],[[-95,37,-23],[-90,44,-15]],[[-89,37,-19],[-28,44,-15]]],"minecraft:overworld")
const receptionroom = new Structure("接客室",[[[-50,35,-37],[-28,44,-23]]],"minecraft:overworld")
const parlor_hallway = new Structure("会客厅走廊",[[[-27,37,-78],[-19,44,-46]]],"minecraft:overworld")
const parlor = new Structure("会客厅",[[[-38,36,-109],[-8,44,-79]]],"minecraft:overworld")
const courtyard = new Structure("中庭",[[[-72,36,-76],[-30,46,-40]]],"minecraft:overworld")
const courtyard_hallway = new Structure("中庭入口走廊",[[[-95,37,-85],[-39,44,-76]],[[-57,37,-78],[-49,43,-77]]],"minecraft:overworld")
const toilet = new Structure("卫生间",[[[-50,36,-109],[-41,44,-86]]],"minecraft:overworld")
const sundrypile = new Structure("杂物处",[[[-61,37,-109],[-52,44,-86]]],"minecraft:overworld")
sundrypile.attachTo = courtyard_hallway
const medicroom = new Structure("医务室",[[[-93,36,-109],[-64,43,-86]]],"minecraft:overworld")
const bathroom = new Structure("淋浴室",[[[-92,36,-78],[-75,43,-33]],[[-86,37,-32],[-75,43,-22]]],"minecraft:overworld")
const warehouse = new Structure("仓库",[[[-127,36,-143],[-99,41,-123]]],"minecraft:overworld")
const fireelehouse = new Structure("火精之室",[[[28,36,-149],[38,42,-143]],[[29,43,-149],[37,45,-143]],[[31,46,-149],[35,49,-143]]],"minecraft:overworld")
const waterelehouse = new Structure("水精之室",[[[51,38,-149],[61,42,-143]],[[52,43,-149],[60,45,-143]],[[54,46,-149],[58,9,-143]]],"minecraft:overworld")
const earthelehouse = new Structure("地精之室",[[[76,36,-149],[86,42,-143]],[[77,43,-149],[85,45,-143]],[[79,46,-149],[83,49,-143]]],"minecraft:overworld")
const basement_hallway = new Structure("地下室电梯走廊",[[[52,28,-148],[63,33,-101]],[[57,28,-149],[58,37,-149]]],"minecraft:overworld")
const basement_elevator = new Structure("地下室电梯",[[[52,-58,-100],[63,40,-94]]],"minecraft:overworld")
const basement_operateroom_hallway = new Structure("地下控制室走廊",[[[54,-11,-108],[61,-5,-101]]],"minecraft:overworld")
basement_operateroom_hallway.attachTo = basement_operateroom
const basement_ventilation = new Structure("通风管道",[[[53,-8,-120],[66,-8,-124]]],"minecraft:overworld")
const basement_operateroom = new Structure("地下控制室",[[[51,-11,-119],[62,-5,-109]]],"minecraft:overworld")
const basement_freezeroom = new Structure("地下冷冻室",[[[65,-11,-119],[94,-3,-75]],[[63,-12,-116],[64,-9,-115]]],"minecraft:overworld")
const secfloor_hallway = new Structure("二楼走廊",[[[-28,47,-104],[-16,55,-15]],[[-94,47,-19],[45,55,-15]],[[-101,47,-110],[-17,55,-105]],
                                    [[-101,47,-104],[-96,55,-24]],[[-95,47,-29],[-89,55,-25]],[[-94,47,-24],[-89,55,-15]]],"minecraft:overworld")
const studio = new Structure("画室",[[[-73,46,-39],[-29,54,-22]]],"minecraft:overworld")
const studio_balcony = new Structure("画室阳台",[[[-57,46,-43],[-49,54,-40]]],"minecraft:overworld")
studio_balcony.attachTo = studio
const library = new Structure("图书室",[[[6,46,-75],[42,60,-23]],[[8,61,-75],[41,66,-23]],[[22,47,-22],[26,52,-20]]],"minecraft:overworld")
const entertainmentroom = new Structure("娱乐室",[[[-88,46,-97],[-75,54,-60]],[[-74,47,-97],[-29,54,-77]]],"minecraft:overworld")
const entertainmentroom_balcony = new Structure("娱乐室阳台",[[[-57,46,-76],[-49,54,-73]]],"minecraft:overworld")
entertainmentroom_balcony.attachTo = entertainmentroom
const jail_hall = new Structure("地牢大厅",[[[-6,19,-84],[3,25,-66]]],"minecraft:overworld")
const jail_stairs = new Structure("地牢楼梯",[[[7,19,-74],[16,36,-65]],[[4,18,-73],[6,25,-71]]],"minecraft:overworld")
const jail_hallway = new Structure("牢房走廊",[[[-66,19,-94],[3,26,-85]]],"minecraft:overworld")
const jail_rooms = new Structure("牢房",[[[-65,18,-102],[1,26,-95]]],"minecraft:overworld")
const incinerateroom = new Structure("焚烧炉室",[[[-79,19,-34],[-70,25,-26]]],"minecraft:overworld")
const incinerateroom_hallway = new Structure("焚烧炉室走廊",[[[-77,19,-75],[-72,25,-35]],[[-71,19,-75],[-7,25,-70]]],"minecraft:overworld")
const punishroom = new Structure("惩罚室",[[[5,16,-54],[41,28,-19]]],"minecraft:overworld")
const punishroom_hallway = new Structure("惩罚室走廊",[[[-6,19,-65],[4,25,-31]]],"minecraft:overworld")

const lake = new Structure("湖中",[[[32,20,128],[47,47,191]],[[48,20,128],[63,47,191]],[[64,20,112],[79,47,143]],
                                [[64,20,176],[79,47,191]],[[80,20,112],[95,47,143]],[[80,20,176],[95,47,191]],
                                [[96,20,48],[111,47,191]],[[112,20,48],[127,47,191]]
                            ],"minecraft:overworld")
lake.waterAlt = 35
lake.attachTo = lake_side
const lake_island = new Structure("湖心岛",[[[64,20,144],[95,47,175]]],"minecraft:overworld")
lake_island.waterRedirect = lake
const lake_side = new Structure("湖畔",[[[16,20,112],[31,47,207]],[[32,20,96],[47,47,127]],
                                [[32,20,192],[47,47,223]],[[48,20,96],[63,47,127]],[[48,20,192],[63,47,223]],
                                [[64,20,96],[79,47,111]],[[64,20,192],[79,47,207]],[[80,20,32],[95,47,111]],
                                [[80,20,192],[95,47,207]],[[96,20,32],[111,47,47]],[[96,20,192],[111,47,207]],
                                [[112,20,32],[127,47,47]],[[112,20,192],[127,47,207]],[[128,20,32],[143,47,207]],
                                [[144,20,48],[152,47,175]]
                            ],"minecraft:overworld")
lake_side.waterRedirect = lake

const windmill = new Structure("风车",[[[-313,44,94],[-284,102,123]]],"minecraft:overworld")

const test1 = new Structure("测试1",[[[155,-59,45],[156,-57,47]]],"minecraft:overworld")
const test2 = new Structure("测试2",[[[157,-59,45],[159,-57,47]]],"minecraft:overworld")

//结构表

global.structureList = [canteen,kitchen,trialchamber,trialchamber_hallway,entrancehall,entrancehall_hallway,entrancehall_stairs,firstfloor_hallway,receptionroom,
    parlor,parlor_hallway,courtyard,courtyard_hallway,toilet,sundrypile,medicroom,bathroom,warehouse,fireelehouse,waterelehouse,earthelehouse,
    basement_hallway,basement_elevator,basement_operateroom,basement_operateroom_hallway,basement_freezeroom,secfloor_hallway,studio,studio_balcony,library,entertainmentroom,
    entertainmentroom_balcony,jail_hall,jail_hallway,jail_rooms,jail_stairs,incinerateroom,incinerateroom_hallway,punishroom,punishroom_hallway,
    lake,lake_island,lake_side,windmill
]

//可明确回忆的结构表

global.memorableStructureList = [canteen,kitchen,trialchamber,trialchamber_hallway,entrancehall,entrancehall_hallway,receptionroom,
    parlor,courtyard,courtyard_hallway,toilet,sundrypile,medicroom,bathroom,warehouse,fireelehouse,waterelehouse,earthelehouse,
    basement_operateroom,basement_operateroom_hallway,basement_freezeroom,studio,studio_balcony,library,entertainmentroom,
    entertainmentroom_balcony,jail_hallway,jail_rooms,incinerateroom,punishroom,lake,lake_island,lake_side,windmill
]

//检查点的类

function CheckPoint(name,area,level,inside,outside,type){
    this.name = name
    this.area = area
    this.level = level
    this.inside = inside
    this.outside = outside
    this.type = type
}

//检查点

const entrancehall_door = new CheckPoint("宅邸大门",[[[-27,37,-5],[-21,44,-3]]],"minecraft:overworld",entrancehall_hallway,null,"OUTDOORS")
const medicroom_door = new CheckPoint("医务室后门",[[[-94,37,-106],[-94,39,-105]]],"minecraft:overworld",medicroom,null,"OUTDOORS")
const warehouse_door = new CheckPoint("仓库大门",[[[-106,36,-123],[-105,37,-123]]],"minecraft:overworld",warehouse,null,"OUTDOORS")
const fireelehouse_door = new CheckPoint("火精之室大门",[[[35,38,-142],[35,39,-142]]],"minecraft:overworld",fireelehouse,null,"OUTDOORS")
const waterelehouse_door = new CheckPoint("水精之室大门",[[[58,38,-142],[58,39,-142]]],"minecraft:overworld",waterelehouse,null,"OUTDOORS")
const earthelehouse_door = new CheckPoint("地精之室大门",[[[83,38,-142],[83,39,-142]]],"minecraft:overworld",earthelehouse,null,"OUTDOORS")
const courtyard_upface = new CheckPoint("中庭上方",[[[-72,46,-76],[-30,46,-40]]],"minecraft:overworld",courtyard,null,"OUTDOORS")
const studio_balcony_door = new CheckPoint("画室阳台门",[[[-54,47,-39],[-52,50,-39]]],"minecraft:overworld",studio,studio_balcony,"OUTDOORS")
const entertainmentroom_balcony_door = new CheckPoint("娱乐室阳台门",[[[-55,47,-77],[-51,50,-77]]],"minecraft:overworld",entertainmentroom,entertainmentroom_balcony,"OUTDOORS")

global.checkPointOutDoors = [entrancehall_door,medicroom_door,warehouse_door,fireelehouse,waterelehouse_door,earthelehouse_door,courtyard_upface,studio_balcony_door,entertainmentroom_balcony_door]