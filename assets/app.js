const API_URL = "https://script.google.com/macros/s/AKfycbxhyxk69wn7RQa9wlL4L8zG_QW_YecA9mdXxPsCp3hzQO9s4eCpZ34KIVNgjZr5QJ_mGQ/exec";

function normalizeDigits(s){
  s = String(s==null?"":s);
  const map = {"٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9","۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"};
  return s.replace(/[٠-٩۰-۹]/g, ch => map[ch] || ch);
}
function digitsOnly(s){ return normalizeDigits(s).replace(/\D/g,""); }
function last4(s){ const d=digitsOnly(s); return d.length>=4?d.slice(-4):d; }

function saveSession(data){
  localStorage.setItem("token", data.token);
  localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ return JSON.parse(localStorage.getItem("student")||"null"); }

function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
}

function requireStudentOrAdmin(){
  if (isAdmin()) return;
  if (!getToken()) location.href="index.html";
}

function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  location.href="index.html";
}
function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  location.href="index.html";
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false,message:"تعذر قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

function qs(k){ return new URLSearchParams(location.search).get(k); }
function esc(s){ return String(s??"").replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }

// Admin selected course/section (sticky across pages)
function setAdminSelection(course, section){
  localStorage.setItem("admin_course", course||"");
  localStorage.setItem("admin_section", section||"");
}
function getAdminSelection(){
  return {
    course: qs("course") || localStorage.getItem("admin_course") || "",
    section: qs("section") || localStorage.getItem("admin_section") || ""
  };
}
function withAdminQS(url){
  const sel = getAdminSelection();
  const u = new URL(url, location.href);
  if (sel.course) u.searchParams.set("course", sel.course);
  if (sel.section) u.searchParams.set("section", sel.section);
  return u.pathname + "?" + u.searchParams.toString();
}
