import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeDailyPet,createDailyEntry,createCareTask,completeCareTask,readDailyEntries,readCareTasks,todayKey} from '../daily.mjs';

test('daily pet needs only a name and species',()=>{
  assert.deepEqual(normalizeDailyPet({name:' 豆包 ',species:'cat'}),{name:'豆包',species:'cat'});
  assert.equal(normalizeDailyPet({name:' ',species:'cat'}),null);
  assert.equal(normalizeDailyPet({name:'豆包',species:'bird'}),null);
});

test('quick records validate observed values and preserve newest first',()=>{
  const first=createDailyEntry({kind:'food',value:'正常',note:''},[],new Date('2026-09-20T08:00:00Z'));
  const second=createDailyEntry({kind:'weight',value:'4.2',note:'晨起'},first,new Date('2026-09-21T08:00:00Z'));
  assert.deepEqual(second.map(row=>row.value),['4.2','正常']);
  assert.throws(()=>createDailyEntry({kind:'weight',value:'0',note:''},second));
  assert.throws(()=>createDailyEntry({kind:'food',value:'错误',note:''},second));
  assert.deepEqual(readDailyEntries([null,{id:'x'},...second]).map(row=>row.value),['4.2','正常']);
});

test('care tasks reject impossible dates and can be completed',()=>{
  assert.throws(()=>createCareTask({title:'驱虫',dueDate:'2026-02-30'},[]));
  const rows=createCareTask({title:' 买粮 ',dueDate:'2026-09-23'},[],new Date('2026-09-20T08:00:00Z'));
  assert.equal(rows[0].title,'买粮');
  const done=completeCareTask(rows,rows[0].id,new Date('2026-09-23T09:00:00Z'));
  assert.equal(done[0].doneAt,'2026-09-23T09:00:00.000Z');
  assert.deepEqual(readCareTasks([null,{id:'bad'},...done]).map(row=>row.title),['买粮']);
  assert.equal(todayKey(new Date(2026,8,23,23,30)),'2026-09-23');
});
