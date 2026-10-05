import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {queryRows,validateImage,validateDateRange,escapeHTML,stateDefinitions} from './design-system-v-star-group.core.mjs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');

test('Search, filter and sorting do not mutate source; pages clamp after filtering',()=>{
  const rows=[{id:1,name:'Бета',status:'active'},{id:2,name:'Альфа',status:'draft'},{id:3,name:'Гамма',status:'active'}];
  assert.deepEqual(queryRows(rows,{status:'active',direction:'desc',pageSize:1,page:99}),{rows:[rows[0]],total:2,page:2,pages:2});
  assert.deepEqual(queryRows(rows,{search:' АЛЬФА '}).rows,[rows[1]]);
  assert.deepEqual(rows.map(r=>r.id),[1,2,3]);
  assert.deepEqual(queryRows(rows,{search:'missing',page:-5,pageSize:0}),{rows:[],total:0,page:1,pages:1});
});
test('Files reject unsupported types and oversized data; date ranges validate ordering',()=>{
  assert.equal(validateImage({type:'image/png',size:1024}), '');
  assert.ok(validateImage({type:'image/svg+xml',size:100}));
  assert.ok(validateImage({type:'image/jpeg',size:6*1024*1024}));
  assert.ok(validateImage(null));
  assert.ok(validateDateRange('2026-09-30','2026-09-01'));
  assert.ok(validateDateRange('','2026-09-01'));
  assert.equal(validateDateRange('2026-09-01','2026-09-01'),'');
});
test('Untrusted labels are escaped; uncertain operation is not offered a blind retry',()=>{
  assert.equal(escapeHTML('<img src="x">'), '&lt;img src=&quot;x&quot;&gt;');
  assert.equal(stateDefinitions.unknown.action,'Проверить статус');
  assert.equal(Object.keys(stateDefinitions).length,14);
});
const source=JSON.parse(read('design-system-v-star-group.tokens.source.json'));
const output=JSON.parse(read('design-system-v-star-group.tokens.json'));
test('Generated token data agrees with source, including themes and density',()=>{
  assert.deepEqual(source.tokens,output.tokens);assert.deepEqual(source.themes,output.themes);assert.deepEqual(source.densities,output.densities);
  const css=read('design-system-v-star-group.tokens.css');
  for(const [key,value] of Object.entries(source.tokens))assert.ok(css.includes(`--vsg-${key}: ${value};`),key);
});
function color(value,tokens){const ref=/^var\(--vsg-(.+)\)$/.exec(value);return ref?color(tokens[ref[1]],tokens):value;}
function luminance(hex){const parts=hex.slice(1).match(/.{2}/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return parts[0]*.2126+parts[1]*.7152+parts[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const theme of ['dark','light'])test(`Key text pairs pass 4.5:1 in ${theme} theme`,()=>{
  const tokens={...source.tokens,...(source.themes[theme]||{})};
  for(const surface of ['bg','surface','surface-raised'])for(const fg of ['text','muted','info','danger','success','warning','accent-text']){
    const ratio=contrast(color(tokens[fg],tokens),color(tokens[surface],tokens));
    assert.ok(ratio>=4.5,`${fg}/${surface}: ${ratio.toFixed(2)}`);
  }
  assert.ok(contrast(color(tokens.primary,tokens),tokens['on-primary'])>=4.5);
});
test('Static HTML assets exist and static IDs are unique',()=>{
  for(const file of ['design-system-v-star-group.html','design-system-v-star-group.products.html','design-system-v-star-group.sport.html']){
    const html=read(file);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,file);
    for(const [,target]of html.matchAll(/(?:src|href)="([^"]+)"/g)){
      if(target.startsWith('http')||target.startsWith('#'))continue;
      assert.ok(existsSync(new URL(target,import.meta.url)),target);
    }
  }
  const base=read('design-system-v-star-group.html');const ids=[...base.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  for(const [,target]of base.matchAll(/(?:aria-controls|aria-labelledby|aria-describedby|data-dialog)="([^"]+)"/g))for(const id of target.split(' '))assert.ok(ids.includes(id),id);
});
test('Sport catalog exposes the required app patterns and labels',()=>{
  const html=read('design-system-v-star-group.sport.html');
  for(const id of ['sport-rules-title','sport-screens-title','sport-auth-title','sport-calendar-days','sport-program-title','sport-program-dialog','sport-timer','sport-set-progress','sport-profile-title','sport-states-title','sport-exercise-dialog','sport-celebration-dialog','sport-clear-log-dialog'])assert.ok(html.includes(`id="${id}"`),id);
  for(const className of ['vsg-sport-app-header','vsg-sport-today-card','vsg-sport-quick-grid','vsg-sport-bottom-nav'])assert.ok(html.includes(className),className);
  for(const label of ['Дистанция, км','Время, чч:мм:сс','Повторения','GPS-маршрут','Личный рекорд'])assert.ok(html.includes(label),label);
  for(const [,target]of html.matchAll(/(?:aria-labelledby|aria-describedby|aria-controls)="([^"]+)"/g))for(const id of target.split(' '))assert.ok(html.includes(`id="${id}"`),id);
});
test('React SSR smoke: field associations, disabled busy button and empty table',(t)=>{
  const require=createRequire(new URL('../app/package.json',import.meta.url));
  let ts,React,renderToStaticMarkup;
  try {
    ts=require('typescript');React=require('react');({renderToStaticMarkup}=require('react-dom/server'));
  } catch(error) {
    if(error.code==='MODULE_NOT_FOUND') { t.skip('Optional React/TypeScript dependencies are unavailable in this repository'); return; }
    throw error;
  }
  const code=ts.transpileModule(read('design-system-v-star-group.react.tsx'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};vm.runInNewContext(code,{exports,require});
  const h=React.createElement;
  const html=renderToStaticMarkup(h(exports.Theme,{},h(exports.Field,{label:'Имя',error:'Заполните имя',children:props=>h(exports.Input,props)}),h(exports.Button,{busy:true},'Сохранение'),h(exports.DataTable,{caption:'Объекты',rows:[],columns:[{key:'name',label:'Имя',render:r=>r.name}],getKey:r=>r.id})));
  assert.match(html,/aria-invalid="true"/);assert.match(html,/aria-describedby=/);assert.match(html,/disabled=""/);assert.match(html,/aria-busy="true"/);assert.match(html,/Ничего не найдено/);
  const exported=Object.keys(exports);assert.ok(exported.length>=35);
});
