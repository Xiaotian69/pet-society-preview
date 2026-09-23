export const dailyKinds={
  food:{label:'食欲',icon:'🥣',options:['正常','减少','增多','拒食']},
  activity:{label:'活动',icon:'🐾',options:['活跃','一般','减少']},
  stool:{label:'排便',icon:'📝',options:['正常','偏稀','排便困难','其他']},
  weight:{label:'体重',icon:'⚖️',options:[]},
};

export function normalizeDailyPet(value){
  const name=typeof value?.name==='string'?value.name.trim():'';
  return name&&name.length<=20&&['dog','cat'].includes(value.species)?{name,species:value.species}:null;
}

function validEntryValue(kind,value){
  if(kind==='weight') return /^\d+(?:\.\d{1,2})?$/.test(value)&&Number(value)>0&&Number(value)<=500;
  return dailyKinds[kind]?.options.includes(value)===true;
}

function validDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year,month,day]=value.split('-').map(Number);
  const date=new Date(year,month-1,day);
  return date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day;
}

export function todayKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function readDailyEntries(rows){
  return (Array.isArray(rows)?rows:[]).filter(row=>row&&typeof row.id==='string'&&
    Object.hasOwn(dailyKinds,row.kind)&&typeof row.value==='string'&&validEntryValue(row.kind,row.value)&&
    typeof row.note==='string'&&typeof row.at==='string'&&!Number.isNaN(Date.parse(row.at)))
    .sort((a,b)=>b.at.localeCompare(a.at));
}

export function createDailyEntry(input,rows,now=new Date()){
  const value=typeof input?.value==='string'?input.value.trim():'';
  const note=typeof input?.note==='string'?input.note.trim():'';
  if(!Object.hasOwn(dailyKinds,input?.kind)||!validEntryValue(input.kind,value)) throw Error('请选择有效的记录内容。');
  if(note.length>200) throw Error('备注不能超过 200 字。');
  const row={id:crypto.randomUUID(),kind:input.kind,value,note,at:now.toISOString()};
  return [row,...readDailyEntries(rows)].slice(0,500);
}

export function readCareTasks(rows){
  return (Array.isArray(rows)?rows:[]).filter(row=>row&&typeof row.id==='string'&&
    typeof row.title==='string'&&row.title.trim()&&row.title.length<=40&&validDate(row.dueDate)&&
    (row.doneAt===null||(typeof row.doneAt==='string'&&!Number.isNaN(Date.parse(row.doneAt)))))
    .sort((a,b)=>Number(Boolean(a.doneAt))-Number(Boolean(b.doneAt))||a.dueDate.localeCompare(b.dueDate));
}

export function createCareTask(input,rows){
  const title=typeof input?.title==='string'?input.title.trim():'';
  if(!title||title.length>40) throw Error('请填写 1～40 字的事项名称。');
  if(!validDate(input.dueDate)) throw Error('请选择有效日期。');
  return readCareTasks([...readCareTasks(rows),{id:crypto.randomUUID(),title,dueDate:input.dueDate,doneAt:null}]);
}

export function completeCareTask(rows,id,now=new Date()){
  const valid=readCareTasks(rows);
  if(!valid.some(row=>row.id===id&&!row.doneAt)) throw Error('事项不存在或已完成。');
  return readCareTasks(valid.map(row=>row.id===id?{...row,doneAt:now.toISOString()}:row));
}
