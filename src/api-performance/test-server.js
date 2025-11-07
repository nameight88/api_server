"use strict";
const http=require("http");
let nextId=0;
const server=http.createServer(function(req,res){
	const id=nextId++;
	const buffers=[];
	req.on("data",function(d){
		buffers.push(d);
	});
	req.on("end",function(){
		const buffer=Buffer.concat(buffers);
		console.log(id+","+buffer.toString());
		res.end();
	});
});
server.listen(9001);
