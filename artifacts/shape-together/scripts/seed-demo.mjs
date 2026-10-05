import 'dotenv/config';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
const db = createClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } });

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve,reject)=>crypto.scrypt(password,salt,64,(err,derived)=>err?reject(err):resolve(`${salt}:${derived.toString('hex')}`)));
}
function initials(name){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'EU'}

const users = [
  {name:'Você',username:'voce',password:'123456',color:'#4C7DFF'},
  {name:'Amigo 1',username:'amigo1',password:'123456',color:'#E6536F'},
  {name:'Amigo 2',username:'amigo2',password:'123456',color:'#19A779'}
];

const ids=[];
for(const item of users){
  const password_hash=await hashPassword(item.password);
  const {data: existing}=await db.from('app_users').select('*').eq('username',item.username).maybeSingle();
  if(existing){ids.push(existing.id);continue;}
  const {data,error}=await db.from('app_users').insert({name:item.name,username:item.username,initials:initials(item.name),color:item.color,password_hash}).select('*').single();
  if(error)throw error;
  ids.push(data.id);
}
const {data: groups}=await db.from('groups').select('*').eq('name','Shape Together').limit(1);
let group=groups?.[0];
if(!group){
  const code=crypto.randomBytes(5).toString('hex').toUpperCase();
  const {data,error}=await db.from('groups').insert({name:'Shape Together',created_by:ids[0],invite_code:code}).select('*').single();
  if(error)throw error; group=data;
}
for(let i=0;i<ids.length;i++){
  await db.from('group_members').upsert({group_id:group.id,user_id:ids[i],role:i===0?'owner':'member'},{onConflict:'group_id,user_id'});
  await db.from('app_users').update({active_group_id:group.id}).eq('id',ids[i]);
  await db.from('user_preferences').upsert({user_id:ids[i],theme:'light',accent:'#11120F'},{onConflict:'user_id'});
}
console.log(`Demo pronta. Grupo: ${group.invite_code}`);
console.log('Contas iniciais: voce/amigo1/amigo2 com senha 123456. Troque-as antes de uso público.');
