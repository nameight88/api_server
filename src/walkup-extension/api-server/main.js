"use strict";
const fs=require("fs");
const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const port=3010;
app.use(bodyParser.json());
let idx=1;
app.post("/employeeNo",function(req,res){
	const str=req.body.str;
	console.log("/employeeNo str="+str);
	const employeeNo="CP0000"+idx;
	idx++;
	res.json({code:0,employeeNo:employeeNo});
	res.end();
	console.log("EmployeeNo="+employeeNo);
});
app.listen(port,function(){
	console.log("Running on port="+port);
});
