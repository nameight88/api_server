chrome.runtime.onInstalled.addListener(()=>{
	chrome.contextMenus.create({
		id:"cm_register_hid_input",
		title:"Register element for receiving card data",
		contexts:["all"]
	});
});
//const urlPrefix="https://coubox.coupang.net:3010";
const urlPrefix="http://localhost:3010";
chrome.runtime.onMessage.addListener((msg,sender,sendResponse)=>{
	(async()=>{
		try{
			if(msg.type==="employeeNo"){
				const protocol=msg.protocol;
				const{cardType,cardId,companyId,lang}=msg;
				const obj=await chrome.storage.local.get("token");
				let token;
				if(obj&&typeof obj["token"]!=="undefined"){
					token=obj["token"];
				}else{
					token="";
				}
				const resp=await fetch(urlPrefix+"/api/employees/search",{
					method:"POST",
					headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
					body:JSON.stringify({
						conditions:{
							card_type:cardType,
							card_id:cardId,
							company_id:companyId
						},fields:["employee_no"],
						lang
					}),
					credentials:"include"
				});
				const text=await resp.text();
				sendResponse({ok:true,body:text,status:resp.status});
			}
		}catch(e){
			sendResponse({ok:true,err:String(e)});
		}
	})();
	return true;
});
chrome.contextMenus.onClicked.addListener(async(info,tab)=>{
	try{
		switch(info.menuItemId){
			case"cm_register_hid_input":
				const resp=await chrome.tabs.sendMessage(tab.id,{type:"GET_LAST_ELEMENT_CSS_PATH"});
				if(!resp?.cssPath){
					return;
				}
				chrome.storage.local.set({hidInputPath:resp.cssPath},()=>{
					console.log("done");
				});
				break;
		}
	}catch(ex){
		console.error(ex);
	}
});
