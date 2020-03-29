let express = require('express')
let router = express.Router();
let mgdb=require('../../utils/mgdb');

//列表
router.get('/:goodsname',(req,res,next)=>{
  //判断有否含有_id参数，分出业务到详情
  if(req.query._id){
    console.log('req.url',req.url);
    res.redirect(`/api/goods/${req.params.goodsname}/${req.query._id}`);   //后端跳转
    return;
  }
  //查询业务
  let collectionName=req.params.goodsname;  //要操作的集合
  let {_page,_limit,q,_sort}=req.query;   //获取默认的参数或手动传递参数

  mgdb.findList({
    collectionName,_page,_limit,_sort,q
  }).then(
    reault=>res.send(reault)   //查询到的内容返回给客户端
  ).catch(
    err=>res.send(err)
  )
})


//详情
router.get('/:goodsname/:_id',(req,res,next)=>{
  // console.log('goods 详情',req.params)
  let collectionName=req.params.goodsname;  //获取集合
  let _id=req.params._id;   //获取要查找的_id

  //查询
  mgdb.findDetail({collectionName,_id}).then(
    reault=>res.send(reault)
  ).catch(
    err=>res.send(err)
  )
})

module.exports = router;