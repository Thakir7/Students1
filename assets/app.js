const API_URL = "https://script.google.com/macros/s/AKfycbwzwkOnIy38TN67Kt26sIvzy7mhVjCCZmpD7YjA_S6ZmtT3qgTC0nFuPb9_BYmYUrewMA/exec"; 

function esc(s){ return String(s??"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m])); }

function digitsOnly(s){
  s = String(s ?? "");
  const map = {
    "٠":"0","١":"1","٢":"2","٣":"3","٤":"4","٥":"5","٦":"6","٧":"7","٨":"8","٩":"9",
    "۰":"0","۱":"1","۲":"2","۳":"3","۴":"4","۵":"5","۶":"6","۷":"7","۸":"8","۹":"9"
  };
  s = s.replace(/[٠-٩۰-۹]/g, ch => map[ch] || ch);
  return s.replace(/\D+/g,"");
}

function saveSession(data){
  if (data?.token) localStorage.setItem("token", data.token);
  if (data?.student) localStorage.setItem("student", JSON.stringify(data.student));
}
function getToken(){ return localStorage.getItem("token"); }
function getStudent(){ try{ return JSON.parse(localStorage.getItem("student")||"null"); }catch(_){ return null; } }

function isAdmin(){
  return localStorage.getItem("mode")==="admin" && !!localStorage.getItem("firebase_token");
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

// للمدرب فقط
function setAdminSelection(course, section){
  localStorage.setItem("admin_course", (course||"").trim());
  localStorage.setItem("admin_section", (section||"").trim());
}
function getAdminSelection(){
  return {
    course: (localStorage.getItem("admin_course")||"").trim(),
    section: (localStorage.getItem("admin_section")||"").trim()
  };
}

async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token") || "",
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"فشل قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

function renderTable(container, headers, rows){
  if (!rows || !rows.length){
    container.innerHTML = `<div class="muted">لا توجد بيانات</div>`;
    return;
  }
  const thead = `<tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>`;
  const tbody = rows.map(r=>`<tr>${headers.map((_,i)=>`<td>${esc(r[i]??"")}</td>`).join("")}</tr>`).join("");
  container.innerHTML = `<div class="tableWrap"><table class="table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}
