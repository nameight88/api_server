const textAPIError_KO=(`couBox api 호출에 실패하였습니다. 다음 스텝에 따라 메뉴얼로 체크인해주세요.

 해결 방법 (수동 체크인)

1. 키오스크 화면에서 '이름 또는 이메일 입력' 란을 선택하세요.
2. 본인 이름 또는 닉네임을 검색하여 선택합니다.
3. **'방문 이유'**를 선택하고 '체크인' 버튼을 누르면 완료됩니다.`);
const textAPIError_EN=(`Failed to call couBox api. Please follow the next steps to check in manually.

 Solution (Manual Check-in)

1. On the kiosk screen, tap the 'Enter Name or Email' field.
2. Search for and select your name or nickname.
3. Select the 'Reason for Visit' and press the 'Check-in' button to finish.`);
const textInvalidData_KO=(`지원되는 사원증 포맷이 아닙니다. 다음 스텝에 따라 메뉴얼로 체크인해주세요.

해결 방법 (수동 체크인)

1. 키오스크 화면에서 '이름 또는 이메일 입력' 란을 선택하세요.
2. 본인 이름 또는 닉네임을 검색하여 선택합니다.
3. **'방문 이유'**를 선택하고 '체크인' 버튼을 누르면 완료됩니다.`);
const textInvalidData_EN=(`Unsupported card format. Please follow the next steps to check in manually.

 Solution (Manual Check-in)

1. On the kiosk screen, tap the 'Enter Name or Email' field.
2. Search for and select your name or nickname.
3. Select the 'Reason for Visit' and press the 'Check-in' button to finish.`);
const textNoCardData_KO=(`[오류] 사용자 정보 없음

CouBox DB에 등록된 정보가 없어 카드 태깅을 사용할 수 없습니다.

 º 조치 방법: 한국 오피스 직군이 아닌 경우, 수동으로 입력해 주세요.
 º 신규 입사자: 입사 후 1주일이 지나야 정상 사용이 가능합니다.
 해결 방법 (수동 체크인)

1. 키오스크 화면에서 '이름 또는 이메일 입력' 란을 선택하세요.
2. 본인 이름 또는 닉네임을 검색하여 선택합니다.
3. **'방문 이유'**를 선택하고 '체크인' 버튼을 누르면 완료됩니다.`);
const textNoCardData_EN=(`[Error] User data not found

Cannot use card tagging because your information is not registered in the CouBox DB.

 º Action: If you are not an office employee in Korea, please check in manually.
 º New Hires: This service is available one week after your start date.
 Solution (Manual Check-in)

1. On the kiosk screen, tap the 'Enter Name or Email' field.
2. Search for and select your name or nickname.
3. Select the 'Reason for Visit' and press the 'Check-in' button to finish.`);
let hidInputElement=null;
let state=0;
let facility;
let _32bitCardTimeout=null;
function getCSSPath(el){
	if(!(el instanceof Element))return;
	const path=[];
	while(el.nodeType===Node.ELEMENT_NODE){
		let selector=el.nodeName.toLowerCase();
		let sib=el, nth = 1;
		while ((sib = sib.previousElementSibling)) {
			if (sib.nodeName.toLowerCase() === selector) nth++;
		}
		if (nth !== 1)selector+=`:nth-of-type(${nth})`;
		path.unshift(selector);
		el=el.parentNode;
	}
	return path.join(" > ");
}
function getEmployeeNo(cardType,cardId,companyId){
	return new Promise(function(resolve,reject){
		const lang=document.documentElement.getAttribute("lang");
		chrome.runtime.sendMessage({
			type:"employeeNo",
			cardType,cardId,companyId,lang
		},(res)=>{
			if(!res?.ok){
				console.error(res?.error);
				reject(res?.error);
				return;
			}
			resolve(res.body);
		});
	});
}
function parseCardData(data){
	const newData=data.replaceAll("_","-");
	let pos=newData.lastIndexOf("-");
	if(pos==-1){
		return"";
	}
	return newData.substring(pos+1);
}
function setCardResult(cardType,cardId,companyId){
	console.log("setCardResult cardId="+cardId);
	const t0=new Date().getTime();
	getEmployeeNo(cardType,cardId,companyId).then((responseString)=>{
		const t1=new Date().getTime();
		const dt=t1-t0;
		console.log(`[${dt}] getEmployeeNo()`);
		const response=JSON.parse(responseString);
		const lang=document.documentElement.getAttribute("lang");
		if(response.success){
			const data=response.data;
			if(data!=null&&data.length>0){
				const row=data[0];
				if(row!=null){
					const employeeNo=row["employee_no"];
					console.log("employeeNo="+employeeNo);
					const hidInputElement=getHidInputElement();
					hidInputElement.value="{ \"employee_no\": \""+employeeNo+"\" }";
					hidInputElement.dispatchEvent(new Event("input",{bubbles:true}));
				}else{
					alertNoCardData();
				}
			}else{
				alertNoCardData();
			}
		}else{
			alertAPIError();
		}
	}).catch((ex)=>{
		console.error(ex);
		alertAPIError();
	});
}
function getLang(){
	const lang=document.documentElement.getAttribute("lang");
	return lang;
}
function alertAPIError(){
	let str;
	if("en"===getLang()){
		str=textAPIError_EN;
	}else{
		str=textAPIError_KO;
	}
	alert(str);
}
function alertInvalidData(){
	let str;
	if("en"===getLang()){
		str=textInvalidData_EN;
	}else{
		str=textInvalidData_KO;
	}
	alert(str);
}
function alertNoCardData(){
	let str;
	if("en"===getLang()){
		str=textNoCardData_EN;
	}else{
		str=textNoCardData_KO;
	}
	alert(str);
}
function handleLineInput(line){
	const t=new Date().getTime();
	const dt=t-timerOffset;
	console.log(`[${dt}] ${line}`);
	timerOffset=t;
	line=line.toLowerCase();
	console.log(line);
	if(state==0){
		if(line.startsWith("coupang")){
			const cardId=parseCardData(line);
			_32bitCardTimeout=setTimeout(function(){
				setCardResult(32,cardId,"");
				_32bitCardTimeout=null;
			},700);
		}else if(line.startsWith("facility")){
			facility=line;
			state=1;
			if(_32bitCardTimeout!=null){
				clearTimeout(_32bitCardTimeout);
				_32bitCardTimeout=null;
			}
		}else{
			alertInvalidData();
		}
	}else if(state==1){
		if(line.startsWith("c1k")){
			const companyId=parseCardData(facility);
			const cardId=parseCardData(line);
			setCardResult(48,cardId,companyId);
		}else{
			alertInvalidData();
		}
		state=0;
	}
}
function getHidInputElement(){
	if(hidInputPath==null){
		return null;
	}
	if(hidInputElement==null){
		hidInputElement=document.querySelector(hidInputPath);
	}
	return hidInputElement;
}
let timerOffset=0;
async function setHidInputElement(){
	let el;
	while(true){
		el=getHidInputElement();
		if(el!=null){
			break;
		}
		await new Promise(function(resolve){
			setTimeout(resolve,800);
		});
	}
	el.addEventListener("keydown",(e)=>{
		console.log("keydown e.key="+e.key);
		e.stopPropagation();
		e.preventDefault();
		const t=new Date();
		const dt=t-lastKeyTime;
		if(dt>MAX_DELTA_TIME){
			timerOffset=new Date().getTime();
		}
		if(e.key.length==1){
			if(dt>MAX_DELTA_TIME){
				tagged=e.key;
			}else{
				tagged+=e.key;
			}
		}else if(e.key==="Backspace"){
			tagged=tagged.slice(0,-1);
		}else if(e.key==="Enter"||e.key==="Return"){
			if(tagged.length==0){
				return;
			}
			console.log("input="+tagged);
			handleLineInput(tagged);
			tagged="";
		}
		lastKeyTime=t;
	});
}
const MAX_DELTA_TIME=2500;
let lastKeyTime=0;
let tagged="";
let lastRightClicked=null;
let hidInputPath;
window.addEventListener("load",()=>{
	chrome.storage.local.get("hidInputPath",async(resp)=>{
		hidInputPath=resp["hidInputPath"];
		setHidInputElement();
	});
});
chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
	if(msg?.type==="GET_LAST_ELEMENT_CSS_PATH"){
		if(!lastRightClicked){
			sendResponse({cssPath:null});
			return true;
		}
		const cssPath=getCSSPath(lastRightClicked);
		console.log(cssPath);
		hidInputElement=lastRightClicked;
		sendResponse({cssPath});
		return true;
	}
});
document.addEventListener("contextmenu",(e)=>{
	lastRightClicked=e.target instanceof Element?e.target:null;
},true);
