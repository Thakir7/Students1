// === Students1 Frontend Helper (FINAL) ===
const API_URL = "https://script.google.com/macros/s/AKfycbyI_XnCXFhfR1lYgzhwfUyl2YLqfUeGqdjf5p8k_KsOMNRFx-vsmh2-pXGz1mTH2SzU/exec";

// Session
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

function exitAdminMode(){
  localStorage.removeItem("mode");
  localStorage.removeItem("firebase_token");
  location.href = "index.html";
}
function logoutStudent(){
  localStorage.removeItem("token");
  localStorage.removeItem("student");
  localStorage.removeItem("sel_course");
  localStorage.removeItem("sel_section");
  location.href = "index.html";
}

// Selection (course/section)
function setSelection(course, section){
  localStorage.setItem("sel_course", course||"");
  localStorage.setItem("sel_section", section||"");
}
function getSelection(){
  return {
    course: (localStorage.getItem("sel_course")||"").trim(),
    section: (localStorage.getItem("sel_section")||"").trim()
  };
}

// API
async function api(action, payload={}){
  const body = JSON.stringify({
    action,
    token: getToken(),
    firebase_token: localStorage.getItem("firebase_token"),
    ...payload
  });
  const res = await fetch(API_URL, { method:"POST", body });
  const data = await res.json().catch(()=>({ok:false, message:"فشل قراءة الرد"}));
  if (!data.ok) throw new Error(data.message || "خطأ");
  return data;
}

// Render table (supports {headers,rows} arrays)
function esc(s){ return String(s??"").replace(/[&<>"]/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[m])); }

function renderTable(container, headers, rows){
  if (!rows || !rows.length){
    container.innerHTML = `<div class="muted">لا توجد بيانات</div>`;
    return;
  }
  const thead = `<tr>${headers.map(h=>`<th>${esc(h)}</th>`).join("")}</tr>`;
  const tbody = rows.map(r=>`<tr>${headers.map((_,i)=>`<td>${esc(r[i]??"")}</td>`).join("")}</tr>`).join("");
  container.innerHTML = `<div class="tableWrap"><table class="table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}

async function loadStudentCourses(selectEl, sectionEl){
  const data = await api("courses_list");
  const list = data.list || [];
  selectEl.innerHTML = `<option value="">اختر المقرر</option>` + list.map(x=>`<option value="${esc(x.course)}">${esc(x.course)}</option>`).join("");
  // sections will be filtered
  selectEl.onchange = () => {
    const course = selectEl.value;
    const sections = list.filter(x=>x.course===course && x.section).map(x=>x.section);
    sectionEl.innerHTML = `<option value="">اختر الشعبة</option>` + [...new Set(sections)].map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("");
  };

  // restore selection
  const sel = getSelection();
  if (sel.course){
    selectEl.value = sel.course;
    selectEl.onchange();
    if (sel.section) sectionEl.value = sel.section;
  }else{
    // fallback: student course
    const st = getStudent();
    if (st?.course){
      selectEl.value = st.course;
      selectEl.onchange();
      if (st.section) sectionEl.value = st.section;
    }
  }
}

async function loadAdminCourses(courseEl, sectionEl){
  const data = await api("admin_courses_list");
  const list = data.list || [];
  const courses = [...new Set(list.map(x=>x.course))];

  courseEl.innerHTML = `<option value="">اختر المقرر</option>` + courses.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join("");

  courseEl.onchange = () => {
    const course = courseEl.value;
    const sections = list.filter(x=>x.course===course).map(x=>x.section);
    sectionEl.innerHTML = `<option value="">اختر الشعبة</option>` + sections.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join("");
  };

  const sel = getSelection();
  if (sel.course){
    courseEl.value = sel.course;
    courseEl.onchange();
    if (sel.section) sectionEl.value = sel.section;
  }
}
