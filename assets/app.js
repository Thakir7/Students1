// === Students1 Frontend Helper (FINAL SPLIT SESSIONS) ===
const API_URL = "https://script.google.com/macros/s/AKfycbziLEp9fOV6OVU8uOOOzCgQib1AomMACTXOEMx-OYUTXQH3S3pbx3-btJloSYHbjtJ54A/exec";  // ✅ نفس رابط GAS

// ---------------- Student session ----------------
function setStudentSession(token, studentObj){
  localStorage.setItem("st_token", token || "");
  localStorage.setItem("st_student", JSON.stringify(studentObj || {}));
}
function getStudentToken(){ return localStorage.getItem("st_token") || ""; }
function getStudent(){ return JSON.parse(localStorage.getItem("st_student") || "null"); }
function clearStudentSession(){
  localStorage.removeItem("st_token");
  localStorage.removeItem("st_student");
}

// ---------------- Admin session ----------------
function setAdminSession(firebaseToken){
  localStorage.setItem("ad_firebase_token", firebaseToken || "");
  localStorage.setItem("ad_mode", "admin");
}
function getAdminToken(){ return localStorage.getItem("ad_firebase_token") || ""; }
function isAdmin(){ return localStorage.getItem("ad_mode")==="admin" && !!getAdminToken(); }
function clearAdminSession(){
  localStorage.removeItem("ad_firebase_token");
  localStorage.removeItem("ad_mode");
  localStorage.removeItem("admin_course");
  localStorage.removeItem("admin_section");
}

// ---------------- Guards ----------------
function requireStudent(){
  if (!getStudentToken()) location.href = "index.html";
}
function requireAdmin(){
  if (!isAdmin()) location.href = "admin-login.html";
}

// ---------------- Common API ----------------
async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getStudentToken(),
    firebase_token: getAdminToken(),
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"تعذر قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

// ---------------- Helpers ----------------
function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){ return String(s??"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m])); }

// ---------------- Admin selection ----------------
function setSelection(course, section){
  localStorage.setItem("admin_course", course || "");
  localStorage.setItem("admin_section", section || "");
}
function getSelection(){
  return {
    course: localStorage.getItem("admin_course") || "",
    section: localStorage.getItem("admin_section") || ""
  };
}
