"use strict";
const fs=require("fs");
const readline=require("readline");
const url="http://127.0.0.1:9001/api/employee/search";
const rl=readline.createInterface({
	input:process.stdin,
	terminal:false
});
const q=[];
let take;
rl.on("line",function(line){
	if(take){const t=take;take=null;t(line);}
	else q.push(line);
});
async function readLine(){
	if(q.length)return q.shift();
	return await new Promise(function(resolve){take=resolve});
}
async function main(){
	const processId=await readLine();
	const logFilePath="logs/"+processId+"-log.txt";
	try{
		fs.unlinkSync(logFilePath);
	}catch(e){
	}
	const iterCountStr=await readLine();
	const iter=Number(iterCountStr);
	for(let i=0;i<iter;++i){
		const jsonString=await readLine();
		try{
			const t=new Date().getTime();
			const response=await fetch(url,{
				method:"POST",
				headers:{
					"Content-Type":"application/json"
				},
				body:jsonString
			});
			const dt=new Date().getTime()-t;
			process.stdout.write(dt+"\n");
		}catch(e){
			try{
				const logText=e.toString()+"\n";
				fs.appendFileSync(logFilePath,logText);
			}catch(e2){
				console.error(e2);
			}
		}
		await new Promise(function(resolve){
			setTimeout(resolve,1000);
		});
	}
	rl.close();
}
main();
