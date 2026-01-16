const API_URL = "https://script.google.com/macros/s/AKfycbxv9vlzDiZEv8rB9nRF6Dm7OkU5ophr7eyydSXQ8lt5romkgdj88kZ1LjKcUEl4S_ry6A/exec";

function saveSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student")||"null"); }

function logout(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  localStorage.removeItem("firebase_token");
  location.href = "index.html";
}
function requireLogin(){
  if(!getToken()) location.href="index.html";
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"), // ✅ توكن Firebase للمدير
    ...payload
  });

  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"فشل قراءة الرد"}));
  if (!data || data.ok === false) throw new Error(data.message || "خطأ غير معروف");
  return data;
}

function setText(id, t){ const el=document.getElementById(id); if(el) el.textContent=t; }
function qs(k){ return new URLSearchParams(location.search).get(k); }
