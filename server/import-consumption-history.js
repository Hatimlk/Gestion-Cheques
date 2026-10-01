require('dotenv').config();
const path = require('path');
const XLSX = require(path.join(__dirname, '..', 'node_modules', 'xlsx'));
const db = require('./db');

const months = { janvier:1, fevrier:2, mars:3, avril:4, mai:5, juin:6, juillet:7, aout:8, septembre:9, octobre:10, novembre:11, decembre:12 };
const clean = v => String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const num = v => v === null || v === undefined || v === '' || v === '-' ? null : Number(v);
const combined = (...values) => values.every(v => num(v) === null) ? null : values.reduce((a,v) => a + (num(v) || 0), 0);

async function run(){
 const file=process.argv[2];if(!file)throw new Error('Chemin Excel requis.');
 const wb=XLSX.readFile(file),sheet=wb.Sheets[wb.SheetNames[0]],rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:true,defval:null});
 const branchMap=new Map();for(const code of ['G1','G2','G3','G5']){const r=await db.query(`INSERT INTO consumption_branches(code,name) VALUES($1,$1) ON CONFLICT(code) DO UPDATE SET active=TRUE RETURNING id`,[code]);branchMap.set(code,r.rows[0].id)}
 let year=null,month=null,imported=0;const records=[];
 for(const row of rows){if(Number(row[0])>=2000)year=Number(row[0]);if(months[clean(row[1])])month=months[clean(row[1])];const code=String(row[2]||'').trim().toUpperCase();if(year&&month&&branchMap.has(code)){const record={branchId:branchMap.get(code),year,month,electricityAmount:num(row[3]),electricityKwh:num(row[4]),waterAmount:combined(row[6],row[8]),waterM3:combined(row[7],row[9]),fixed:null,mobile:null};if([record.electricityAmount,record.electricityKwh,record.waterAmount,record.waterM3].some(v=>v!==null))records.push(record)}if(year&&month&&(num(row[11])!==null||num(row[12])!==null))records.push({branchId:null,year,month,electricityAmount:null,electricityKwh:null,waterAmount:null,waterM3:null,fixed:num(row[11]),mobile:num(row[12])})}
 const client=await db.connect();try{await client.query('BEGIN');for(const r of records){await client.query(`INSERT INTO consumption_records(branch_id,year,month,electricity_amount,electricity_kwh,water_amount,water_m3,telecom_internet_fixed_amount,telecom_mobile_amount,notes)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'Historique Excel 11-09-2026') ON CONFLICT ((COALESCE(branch_id,0)),year,month) DO UPDATE SET electricity_amount=EXCLUDED.electricity_amount,electricity_kwh=EXCLUDED.electricity_kwh,water_amount=EXCLUDED.water_amount,water_m3=EXCLUDED.water_m3,telecom_internet_fixed_amount=EXCLUDED.telecom_internet_fixed_amount,telecom_mobile_amount=EXCLUDED.telecom_mobile_amount,notes=EXCLUDED.notes,updated_at=NOW()`,[r.branchId,r.year,r.month,r.electricityAmount,r.electricityKwh,r.waterAmount,r.waterM3,r.fixed,r.mobile]);imported++}await client.query('COMMIT')}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}
 const result=await db.query(`SELECT COUNT(1)::int total,COUNT(DISTINCT year||'-'||month)::int periods FROM consumption_records`);console.log(JSON.stringify({imported,...result.rows[0]}));await db.end();
}
run().catch(async e=>{console.error(e.message);await db.end().catch(()=>{});process.exit(1)});

