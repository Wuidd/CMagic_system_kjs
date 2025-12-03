//场务的类

function Operator(username,name){
    this.username = username
    this.name = name
    this.player = null
}

//场务

const tsukishiro_yuki = new Operator("NoStay","月代雪")
const owl_1 = new Operator("name_means_game","典狱长")
const owl_2 = new Operator("Ice_sparkle","典狱长")
const narrator = new Operator("v_t_4","旁白")
const guard = new Operator("0yiyu0","看守")
const testor = new Operator("PLTaube","测试人员")

//场务的特殊参数

tsukishiro_yuki.flipTrigger = 0

//生效的场务表

global.operatorList = [tsukishiro_yuki,owl_1,owl_2,guard]