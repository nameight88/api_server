"use strict";
const{spawn}=require("child_process");
const promiseList=[];
function getCardType(i){
	if(i%2==1){
		return 32;
	}else{
		return 48;
	}
}
function getCardId(i){
	if(i%2==1){
		const cardId=Math.floor(Math.random()*999999);
		return String(cardId);
	}else{
		const cardId=Math.floor(Math.random()*9999);
		return String(cardId);
	}
}
function getCompanyId(i){
	if(i%2==1){
		return"";
	}else{
		const cardId=Math.floor(Math.random()*9999);
		return String(cardId);
	}
}
function getLang(i){
	if(i%2==1){
		return"en";
	}else{
		return"ko";
	}
}
function getParamString(i){
	const obj={
		conditions:{
			card_type:getCardType(i),
			card_id:getCardId(i),
			company_id:getCompanyId(i),
		},
		lang:getLang(i)
	};
	return JSON.stringify(obj);
}
let sum=0;
const iter=100;
const instanceCount=4;
for(let i=0;i<instanceCount;++i){
	const processId=i;
	const child=spawn("node",["worker.js"]);
	child.stderr.on("data",function(d){
		process.stderr.write(d);
	});
	child.stdout.on("data",function(d){
		const dt=Number(d);
		sum+=dt;
		console.log("processId="+processId+" finished task in "+dt+" ms");
	});
	child.stdin.write(processId+"\n");
	child.stdin.write(iter+"\n");
	const idx=Math.floor(Math.random()*100000);
	for(let j=0;j<iter;++j){
		child.stdin.write(getParamString(idx+i)+"\n");
	}
	const promise=new Promise(function(resolve){
		child.on("close",function(code){
			resolve(code);
		});
	});
	promiseList.push(promise);
}
const t=new Date().getTime();
Promise.all(promiseList).then(function(results){
	const dt=new Date().getTime()-t;
	for(const result of results){
		if(result!=0){
			console.log("ERROR");
			break;
		}
	}
	console.log("Elapsed="+dt+" ms");
	const avg=sum/(iter*instanceCount)
	console.log("AVG="+avg+" ms");
});
