// === Students1 Frontend Helper (FINAL FIX) ===
const API_URL = "https://script.google.com/macros/s/AKfycbziLEp9fOV6OVU8uOOOzCgQib1AomMACTXOEMx-OYUTXQH3S3pbx3-btJloSYHbjtJ54A/exec"; // <-- ضع
function saveSession(data){
  if (data && data.token) localStorage.setItem("token", data.token);
  if (data && data.student) localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student") || "null"); }

function setAdminToken(token){
  localStorage.setItem("firebase_token", token || "");
  localStorage.setItem("mode", "admin");
}
function getAdminToken(){
  return localStorage.getItem("firebase_token") || "";
}
function isAdmin(){
  return localStorage.getItem("mode") === "admin" && !!getAdminToken();
}

function requireStudentOrAdmin(){
  if (isAdmin()) return;
  if (!getToken()) location.href = "index.html";
}

function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  location.href = "index.html";
}
function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  location.href = "index.html";
}

async function api(action, payload = {}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: getAdminToken(),
    ...payload
  });

  const res = await fetch(API_URL, { method: "POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"تعذر قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

function qs(k){
  return new URLSearchParams(location.search).get(k);
}
function esc(s){
  return String(s ?? "").replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}
