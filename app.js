const DB_KEY="oxygenGymDB"; const SESSION_KEY="oxygenGymSession";
const PLAN_MONTHS={Monthly:1,Quarterly:3,"Half-Yearly":6,Yearly:12};
const PLAN_PRICE={Monthly:1499,Quarterly:3999,"Half-Yearly":6999,Yearly:11999};

function getDB(){let d=JSON.parse(localStorage.getItem(DB_KEY)||"null");if(!d){d={members:[],attendance:[],payments:[]};localStorage.setItem(DB_KEY,JSON.stringify(d))}return d}
function saveDB(d){localStorage.setItem(DB_KEY,JSON.stringify(d))}
function session(){return localStorage.getItem(SESSION_KEY)}
function currentMember(){let email=session();return getDB().members.find(m=>m.email===email)}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function fmtDate(v){if(!v)return "—";return new Date(v+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function today(){return new Date().toISOString().slice(0,10)}
function addMonths(date,months){let d=new Date(date+"T00:00:00");d.setMonth(d.getMonth()+months);return d.toISOString().slice(0,10)}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN")}
function toggleMenu(){alert("On mobile, use the main page buttons. Dashboard pages can be opened directly from the desktop-style navigation when needed.")}
function logout(){localStorage.removeItem(SESSION_KEY);location.href="login.html"}

document.addEventListener("DOMContentLoaded",()=>{
  const params=new URLSearchParams(location.search); const plan=params.get("plan"); const planEl=document.getElementById("plan"); if(plan&&planEl)planEl.value=plan;
  const reg=document.getElementById("registerForm"); if(reg)reg.addEventListener("submit",registerMember);
  const login=document.getElementById("loginForm"); if(login)login.addEventListener("submit",loginUser);
  const contact=document.getElementById("contactForm"); if(contact)contact.addEventListener("submit",sendContact);
  if(document.getElementById("dashboard")){}
  if(location.pathname.endsWith("dashboard.html"))renderDashboard();
  if(location.pathname.endsWith("attendance.html"))renderAttendance();
  if(location.pathname.endsWith("membership.html"))renderMembership();
  if(location.pathname.endsWith("payments.html"))renderPayments();
  if(location.pathname.endsWith("admin.html"))renderAdmin();
  if(document.getElementById("today"))document.getElementById("today").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"});
});
function registerMember(e){
 e.preventDefault();let f=new FormData(e.target),d=getDB(),email=f.get("email").trim().toLowerCase();
 if(d.members.some(m=>m.email===email)){show("registerMsg","This email is already registered. Please login.","error");return}
 let start=today(),months=PLAN_MONTHS[f.get("plan")],price=PLAN_PRICE[f.get("plan")];
 let m={id:uid(),name:f.get("name"),phone:f.get("phone"),email,dob:f.get("dob"),gender:f.get("gender"),plan:f.get("plan"),address:f.get("address"),startDate:start,expiryDate:addMonths(start,months),feesDue:price,createdAt:new Date().toISOString()};
 d.members.push(m);d.payments.push({id:uid(),memberId:m.id,date:start,description:"Membership registration",amount:0,status:"Pending"});saveDB(d);localStorage.setItem(SESSION_KEY,email);
 show("registerMsg","Registration successful! Redirecting to your dashboard...","success");setTimeout(()=>location.href="dashboard.html",800)
}
function loginUser(e){
 e.preventDefault();let email=document.getElementById("loginEmail").value.trim().toLowerCase(),d=getDB();
 if(email==="admin@oxygengym.com"){let pass=prompt("Enter admin password:");if(pass==="admin123"){localStorage.setItem(SESSION_KEY,"admin");location.href="admin.html"}else show("loginMsg","Incorrect admin password.","error");return}
 let m=d.members.find(x=>x.email===email);if(!m){show("loginMsg","No member found. Please register first.","error");return}localStorage.setItem(SESSION_KEY,email);location.href="dashboard.html"
}
function requireMember(){if(!session()||session()==="admin"){location.href="login.html";return null}return currentMember()}
function show(id,msg,type){let el=document.getElementById(id);if(el)el.innerHTML=`<div class="${type}">${msg}</div>`}
function renderDashboard(){
 let m=requireMember();if(!m)return;let d=getDB();
 const set=(id,v)=>{let e=document.getElementById(id);if(e)e.textContent=v};
 set("dashPlan",m.plan);set("dashExpiry",fmtDate(m.expiryDate));set("dashAttendance",d.attendance.filter(a=>a.memberId===m.id&&a.date.slice(0,7)===today().slice(0,7)).length);set("dashPending",money(m.feesDue));
 set("sideUser",m.name);
 let profile=document.getElementById("profile");if(profile)profile.innerHTML=[["Name",m.name],["Email",m.email],["Mobile",m.phone],["Gender",m.gender],["Plan",m.plan],["Valid Until",fmtDate(m.expiryDate)]].map(x=>`<div class="profile-row"><span>${x[0]}</span><span>${x[1]}</span></div>`).join("");
 let ra=document.getElementById("recentAttendance");let rows=d.attendance.filter(a=>a.memberId===m.id).slice(-5).reverse();ra.innerHTML=rows.length?rows.map(a=>`<div class="profile-row"><span>${fmtDate(a.date)}</span><span class="badge">Present · ${a.time}</span></div>`).join(""):"<p class='small'>No attendance records yet.</p>"
}
function markAttendance(){
 let m=requireMember();if(!m)return;let d=getDB();if(d.attendance.some(a=>a.memberId===m.id&&a.date===today())){alert("Attendance is already marked for today.");return}
 d.attendance.push({id:uid(),memberId:m.id,date:today(),time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),status:"Present"});saveDB(d);renderAttendance();alert("Today's attendance marked successfully!")
}
function renderAttendance(){let m=requireMember();if(!m)return;let d=getDB(),rows=d.attendance.filter(a=>a.memberId===m.id).sort((a,b)=>b.date.localeCompare(a.date));let tb=document.getElementById("attendanceTable");if(tb)tb.innerHTML=rows.length?rows.map(a=>`<tr><td>${fmtDate(a.date)}</td><td>${a.time}</td><td><span class="badge">Present</span></td></tr>`).join(""):`<tr><td colspan="3">No attendance records.</td></tr>`;let c=document.getElementById("attendanceCount");if(c)c.textContent=rows.length+" records"}
function renderMembership(){let m=requireMember();if(!m)return;let el=document.getElementById("currentMembership");if(el)el.innerHTML=`<h2>${m.plan} Membership <span class="badge">ACTIVE</span></h2><p>Valid from ${fmtDate(m.startDate)} to ${fmtDate(m.expiryDate)} · Pending fees: <b>${money(m.feesDue)}</b></p>`}
function renewMembership(plan,price,months){let m=requireMember();if(!m)return;let d=getDB(),start=(new Date(m.expiryDate)>=new Date(today()+"T00:00:00"))?m.expiryDate:today();m.plan=plan;m.startDate=start;m.expiryDate=addMonths(start,months);m.feesDue+=price;d.payments.push({id:uid(),memberId:m.id,date:today(),description:plan+" membership renewal",amount:0,status:"Pending"});saveDB(d);renderMembership();alert(plan+" renewal recorded. Pending fee added: "+money(price))}
function renderPayments(){let m=requireMember();if(!m)return;let d=getDB(),rows=d.payments.filter(p=>p.memberId===m.id);let paid=rows.filter(p=>p.status==="Paid").reduce((s,p)=>s+Number(p.amount),0),pending=m.feesDue;document.getElementById("totalPaid").textContent=money(paid);document.getElementById("totalPending").textContent=money(pending);let tb=document.getElementById("paymentsTable");tb.innerHTML=rows.length?rows.map(p=>`<tr><td>${fmtDate(p.date)}</td><td>${p.description}</td><td>${money(p.amount)}</td><td><span class="badge ${p.status==="Pending"?"danger":""}">${p.status}</span></td></tr>`).join(""):`<tr><td colspan="4">No payments.</td></tr>`}
function demoPayment(){let m=requireMember();if(!m)return;let amount=Number(prompt("Enter payment amount:",m.feesDue));if(!amount||amount<1)return;let d=getDB();m.feesDue=Math.max(0,m.feesDue-amount);d.payments.push({id:uid(),memberId:m.id,date:today(),description:"Fee payment",amount,status:"Paid"});saveDB(d);renderPayments();alert("Payment recorded successfully.")}
function renderAdmin(){
 if(session()!=="admin"){location.href="login.html";return}let d=getDB(),members=d.members,search=(document.getElementById("memberSearch")?.value||"").toLowerCase();let filtered=members.filter(m=>(m.name+" "+m.email+" "+m.phone).toLowerCase().includes(search));
 document.getElementById("adminMembers").textContent=members.length;document.getElementById("adminActive").textContent=members.filter(m=>m.expiryDate>=today()).length;document.getElementById("adminToday").textContent=d.attendance.filter(a=>a.date===today()).length;document.getElementById("adminFees").textContent=money(members.reduce((s,m)=>s+Number(m.feesDue||0),0));
 let tb=document.getElementById("membersTable");tb.innerHTML=filtered.length?filtered.map(m=>`<tr><td>${m.name}</td><td>${m.email}</td><td>${m.plan}</td><td>${fmtDate(m.expiryDate)}</td><td>${money(m.feesDue)}</td><td><button class="btn btn-sm" onclick="adminPay('${m.id}')">Pay</button> <button class="btn btn-sm" onclick="deleteMember('${m.id}')">Delete</button></td></tr>`).join(""):`<tr><td colspan="6">No members found.</td></tr>`
}
function adminPay(id){let d=getDB(),m=d.members.find(x=>x.id===id);if(!m)return;let amount=Number(prompt("Payment amount for "+m.name+":",m.feesDue));if(!amount)return;m.feesDue=Math.max(0,m.feesDue-amount);d.payments.push({id:uid(),memberId:id,date:today(),description:"Admin recorded payment",amount,status:"Paid"});saveDB(d);renderAdmin()}
function deleteMember(id){if(!confirm("Delete this member and their records?"))return;let d=getDB();d.members=d.members.filter(m=>m.id!==id);d.attendance=d.attendance.filter(a=>a.memberId!==id);d.payments=d.payments.filter(p=>p.memberId!==id);saveDB(d);renderAdmin()}
function sendContact(e){e.preventDefault();show("contactMsg","Message submitted successfully! Configure EmailJS in js/emailjs-config.js to send real emails.","success");e.target.reset()}
