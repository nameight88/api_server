"use strict";
const input=document.getElementById("ipt-token");
const btn=document.getElementById("btn-submit");
btn.addEventListener("click",async function(){
	const token=input.value;
	try{
		await chrome.storage.local.set({"token":token});
		input.value="";
	}catch(e){
		console.error(e);
	}
});