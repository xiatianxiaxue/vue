let express = require('express')
let router = express.Router();
let fs=require('fs');
let pathLib=require('path');
let mgdb=require('../../utils/mgdb');
let bcrypt=require('../../utils/bcrypt');


//注册
router.post('/',(req,res,next)=>{
  //1. 获取 username  password nikename icon
  let {username,password,nikename}=req.body;

  //2.必传参数做校验  username password
  if(!username || !password){
    res.send({
      err:1,
      msg:'用户名和密码是必传参数'
    })
    return;
  }

  //3.整理其他未来需要入库的参数  time nikename 头像|默认头像  存到对应服务器磁盘  follow fans
  nikename =nikename || '昵称'; //npm  下载一些自动生成昵称的包
  let follow=0;  //关注数
  let fans=0;  //粉丝数
  let time=Date.now(); //服务器生成注册时间

  let icon ='/upload/default.jpg';  //默认头像

  if(req.files && req.files.length>0){
    //图片加后缀  覆盖默认头像
    //改名
    fs.renameSync(
      req.files[0].path,
      req.files[0].path+pathLib.parse(req.files[0].originalname).ext
    )
    //覆盖默认头像
    icon='/upload/user/'+req.files[0].filename +pathLib.parse(req.files[0].originalname).ext
    
  }
  //4 兜库  用户名是否存在  的校验
  // console.log('43',username,password,nikename,icon);
  //4.1 连接库 open
  mgdb.open({
    dbName:'1927',
    collectionName:'user'
  }).then(
    ({ collection,client})=>{
      //4.2查询
      collection.find({username}).toArray((err,result)=>{
        if(err){
          res.send({err:1,msg:'集合操作失败'})
          client.close()
        }else{
          if(result.length===0){
            //4.2.2 用户不存在  参数入库
            //密码加密
            password=bcrypt.hashSync(password)

            //入库
            collection.insertOne({
              username,password,nikename,time,icon,fans,follow
            },(err,result)=>{
              if(!err){
              // 插入后的信息  返回给客户端   不含usernam password
              delete result.ops[0].username;
              delete result.ops[0].password;

              res.send({
                err:0,
                msg:'注册成功',
                data:result.ops[0]
              })
              }else{   //入库失败
                res.send({err:1,msg:'注册失败'})
              }
              client.close()
            })
          }else{
          //4.2.1 用户存在 删除后的头像 不能删除默认头像
            if(icon.indexOf('default')===-1){
              fs.unlinkSync('./public'+icon)
            }
            res.send({err:1,msg:'用户名已存在'})
            client.close()
          }
        }
      })

    }
  ).catch(
    err=>{
      res.send({err:1,msg:'库连接失败'})
    }
  )
})

module.exports = router;