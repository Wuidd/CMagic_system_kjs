
// 数据库类
const SqlTool =Java.loadClass("baios.magicgirl.phone.util.SqlTool")

// 初始化数据库
function dbInit(dbPath,tableName,customColumns){
  try {
        SqlTool.dbInit(dbPath, tableName , customColumns);
        console.log(`自定义表 ${tableName} 创建成功！`);
    } catch (e) {
        console.error("建表失败：" + e.message);
    }
}


// 插入数据库
function dbInsert(dbPath, tableName, data) {
  try {
    SqlTool.insertData(dbPath, tableName, data);
    console.log(`表 ${tableName} 插入数据成功！`);
    return true; 
  } catch (e) {
    console.error("数据插入失败：" + e.message);
    return false; 
  }
}

// 单条数据查询
function dbQuerySingle(dbPath, tableName, whereConditions, columns) {
  columns = columns || "*"
  try {
    var result = SqlTool.querySingle(dbPath, tableName, columns, whereConditions);
    if (result) {
      console.log(`表 ${tableName} 单条查询成功，结果：`, result);
    } else {
      console.log(`表 ${tableName} 未查询到匹配数据！`);
    }
    return result;
  } catch (e) {
    console.error("单条查询失败：" + e.message);
    return null;
  }
}

//  删除数据
function dbDelete(dbPath, tableName, whereConditions) {
  try {
    const affectedRows = SqlTool.deleteData(dbPath, tableName, whereConditions);
    console.log(`表 ${tableName} 删除数据成功，共删除 ${affectedRows} 条记录！`);
    return affectedRows; // 返回删除的行数
  } catch (e) {
    console.error("数据删除失败：" + e.message);
    return 0;
  }
}


ServerEvents.loaded(event => {
  var dbPath = "D:\\Game\\CMagic_client 0.91\\.minecraft\\ch.db";
  var tableName = "player_chat";
  var customColumns = {
    "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
    "player_name": "TEXT NOT NULL",
    "chat_content": "TEXT NOT NULL",
    "send_time": "INTEGER NOT NULL",
    "is_read": "BOOLEAN DEFAULT FALSE"
  };

  // 初始化表
  dbInit(dbPath, tableName, customColumns);

  // 示例：插入一条测试数据
  var testData = {
    "player_name": "测试玩家",
    "chat_content": "这是一条测试聊天消息",
    "send_time": Math.floor(Date.now() / 1000),
    "is_read": false
  };
  dbInsert(dbPath, tableName, testData);

  // 示例：查询单条数据
  var queryCondition = { "player_name": "测试玩家" };
  var singleResult = dbQuerySingle(dbPath, tableName, queryCondition);

  // 示例：删除测试数据
  // var deleteRows = dbDelete(dbPath, tableName, { "player_name": "测试玩家" });
})

