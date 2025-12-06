//场务的类

function Operator(defaultUsername,name,color){
    this.username = defaultUsername
    this.name = name
    this.color = color
    this.player = null
}

//场务

const tsukishiro_yuki = new Operator("NoStay","月代雪","§f")
const owl_1 = new Operator("name_means_game","典狱长","§8")
const owl_2 = new Operator("Ice_sparkle","典狱长","§8")
const narrator = new Operator("v_t_4","旁白","§f")
const guard = new Operator("0yiyu0","看守","§8")
const testor = new Operator("PLTaube","测试人员","§e")
const filmer = new Operator("RevontuleTan","摄影","§e")

//场务的特殊参数

tsukishiro_yuki.flipTrigger = 0

//生效的场务表

global.operatorList = [tsukishiro_yuki,owl_1,owl_2,guard,narrator,filmer]