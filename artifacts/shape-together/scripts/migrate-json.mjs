import 'dotenv/config';
import fs from 'fs/promises';
import crypto from 'crypto';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const file = process.argv[2] || path.resolve('data/db.json');
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
const db = createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});

function id(){return crypto.randomUUID()}
function initials(name){return String(name||'EU').trim().split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'EU'}

const old=JSON.parse(await fs.readFile(file,'utf8'));
const users=Array.isArray(old.users)?old.users:[];
if(!users.length) throw new Error('O JSON não tem usuários.');
const mapping=new Map();
for(const u of users){
  const {data: existing}=await db.from('app_users').select('*').eq('username',String(u.username||'').toLowerCase()).maybeSingle();
  if(existing){mapping.set(u.id,existing.id);continue;}
  const newId=id(); mapping.set(u.id,newId);
  const {error}=await db.from('app_users').insert({id:newId,name:String(u.name||'Participante').slice(0,60),username:String(u.username||newId.slice(0,8)).toLowerCase(),initials:String(u.initials||initials(u.name)).slice(0,3),color:/^#[0-9A-Fa-f]{6}$/.test(u.color||'')?u.color:'#4C7DFF',password_hash:u.passwordHash||null});
  if(error)throw error;
}
const code=crypto.randomBytes(5).toString('hex').toUpperCase();
const {data: group,error:gErr}=await db.from('groups').insert({name:'Shape Together',created_by:mapping.get(users[0].id),invite_code:code}).select('*').single();
if(gErr)throw gErr;
for(const u of users){
  const newId=mapping.get(u.id);
  await db.from('group_members').insert({group_id:group.id,user_id:newId,role:newId===mapping.get(users[0].id)?'owner':'member'});
  await db.from('app_users').update({active_group_id:group.id}).eq('id',newId);
  await db.from('user_preferences').upsert({user_id:newId,theme:'light',accent:'#11120F'},{onConflict:'user_id'});
  const days=old.days?.[u.id]||{};
  for(const [day,rec] of Object.entries(days)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day) || !['red','green','blue','orange'].includes(rec?.status)) continue;
    const {error}=await db.from('day_records').upsert({user_id:newId,day,status:rec.status,note:String(rec.note||'').slice(0,500)},{onConflict:'user_id,day'});
    if(error)throw error;
  }
}
console.log(`Migração concluída. Grupo criado: ${group.invite_code}`);
