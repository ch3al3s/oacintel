'use client'
import { useState, useEffect } from 'react'

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = 'oac2024'
const GOLD = { main: '#C8A84B', light: '#E8D08A', dark: '#8B6914' }
const ALL_SECTORS = ['TECH','FINANCE','ENERGY','CONSUMER','HEALTH','CRYPTO','PROPERTY','AI','GEOPOLITICS','MEDIA']
const URGENCY_CFG = {
  HOT:    { color: '#C8A84B', bg: 'rgba(200,168,75,0.12)',  label: '● HOT'     },
  RISING: { color: '#A08030', bg: 'rgba(160,128,48,0.1)',  label: '▲ RISING'  },
  WATCH:  { color: '#4A4A4A', bg: 'rgba(74,74,74,0.12)',   label: '◎ WATCH'   },
}
const TAG_COLORS = {
  TECH:'#C8A84B',FINANCE:'#D4B866',ENERGY:'#B8943E',CONSUMER:'#C8A84B',
  HEALTH:'#A08030',CRYPTO:'#D4B866',PROPERTY:'#B8943E',AI:'#E8D08A',
  GEOPOLITICS:'#C8A84B',MEDIA:'#B8943E'
}
const VOTE_OPTIONS = [
  { id:'bull',  label:'BULLISH',  icon:'▲', color:'#4CAF50' },
  { id:'bear',  label:'BEARISH',  icon:'▼', color:'#F44336' },
  { id:'watch', label:'WATCHING', icon:'◎', color:'#C8A84B' },
]
const SEED_SIGNALS = [
  { id:'s1', tag:'AI',         urgency:'HOT',    time: Date.now()-1000*60*8,       what:"OpenAI quietly filed patents for on-device AI chips that would eliminate cloud dependency entirely.",                                                         why:"If AI runs locally on phones, the entire cloud computing market faces an existential threat. Microsoft, Google, AWS all at risk.",                      how:"On-device chip suppliers and edge AI infrastructure companies are massively underpriced right now.",                             premium:false, aiGenerated:false, votes:{bull:34,bear:8,watch:19} },
  { id:'s2', tag:'FINANCE',    urgency:'RISING', time: Date.now()-1000*60*45,      what:"Three major UK pension funds quietly moved 12% of assets into alternatives — the largest reallocation in a decade.",                                          why:"Pension funds moving this fast signals deep concern about traditional market stability. Retail investors are always last to know.",                     how:"Alternative asset platforms and commodities are where smart money is quietly accumulating.",                                     premium:false, aiGenerated:false, votes:{bull:21,bear:5,watch:31} },
  { id:'s3', tag:'ENERGY',     urgency:'HOT',    time: Date.now()-1000*60*60*2,    what:"Saudi Arabia just signed a £40bn deal to build solar infrastructure — quietly abandoning its 2030 oil-first vision.",                                          why:"The world's largest oil producer is betting against oil. This is the smartest financial minds on earth making a calculated exit.",                     how:"Solar supply chain companies, particularly panel and inverter manufacturers, are at the start of a decade-long demand curve.",    premium:true,  aiGenerated:false, votes:{bull:89,bear:12,watch:24} },
  { id:'s4', tag:'PROPERTY',   urgency:'WATCH',  time: Date.now()-1000*60*60*5,    what:"UK planning laws just changed to allow basement-to-roof conversions without planning permission in 40 cities.",                                                  why:"Millions of underutilised properties can now be legally expanded overnight. This reshapes residential property in ways nobody has priced in.",          how:"Property investors with existing stock in those 40 cities just got a free value-add.",                                          premium:true,  aiGenerated:false, votes:{bull:45,bear:18,watch:37} },
  { id:'s5', tag:'GEOPOLITICS',urgency:'RISING', time: Date.now()-1000*60*60*8,    what:"Taiwan has begun relocating key semiconductor manufacturing equipment to undisclosed locations — quietly, over 60 days.",                                      why:"When the world's most critical manufacturers move equipment, markets haven't priced it yet. Geopolitical hedging at the highest level.",                how:"Companies building semiconductor capacity in Europe and the US are the immediate beneficiary.",                                  premium:true,  aiGenerated:false, votes:{bull:67,bear:22,watch:41} },
]

function timeAgo(ts) {
  const m = Math.floor((Date.now()-ts)/60000)
  if (m<1)  return 'just now'
  if (m<60) return `${m}m ago`
  const h = Math.floor(m/60)
  if (h<24) return `${h}h ago`
  return `${Math.floor(h/24)}d ago`
}

// ─── EMAIL ────────────────────────────────────────────────────────────────────
async function sendEmail({ to, subject, html }) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    })
    return await res.json()
  } catch(e) {
    console.error('Email error:', e)
    return { error: e.message }
  }
}

function hotSignalEmail(signal, name) {
  return `<!DOCTYPE html><html><body style="background:#080808;font-family:Georgia,serif;margin:0;padding:0;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:26px;font-weight:800;color:#C8A84B;letter-spacing:0.05em;">OACIntel</div>
    <div style="font-size:9px;color:#333;letter-spacing:0.25em;margin-top:4px;">INTELLIGENCE BRIEF</div>
  </div>
  <div style="background:#0D0D0D;border:1px solid rgba(200,168,75,0.2);border-radius:12px;padding:28px;margin-bottom:20px;">
    <div style="font-size:9px;font-weight:800;letter-spacing:0.2em;color:#C8A84B;margin-bottom:8px;">● HOT SIGNAL — ${signal.tag}</div>
    <div style="font-size:16px;color:#E0E0E0;line-height:1.6;margin-bottom:18px;">${signal.what}</div>
    <div style="border-top:1px solid rgba(200,168,75,0.12);padding-top:16px;margin-bottom:14px;">
      <div style="font-size:8px;font-weight:800;letter-spacing:0.2em;color:#444;margin-bottom:6px;">WHY IT MATTERS</div>
      <div style="font-size:13px;color:#777;line-height:1.6;">${signal.why}</div>
    </div>
    <div style="border-top:1px solid rgba(200,168,75,0.12);padding-top:16px;">
      <div style="font-size:8px;font-weight:800;letter-spacing:0.2em;color:#444;margin-bottom:6px;">HOW TO POSITION</div>
      <div style="font-size:13px;color:#777;line-height:1.6;">${signal.how}</div>
    </div>
  </div>
  <div style="text-align:center;padding:18px 0;">
    <a href="https://oacintel.com" style="background:linear-gradient(135deg,#C8A84B,#8B6914);color:#000;font-size:11px;font-weight:800;letter-spacing:0.15em;padding:13px 28px;border-radius:6px;text-decoration:none;">VIEW FULL INTELLIGENCE →</a>
  </div>
  <div style="text-align:center;font-size:10px;color:#1E1E1E;margin-top:20px;">OACIntel · Intelligence for those who move first · <a href="https://oacintel.com" style="color:#2A2A2A;">Unsubscribe</a></div>
</div></body></html>`
}

function dailyBriefEmail(signals, name) {
  const top = [...signals.filter(s=>s.urgency==='HOT'), ...signals.filter(s=>s.urgency==='RISING')].slice(0,4)
  const rows = top.map(s => `
    <div style="border-bottom:1px solid #141414;padding:14px 0;">
      <div style="font-size:8px;font-weight:800;letter-spacing:0.15em;color:${s.urgency==='HOT'?'#C8A84B':'#A08030'};margin-bottom:5px;">${s.urgency==='HOT'?'●':'▲'} ${s.tag}</div>
      <div style="font-size:14px;color:#D0D0D0;line-height:1.5;">${s.what}</div>
    </div>`).join('')
  return `<!DOCTYPE html><html><body style="background:#080808;font-family:Georgia,serif;margin:0;padding:0;">
<div style="max-width:560px;margin:0 auto;padding:40px 20px;">
  <div style="text-align:center;margin-bottom:22px;">
    <div style="font-size:26px;font-weight:800;color:#C8A84B;letter-spacing:0.05em;">OACIntel</div>
    <div style="font-size:9px;color:#333;letter-spacing:0.25em;margin-top:4px;">DAILY INTELLIGENCE BRIEF</div>
    <div style="font-size:9px;color:#1E1E1E;margin-top:3px;">${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}</div>
  </div>
  <div style="background:#0D0D0D;border:1px solid rgba(200,168,75,0.15);border-radius:12px;padding:24px;">
    <div style="font-size:12px;color:#444;margin-bottom:16px;">Good morning${name?', '+name:''}. Today's top signals.</div>
    ${rows}
  </div>
  <div style="text-align:center;padding:18px 0;">
    <a href="https://oacintel.com" style="background:linear-gradient(135deg,#C8A84B,#8B6914);color:#000;font-size:11px;font-weight:800;letter-spacing:0.15em;padding:13px 28px;border-radius:6px;text-decoration:none;">SEE ALL SIGNALS →</a>
  </div>
  <div style="text-align:center;font-size:10px;color:#1E1E1E;margin-top:20px;">OACIntel · Intelligence for those who move first · <a href="https://oacintel.com" style="color:#2A2A2A;">Unsubscribe</a></div>
</div></body></html>`
}

// ─── AI GENERATE ──────────────────────────────────────────────────────────────
async function aiGenerateSignal(sector, existing) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `You are OACIntel, an elite intelligence platform. Generate ONE high-quality signal for the ${sector} sector based on real current events in ${new Date().getFullYear()}. It must be specific, pre-mainstream, and actionable. Respond ONLY with valid JSON no markdown backticks: {"what":"1-2 sentence specific signal","why":"2-3 sentences on consequence","how":"2-3 sentences actionable positioning","urgency":"HOT or RISING or WATCH","premium":true or false}`
      }]
    })
  })
  const data = await res.json()
  const tb = data.content?.find(b => b.type === 'text')
  if (!tb) throw new Error('No response')
  const parsed = JSON.parse(tb.text.replace(/```json|```/g,'').trim())
  return { ...parsed, id: 'ai_'+Date.now(), tag: sector, time: Date.now(), aiGenerated: true, votes: { bull:0, bear:0, watch:0 } }
}

// ─── STORAGE HELPERS ──────────────────────────────────────────────────────────
async function storageGet(key, shared=false) {
  try { const r = await window.storage.get(key, shared); return r?.value ? JSON.parse(r.value) : null } catch { return null }
}
async function storageSet(key, value, shared=false) {
  try { await window.storage.set(key, JSON.stringify(value), shared) } catch {}
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function OACLogo({ size=1 }) {
  return (
    <svg width={72*size} height={32*size} viewBox="0 0 120 52" fill="none">
      <defs>
        <linearGradient id={`g${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#E8D08A"/>
          <stop offset="45%"  stopColor="#C8A84B"/>
          <stop offset="100%" stopColor="#8B6914"/>
        </linearGradient>
      </defs>
      <circle cx="22" cy="26" r="16" stroke={`url(#g${size})`} strokeWidth="7" fill="none"/>
      <path d="M38 26 Q54 6 70 26 Q54 46 38 26Z" stroke={`url(#g${size})`} strokeWidth="7" fill="none" strokeLinejoin="round"/>
      <path d="M118 14 Q100 6 88 26 Q100 46 118 38" stroke={`url(#g${size})`} strokeWidth="7" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep]         = useState(0)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [hotAlerts, setHot]     = useState(true)
  const [dailyBrief, setDaily]  = useState(true)
  const [interests, setInt]     = useState([])
  const [anim, setAnim]         = useState(true)

  const go = n => { setAnim(false); setTimeout(() => { setStep(n); setAnim(true) }, 280) }
  const tog = s => setInt(p => p.includes(s) ? p.filter(x=>x!==s) : [...p,s])

  return (
    <div style={S.obRoot}>
      <div style={S.obBg}/>
      <div style={{ ...S.obCard, opacity:anim?1:0, transform:anim?'translateY(0)':'translateY(20px)', transition:'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}>

        {step===0 && <div style={S.obInner}>
          <OACLogo size={1.2}/>
          <div style={S.obTitle}>Intelligence for those who move first.</div>
          <div style={S.obSub}>OACIntel surfaces signals before they become news.</div>
          {['⚡ AI-powered real-time signals','🗳 Community predictions on every signal','📬 Email alerts & daily intelligence brief','🎯 Personalised to your sectors'].map(f=>(
            <div key={f} style={S.obFeat}>{f}</div>
          ))}
          <button style={S.goldBtn} onClick={()=>go(1)}>GET MY EDGE →</button>
          <div style={S.obSmall}>Free to start · No card required</div>
        </div>}

        {step===1 && <div style={S.obInner}>
          <div style={S.stepLbl}>STEP 1 OF 3</div>
          <div style={S.obTitle}>What's your name?</div>
          <div style={S.obSub}>You'll appear in the community predictions.</div>
          <input style={S.obInput} placeholder="Your name or handle" value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==='Enter'&&name.trim()&&go(2)} autoFocus/>
          <button style={{ ...S.goldBtn, opacity:name.trim()?1:0.35 }} onClick={()=>name.trim()&&go(2)}>CONTINUE →</button>
        </div>}

        {step===2 && <div style={S.obInner}>
          <div style={S.stepLbl}>STEP 2 OF 3</div>
          <div style={S.obTitle}>Stay ahead by email</div>
          <div style={S.obSub}>HOT alerts + daily morning brief in your inbox.</div>
          <input style={S.obInput} type="email" placeholder="your@email.com (optional)" value={email} onChange={e=>setEmail(e.target.value)}/>
          <div style={S.toggleGroup}>
            {[{lbl:'🔥 HOT signal alerts', sub:'Instant when critical signals drop', val:hotAlerts, set:setHot},
              {lbl:'☀️ Daily morning brief', sub:'Top signals every morning at 7am', val:dailyBrief, set:setDaily}
            ].map(({lbl,sub,val,set},i)=>(
              <div key={i} style={S.toggleRow} onClick={()=>set(v=>!v)}>
                <div><div style={S.toggleLbl}>{lbl}</div><div style={S.toggleSub}>{sub}</div></div>
                <Toggle on={val}/>
              </div>
            ))}
          </div>
          <button style={S.goldBtn} onClick={()=>go(3)}>CONTINUE →</button>
          <button style={S.skipBtn} onClick={()=>go(3)}>Skip for now</button>
        </div>}

        {step===3 && <div style={S.obInner}>
          <div style={S.stepLbl}>STEP 3 OF 3</div>
          <div style={S.obTitle}>What moves you?</div>
          <div style={S.obSub}>Your feed will be personalised to these sectors.</div>
          <div style={S.sectorGrid}>
            {ALL_SECTORS.map(s=>(
              <button key={s} style={{ ...S.sectorBtn, ...(interests.includes(s)?S.sectorOn:{}) }} onClick={()=>tog(s)}>{s}</button>
            ))}
          </div>
          <button style={{ ...S.goldBtn, opacity:interests.length>0?1:0.35, marginTop:18 }}
            onClick={()=>interests.length>0&&onComplete({ name:name.trim()||'Anon', email:email.trim(), hotAlerts, dailyBrief, interests })}>
            ENTER OACINTEL →
          </button>
          <div style={S.obSmall}>{interests.length} sector{interests.length!==1?'s':''} selected</div>
        </div>}

      </div>
    </div>
  )
}

// ─── TOGGLE ───────────────────────────────────────────────────────────────────
function Toggle({ on }) {
  return (
    <div style={{ width:36,height:20,borderRadius:10,background:on?GOLD.main:'#1A1A1A',position:'relative',transition:'background 0.2s ease',flexShrink:0 }}>
      <div style={{ position:'absolute',top:2,width:16,height:16,borderRadius:'50%',background:'#fff',transition:'transform 0.2s ease',transform:on?'translateX(16px)':'translateX(2px)' }}/>
    </div>
  )
}

// ─── SIGNAL CARD ──────────────────────────────────────────────────────────────
function SignalCard({ signal, isPro, saved, onSave, onUpgrade, index, loaded }) {
  const [exp, setExp] = useState(false)
  const urg = URGENCY_CFG[signal.urgency]||URGENCY_CFG.WATCH
  const locked = signal.premium && !isPro
  return (
    <div style={{ ...S.card, opacity:loaded?1:0, transform:loaded?'translateY(0)':'translateY(18px)', transition:`opacity 0.45s ease ${index*0.07}s,transform 0.45s ease ${index*0.07}s`, borderColor:signal.urgency==='HOT'?'rgba(200,168,75,0.18)':'#141414' }}
      className="oac-card" onClick={()=>locked?onUpgrade():setExp(e=>!e)}>
      {signal.urgency==='HOT'&&<div style={S.hotGlow}/>}
      <div style={S.cardAccent}/>
      <div style={S.cardTop}>
        <div style={{ display:'flex',gap:7,alignItems:'center',flexWrap:'wrap' }}>
          <span style={{ ...S.tag, color:TAG_COLORS[signal.tag]||GOLD.main }}>{signal.tag}</span>
          <span style={{ ...S.urg, color:urg.color, background:urg.bg }}>{urg.label}</span>
          {signal.premium&&<span style={S.proBadge}>PRO</span>}
          {signal.aiGenerated&&<span style={S.aiBadge}>⚡ AI</span>}
        </div>
        <div style={{ display:'flex',alignItems:'center',gap:8 }}>
          <span style={S.cardTime}>{timeAgo(signal.time)}</span>
          {!locked&&<button style={{ ...S.starBtn, color:saved?'#C8A84B':'#2A2A2A' }} onClick={e=>{e.stopPropagation();onSave(signal.id)}}>{saved?'★':'☆'}</button>}
        </div>
      </div>
      {locked ? (
        <div style={{ position:'relative' }}>
          <div style={{ ...S.cardWhat, filter:'blur(6px)', userSelect:'none', pointerEvents:'none', color:'#888' }}>{signal.what}</div>
          <div style={S.lockOverlay}><span style={S.lockText}>🔒 Pro signal — tap to unlock</span></div>
        </div>
      ) : (
        <>
          <div style={S.cardWhat}>{signal.what}</div>
          {exp&&<div style={S.expanded} className="oac-expand">
            <div style={S.expDiv}/>
            {[{n:'01',t:'WHY THIS MATTERS',b:signal.why,c:'#666'},{n:'02',t:'HOW TO POSITION',b:signal.how,c:GOLD.main}].map(({n,t,b,c})=>(
              <div key={n} style={S.layer}><div style={{ ...S.layerN, color:c }}>{n}</div><div><div style={S.layerT}>{t}</div><div style={S.layerB}>{b}</div></div></div>
            ))}
          </div>}
          <div style={S.cardFoot}>
            <span style={S.expandHint}>{exp?'▲ COLLAPSE':'▼ FULL INTELLIGENCE'}</span>
            <span style={{ fontSize:9, fontFamily:"'DM Sans',sans-serif", color:'#252525' }}>🗳 {(signal.votes?.bull||0)+(signal.votes?.bear||0)+(signal.votes?.watch||0)} votes</span>
          </div>
        </>
      )}
    </div>
  )
}

// ─── PREDICTIONS ──────────────────────────────────────────────────────────────
function Predictions({ signals, user, isPro, onUpgrade, onVoteUpdate }) {
  const [votes, setVotes] = useState({})
  const [anim, setAnim]   = useState(null)

  useEffect(()=>{ storageGet(`votes-${user.name}`).then(v=>v&&setVotes(v)) },[])

  const handleVote = async (sigId, voteId, signal) => {
    if (signal.premium&&!isPro) { onUpgrade(); return }
    if (votes[sigId]===voteId) return
    const nv = { ...votes, [sigId]: voteId }
    setVotes(nv)
    setAnim(sigId+'_'+voteId)
    setTimeout(()=>setAnim(null),600)
    await storageSet(`votes-${user.name}`, nv)
    onVoteUpdate(sigId, voteId, votes[sigId])
  }

  const pct = (v,k) => { const t=(v?.bull||0)+(v?.bear||0)+(v?.watch||0); return t?Math.round(((v[k]||0)/t)*100):0 }
  const consensus = v => {
    const b=pct(v,'bull'),r=pct(v,'bear')
    if (b>=60) return { lbl:'COMMUNITY: BULLISH', c:'#4CAF50' }
    if (r>=60) return { lbl:'COMMUNITY: BEARISH', c:'#F44336' }
    if (b>r)   return { lbl:'LEANING BULLISH',    c:'#8BC34A' }
    if (r>b)   return { lbl:'LEANING BEARISH',    c:'#FF7043' }
    return              { lbl:'COMMUNITY: DIVIDED', c:GOLD.main }
  }

  return (
    <div style={{ paddingBottom:20 }}>
      <div style={{ marginBottom:14 }}>
        <div style={S.sectionTitle}>Community Intelligence</div>
        <div style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#333',letterSpacing:'0.06em' }}>Vote on every signal. See where the crowd is positioning.</div>
      </div>
      <div style={{ display:'flex',gap:12,marginBottom:12,flexWrap:'wrap' }}>
        {VOTE_OPTIONS.map(v=>(
          <div key={v.id} style={{ display:'flex',alignItems:'center',gap:5 }}>
            <span style={{ color:v.color,fontWeight:800 }}>{v.icon}</span>
            <span style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#444',letterSpacing:'0.1em' }}>{v.label}</span>
          </div>
        ))}
      </div>
      {signals.map((sig,i)=>{
        const myVote = votes[sig.id]
        const total  = (sig.votes?.bull||0)+(sig.votes?.bear||0)+(sig.votes?.watch||0)
        const con    = consensus(sig.votes)
        const locked = sig.premium&&!isPro
        return (
          <div key={sig.id} style={{ ...S.card, borderColor:myVote?'rgba(200,168,75,0.2)':'#141414', opacity:1 }} className="oac-card">
            <div style={S.cardAccent}/>
            <div style={S.cardTop}>
              <div style={{ display:'flex',gap:7,alignItems:'center' }}>
                <span style={{ ...S.tag,color:TAG_COLORS[sig.tag]||GOLD.main }}>{sig.tag}</span>
                <span style={{ ...S.urg,color:URGENCY_CFG[sig.urgency]?.color,background:URGENCY_CFG[sig.urgency]?.bg }}>{URGENCY_CFG[sig.urgency]?.label}</span>
                {sig.premium&&<span style={S.proBadge}>PRO</span>}
              </div>
              <span style={S.cardTime}>{timeAgo(sig.time)}</span>
            </div>
            <div style={{ ...S.cardWhat, filter:locked?'blur(5px)':undefined, userSelect:locked?'none':undefined, marginBottom:12 }}>{sig.what}</div>
            {locked ? (
              <div style={{ display:'flex',justifyContent:'center',padding:'10px 0' }}>
                <span style={S.lockText} onClick={onUpgrade}>🔒 Upgrade to Pro to vote</span>
              </div>
            ) : (
              <>
                <div style={{ display:'flex',gap:6,marginBottom:12 }}>
                  {VOTE_OPTIONS.map(v=>{
                    const chosen = myVote===v.id
                    const isAnim = anim===sig.id+'_'+v.id
                    return (
                      <button key={v.id} style={{ flex:1,background:'transparent',border:`1px solid ${chosen?v.color:'#1A1A1A'}`,borderRadius:8,padding:'9px 4px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,fontFamily:"'DM Sans',sans-serif",color:chosen?v.color:'#444',background:chosen?v.color+'18':'transparent',transform:isAnim?'scale(1.08)':'scale(1)',transition:'all 0.2s ease' }}
                        onClick={()=>handleVote(sig.id,v.id,sig)}>
                        <span style={{ fontSize:14 }}>{v.icon}</span>
                        <span style={{ fontSize:8,fontWeight:800,letterSpacing:'0.1em' }}>{v.label}</span>
                        <span style={{ fontSize:9,color:chosen?v.color:'#2A2A2A' }}>{(sig.votes?.[v.id]||0)+(myVote===v.id&&!votes[sig.id]?1:0)}</span>
                      </button>
                    )
                  })}
                </div>
                {total>0&&(
                  <div style={{ marginBottom:8 }}>
                    <div style={{ height:4,borderRadius:2,background:'#111',display:'flex',overflow:'hidden',marginBottom:6 }}>
                      <div style={{ height:'100%',width:`${pct(sig.votes,'bull')}%`,background:'#4CAF50',transition:'width 0.4s ease' }}/>
                      <div style={{ height:'100%',width:`${pct(sig.votes,'watch')}%`,background:GOLD.main,transition:'width 0.4s ease' }}/>
                      <div style={{ height:'100%',width:`${pct(sig.votes,'bear')}%`,background:'#F44336',transition:'width 0.4s ease' }}/>
                    </div>
                    <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                      <span style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.1em',color:con.c }}>{con.lbl}</span>
                      <span style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A' }}>{total} votes</span>
                    </div>
                    <div style={{ display:'flex',gap:14 }}>
                      {[{k:'bull',c:'#4CAF50',i:'▲'},{k:'watch',c:GOLD.main,i:'◎'},{k:'bear',c:'#F44336',i:'▼'}].map(({k,c,i})=>(
                        <span key={k} style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:c }}>{i} {pct(sig.votes,k)}%</span>
                      ))}
                    </div>
                  </div>
                )}
                {myVote&&<div style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#333',marginTop:4 }}>
                  Your call: <span style={{ color:VOTE_OPTIONS.find(v=>v.id===myVote)?.color }}>{VOTE_OPTIONS.find(v=>v.id===myVote)?.label}</span>
                </div>}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── EMAIL MODAL ──────────────────────────────────────────────────────────────
function EmailModal({ existing, onSave, onClose }) {
  const [email, setEmail]     = useState(existing?.email||'')
  const [hot, setHot]         = useState(existing?.hotAlerts??true)
  const [daily, setDaily]     = useState(existing?.dailyBrief??true)
  const [status, setStatus]   = useState('')
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    if (!email||!email.includes('@')) { setStatus('⚠ Enter a valid email.'); return }
    setSaving(true)
    setStatus('Saving...')
    await onSave({ email, hotAlerts:hot, dailyBrief:daily })
    setStatus('✓ Notifications activated!')
    setSaving(false)
    setTimeout(onClose, 1500)
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.sheet} onClick={e=>e.stopPropagation()}>
        <button style={S.sheetClose} onClick={onClose}>✕</button>
        <div style={{ textAlign:'center',marginBottom:20 }}>
          <div style={{ fontSize:30,marginBottom:10 }}>📬</div>
          <div style={{ fontSize:20,color:GOLD.main,fontWeight:600,fontFamily:"'Cormorant Garamond',serif",marginBottom:6 }}>Email Notifications</div>
          <div style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#444' }}>Never miss a signal that changes everything.</div>
        </div>
        <input style={S.obInput} type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        <div style={{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.2em',color:'#333',marginBottom:12 }}>NOTIFY ME WHEN:</div>
        {[{lbl:'🔥 HOT signal drops',sub:'Instant alert when a critical signal goes live',val:hot,set:setHot},
          {lbl:'☀️ Daily morning brief',sub:'Top signals delivered every morning at 7am',val:daily,set:setDaily}
        ].map(({lbl,sub,val,set},i)=>(
          <div key={i} style={S.toggleRow} onClick={()=>set(v=>!v)}>
            <div><div style={S.toggleLbl}>{lbl}</div><div style={S.toggleSub}>{sub}</div></div>
            <Toggle on={val}/>
          </div>
        ))}
        {status&&<div style={{ color:GOLD.main,fontSize:12,fontFamily:"'DM Sans',sans-serif",textAlign:'center',margin:'12px 0' }}>{status}</div>}
        <button style={{ ...S.goldBtn, marginTop:18 }} disabled={saving} onClick={save}>ACTIVATE NOTIFICATIONS</button>
        <div style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A',textAlign:'center',marginTop:10 }}>No spam. Unsubscribe any time.</div>
      </div>
    </div>
  )
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function MainApp({ user, onReset }) {
  const [tab,       setTab]       = useState('feed')
  const [signals,   setSignals]   = useState(SEED_SIGNALS)
  const [saved,     setSaved]     = useState([])
  const [isPro,     setIsPro]     = useState(false)
  const [upgrade,   setUpgrade]   = useState(false)
  const [emailMod,  setEmailMod]  = useState(false)
  const [emailPref, setEmailPref] = useState({ email:user.email||'', hotAlerts:user.hotAlerts??true, dailyBrief:user.dailyBrief??true })
  const [notifBar,  setNotifBar]  = useState(!user.email)
  const [loaded,    setLoaded]    = useState(false)
  const [generating,setGen]       = useState(false)
  const [genStatus, setGenSt]     = useState('')
  const [liveCount, setLive]      = useState(3847)
  const [sector,    setSector]    = useState('ALL')

  useEffect(()=>{
    setTimeout(()=>setLoaded(true),100)
    storageGet('oac-signals',true).then(s=>s&&setSignals(s))
    storageGet(`saved-${user.name}`).then(s=>s&&setSaved(s))
    const iv=setInterval(()=>setLive(c=>c+Math.floor(Math.random()*2)),3000)
    return ()=>clearInterval(iv)
  },[])

  const saveSignals = async s => { setSignals(s); await storageSet('oac-signals',s,true) }
  const handleSave  = async id => {
    const ns = saved.includes(id)?saved.filter(x=>x!==id):[...saved,id]
    setSaved(ns); await storageSet(`saved-${user.name}`,ns)
  }
  const handleEmailSave = async prefs => {
    setEmailPref(prefs)
    setNotifBar(false)
    const u2 = { ...user, ...prefs }
    await storageSet('oac-user',u2)
    // Save subscriber list
    const subs = await storageGet('oac-subscribers',true)||[]
    const idx  = subs.findIndex(s=>s.email===prefs.email)
    const entry= { email:prefs.email, name:user.name, hotAlerts:prefs.hotAlerts, dailyBrief:prefs.dailyBrief }
    const ns   = idx>=0 ? subs.map((s,i)=>i===idx?entry:s) : [...subs,entry]
    await storageSet('oac-subscribers',ns,true)
    // Welcome email
    await sendEmail({ to:prefs.email, subject:'Welcome to OACIntel — Your intelligence is live', html:`<div style="background:#080808;padding:40px;font-family:Georgia,serif;text-align:center;"><h1 style="color:#C8A84B;">Welcome to OACIntel</h1><p style="color:#888;font-size:14px;">You're now set up for ${prefs.hotAlerts?'HOT signal alerts':''}${prefs.hotAlerts&&prefs.dailyBrief?' and ':''}${prefs.dailyBrief?'daily morning briefs':''}.</p><p style="color:#444;font-size:12px;margin-top:16px;">Intelligence is live. Move first.</p></div>` })
  }
  const handleGenerate = async () => {
    const s = sector==='ALL'?(user.interests[0]||'TECH'):sector
    setGen(true); setGenSt(`Searching live ${s} intelligence...`)
    try {
      const sig = await aiGenerateSignal(s, signals)
      const ns  = [sig,...signals]
      await saveSignals(ns)
      setGenSt(`✓ New ${s} signal live`)
      setTab('feed')
      // Email HOT alerts
      if (sig.urgency==='HOT' && emailPref.email && emailPref.hotAlerts) {
        const subs = await storageGet('oac-subscribers',true)||[]
        for (const sub of subs.filter(s=>s.hotAlerts)) {
          await sendEmail({ to:sub.email, subject:`🔥 OACIntel HOT Signal: ${sig.tag}`, html:hotSignalEmail(sig,sub.name||'') })
        }
      }
    } catch { setGenSt('⚠ Generation failed. Try again.') }
    setGen(false); setTimeout(()=>setGenSt(''),4000)
  }
  const handleVoteUpdate = (sigId, newVote, prevVote) => {
    setSignals(prev => prev.map(s => {
      if (s.id!==sigId) return s
      const votes = { ...s.votes }
      if (prevVote) votes[prevVote] = Math.max(0,(votes[prevVote]||0)-1)
      votes[newVote] = (votes[newVote]||0)+1
      return { ...s, votes }
    }))
  }

  const feed = [...signals].sort((a,b)=>{
    const am=user.interests.includes(a.tag)?1:0, bm=user.interests.includes(b.tag)?1:0
    return bm!==am ? bm-am : b.time-a.time
  })
  const filtered   = sector==='ALL' ? feed : feed.filter(s=>s.tag===sector)
  const savedSigs  = signals.filter(s=>saved.includes(s.id))
  const uniqueSecs = ['ALL',...user.interests,...ALL_SECTORS.filter(s=>!user.interests.includes(s))].filter((s,i,a)=>a.indexOf(s)===i)

  return (
    <div style={S.root}>
      <div style={S.glow}/>
      <div style={S.phone}>
        <div style={S.notch}/>
        <div style={S.statusBar}>
          <span style={{ color:'#555',fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:600 }}>9:41</span>
          <span style={{ fontSize:9,color:'#333',letterSpacing:1 }}>▲▲▲ ◈ ▮▮</span>
        </div>

        {/* Header */}
        <div style={{ ...S.header, opacity:loaded?1:0, transform:loaded?'translateY(0)':'translateY(-10px)', transition:'all 0.6s cubic-bezier(0.16,1,0.3,1)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <OACLogo size={0.85}/>
            <div style={S.intelTag}>INTEL</div>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:7 }}>
            <div style={S.liveChip}>
              <span className="gold-pulse" style={{ width:5,height:5,borderRadius:'50%',background:GOLD.main,display:'inline-block' }}/>
              <span style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:GOLD.main }}>{liveCount.toLocaleString()}</span>
              <span style={{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#3A3A3A',letterSpacing:'0.15em' }}>LIVE</span>
            </div>
            <button style={{ background:'none',border:'none',fontSize:16,cursor:'pointer',color:emailPref.email?GOLD.main:'#333' }} onClick={()=>setEmailMod(true)}>{emailPref.email?'🔔':'🔕'}</button>
            {isPro&&<span style={S.proChip}>PRO</span>}
          </div>
        </div>

        <div style={S.divider}/>

        {/* Notif banner */}
        {notifBar&&(
          <div style={S.notifBar}>
            <span>📬</span>
            <div style={{ flex:1 }}><div style={{ fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:'#CCC',marginBottom:2 }}>Set up email alerts</div><div style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#333' }}>HOT signals & daily briefs in your inbox</div></div>
            <button style={S.notifBtn} onClick={()=>{setEmailMod(true);setNotifBar(false)}}>SET UP</button>
            <button style={{ background:'none',border:'none',color:'#333',fontSize:14,cursor:'pointer',padding:'0 4px' }} onClick={()=>setNotifBar(false)}>✕</button>
          </div>
        )}

        {/* Tabs */}
        <div style={S.tabs}>
          {[{id:'feed',l:'SIGNALS'},{id:'predict',l:'PREDICT'},{id:'saved',l:`SAVED${savedSigs.length>0?` (${savedSigs.length})`:''}`},{id:'account',l:'YOU'}].map(t=>(
            <button key={t.id} style={{ ...S.tab,...(tab===t.id?S.tabOn:{}) }} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </div>

        <div style={S.content}>

          {tab==='feed'&&<div>
            <div style={{ ...S.brief, opacity:loaded?1:0, transition:'opacity 0.5s ease 0.3s' }}>
              <div style={S.briefDate}>INTELLIGENCE BRIEF — {new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</div>
              <div style={S.briefText}>Personalised for {user.name} · {signals.length} signals · {user.interests.length} sectors</div>
            </div>
            {!isPro&&<div style={S.lockBanner}>
              <span>🔒</span>
              <div style={{ flex:1 }}><div style={{ fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:'#BBB',marginBottom:2 }}>48hrs behind real-time</div><div style={{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#2E2E2E' }}>Upgrade Pro for live signals</div></div>
              <button style={S.lockBtn} onClick={()=>setUpgrade(true)}>PRO →</button>
            </div>}
            {/* Sector filter */}
            <div style={{ overflow:'hidden',marginBottom:9 }}>
              <div style={{ display:'flex',gap:5,overflowX:'auto',paddingBottom:4 }}>
                {uniqueSecs.map(s=>(
                  <button key={s} style={{ ...S.filterBtn,...(sector===s?S.filterOn:{}) }} onClick={()=>setSector(s)}>{s}</button>
                ))}
              </div>
            </div>
            <button style={S.genBtn} disabled={generating} onClick={handleGenerate}>
              {generating?<span className="spin-text">{genStatus||'Generating...'}</span>:<span>⚡ AI: Generate {sector==='ALL'?(user.interests[0]||'TECH'):sector} signal</span>}
            </button>
            {genStatus&&!generating&&<div style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:GOLD.main,textAlign:'center',marginBottom:8 }}>{genStatus}</div>}
            {filtered.map((sig,i)=>(
              <SignalCard key={sig.id} signal={sig} isPro={isPro} saved={saved.includes(sig.id)} onSave={handleSave} onUpgrade={()=>setUpgrade(true)} index={i} loaded={loaded}/>
            ))}
          </div>}

          {tab==='predict'&&<Predictions signals={signals} user={user} isPro={isPro} onUpgrade={()=>setUpgrade(true)} onVoteUpdate={handleVoteUpdate}/>}

          {tab==='saved'&&<div>
            {savedSigs.length===0
              ? <div style={S.empty}><div style={{ fontSize:34,color:'#1E1E1E',marginBottom:14 }}>☆</div><div style={S.emptyT}>No saved intelligence</div><div style={S.emptyS}>Star signals from the feed</div></div>
              : savedSigs.map((sig,i)=><SignalCard key={sig.id} signal={sig} isPro={isPro} saved={true} onSave={handleSave} onUpgrade={()=>setUpgrade(true)} index={i} loaded={true}/>)
            }
          </div>}

          {tab==='account'&&<div style={S.profileWrap}>
            <div style={S.profileRing}><OACLogo size={0.9}/></div>
            <div style={S.profileName}>{user.name}</div>
            <div style={S.profileTier}>{isPro?'PRO ACCESS':'FREE ACCESS'}</div>
            <div style={S.statsRow}>
              {[[savedSigs.length.toString(),'Saved'],[user.interests.length.toString(),'Sectors'],[isPro?'LIVE':'48H','Access']].map(([v,l])=>(
                <div key={l} style={S.statBox}><div style={S.statV}>{v}</div><div style={S.statL}>{l}</div></div>
              ))}
            </div>
            {/* Email card */}
            <div style={{ width:'100%',background:'#0A0A0A',border:`1px solid rgba(200,168,75,0.12)`,borderRadius:10,padding:'14px 16px',marginBottom:13 }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                <div style={{ fontSize:13,color:GOLD.main,fontWeight:600,fontFamily:"'Cormorant Garamond',serif" }}>📬 Email Notifications</div>
                <button style={{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',color:GOLD.main,background:'none',border:`1px solid rgba(200,168,75,0.25)`,borderRadius:4,padding:'4px 10px',cursor:'pointer' }} onClick={()=>setEmailMod(true)}>EDIT</button>
              </div>
              {emailPref.email
                ? <div>
                    <div style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#888',marginBottom:6 }}>{emailPref.email}</div>
                    <div style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",display:'flex',gap:12 }}>
                      <span style={{ color:emailPref.hotAlerts?GOLD.main:'#2A2A2A' }}>{emailPref.hotAlerts?'🔥 HOT ON':'🔥 HOT OFF'}</span>
                      <span style={{ color:emailPref.dailyBrief?GOLD.main:'#2A2A2A' }}>{emailPref.dailyBrief?'☀️ DAILY ON':'☀️ DAILY OFF'}</span>
                    </div>
                  </div>
                : <div style={{ fontSize:11,fontFamily:"'DM Sans',sans-serif",color:'#333' }}>No email set up. Tap EDIT to add one.</div>
              }
            </div>
            {/* Pro card */}
            {!isPro
              ? <div style={S.proCard}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10 }}>
                    <div style={{ fontSize:17,color:GOLD.main,fontWeight:600 }}>OACIntel Pro</div>
                    <div style={{ fontSize:20,color:'#fff',fontWeight:700,fontFamily:"'DM Sans',sans-serif" }}>£9<span style={{ fontSize:12,color:'#555' }}>/mo</span></div>
                  </div>
                  <div style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#444',lineHeight:1.5,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #111' }}>The intelligence that used to cost £50,000 a year.</div>
                  {['⚡ Real-time signals','🔒 All Pro signals unlocked','🗳 Vote on all predictions','🤖 Unlimited AI generation','📊 Weekly intelligence report'].map(f=>(
                    <div key={f} style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#777',padding:'7px 0',borderBottom:'1px solid #0F0F0F',display:'flex',alignItems:'center' }}>
                      <span style={{ color:GOLD.main,marginRight:8 }}>◆</span>{f}
                    </div>
                  ))}
                  <button style={S.proBtn} onClick={()=>setUpgrade(true)}>UPGRADE TO PRO — £9/MO</button>
                </div>
              : <div style={{ ...S.proCard,textAlign:'center',padding:28 }}>
                  <div style={{ fontSize:32,marginBottom:10 }}>◆</div>
                  <div style={{ fontSize:17,color:GOLD.main,fontWeight:600,marginBottom:8 }}>Pro Access Active</div>
                  <div style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#444' }}>All signals live. Full intelligence unlocked.</div>
                  <button style={{ ...S.proBtn,marginTop:18,background:'#0F0F0F',color:'#333',border:'1px solid #1A1A1A' }} onClick={()=>setIsPro(false)}>Downgrade</button>
                </div>
            }
            <button style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#1E1E1E',background:'none',border:'none',cursor:'pointer',marginTop:4,marginBottom:18 }} onClick={onReset}>← Reset onboarding</button>
          </div>}
        </div>

        {/* Nav */}
        <div style={{ background:'#080808',paddingBottom:22 }}>
          <div style={S.divider}/>
          <div style={{ display:'flex' }}>
            {[{id:'feed',icon:'⚡',l:'SIGNALS'},{id:'predict',icon:'🗳',l:'PREDICT'},{id:'saved',icon:'★',l:'SAVED'},{id:'account',icon:'◎',l:'YOU'}].map(item=>(
              <button key={item.id} style={{ flex:1,background:'transparent',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:2,padding:'9px 4px 3px',fontFamily:"'DM Sans',sans-serif",color:tab===item.id?GOLD.main:'#222',transition:'color 0.2s ease' }} onClick={()=>setTab(item.id)}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ fontSize:8,letterSpacing:'0.1em',marginTop:2 }}>{item.l}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upgrade modal */}
        {upgrade&&<div style={S.overlay} onClick={()=>setUpgrade(false)}>
          <div style={S.sheet} onClick={e=>e.stopPropagation()}>
            <button style={S.sheetClose} onClick={()=>setUpgrade(false)}>✕</button>
            <div style={{ textAlign:'center',marginBottom:18 }}><OACLogo size={1}/></div>
            <div style={{ fontSize:22,color:GOLD.main,fontWeight:600,textAlign:'center',marginBottom:6,fontFamily:"'Cormorant Garamond',serif" }}>Upgrade to Pro</div>
            <div style={{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#444',textAlign:'center',marginBottom:18 }}>Get ahead. Stay ahead.</div>
            {['⚡ Real-time signals','🔒 All Pro signals','🗳 Full predictions access','📊 Weekly intelligence brief','🤖 Unlimited AI generation'].map(f=>(
              <div key={f} style={{ fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#888',padding:'8px 0',borderBottom:'1px solid #111' }}>{f}</div>
            ))}
            <button style={S.proBtn} onClick={()=>{setIsPro(true);setUpgrade(false)}}>ACTIVATE PRO — £9/MO</button>
            <div style={{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A',textAlign:'center',marginTop:10 }}>Cancel anytime · No hidden fees</div>
          </div>
        </div>}

        {emailMod&&<EmailModal existing={emailPref} onSave={handleEmailSave} onClose={()=>setEmailMod(false)}/>}
      </div>
    </div>
  )
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ onExit }) {
  const [signals,  setSigs]  = useState([])
  const [subs,     setSubs]  = useState([])
  const [tab,      setTab]   = useState('add')
  const [form,     setForm]  = useState({ tag:'TECH',urgency:'HOT',what:'',why:'',how:'',premium:false })
  const [status,   setSt]    = useState('')
  const [genning,  setGen]   = useState(false)

  useEffect(()=>{
    storageGet('oac-signals',true).then(s=>s?setSigs(s):setSigs(SEED_SIGNALS))
    storageGet('oac-subscribers',true).then(s=>s&&setSubs(s))
  },[])

  const saveSigs = async s => { setSigs(s); await storageSet('oac-signals',s,true) }
  const add = async () => {
    if (!form.what||!form.why||!form.how) { setSt('⚠ Fill all fields.'); return }
    const s = { ...form,id:'m_'+Date.now(),time:Date.now(),aiGenerated:false,votes:{bull:0,bear:0,watch:0} }
    await saveSigs([s,...signals])
    setForm({ tag:'TECH',urgency:'HOT',what:'',why:'',how:'',premium:false })
    setSt('✓ Published.')
    if (s.urgency==='HOT') {
      const hot = subs.filter(x=>x.hotAlerts)
      if (hot.length>0) {
        setSt(`✓ Published. Emailing ${hot.length} subscribers...`)
        for (const sub of hot) await sendEmail({ to:sub.email, subject:`🔥 OACIntel HOT Signal: ${s.tag}`, html:hotSignalEmail(s,sub.name||'') })
        setSt(`✓ Published & emailed ${hot.length} subscribers.`)
      }
    }
    setTimeout(()=>setSt(''),5000)
  }
  const aiGen = async () => {
    setGen(true); setSt('AI generating...')
    try {
      const sig = await aiGenerateSignal(form.tag, signals)
      await saveSigs([sig,...signals])
      setSt(`✓ AI ${form.tag} signal generated.`)
    } catch { setSt('⚠ Failed.') }
    setGen(false); setTimeout(()=>setSt(''),4000)
  }
  const sendBrief = async () => {
    const daily = subs.filter(s=>s.dailyBrief)
    if (!daily.length) { setSt('No daily brief subscribers yet.'); return }
    setSt(`Sending to ${daily.length} subscribers...`)
    for (const sub of daily) await sendEmail({ to:sub.email, subject:'☀️ OACIntel — Daily Intelligence Brief', html:dailyBriefEmail(signals,sub.name||'') })
    setSt(`✓ Sent to ${daily.length} subscribers.`)
    setTimeout(()=>setSt(''),5000)
  }

  return (
    <div style={{ minHeight:'100vh',background:'#050505',fontFamily:"'DM Sans',sans-serif" }}>
      <style>{globalCss}</style>
      <div style={{ maxWidth:680,margin:'0 auto',padding:22 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 0 20px',borderBottom:'1px solid #111',marginBottom:20 }}>
          <div style={{ display:'flex',alignItems:'center',gap:14 }}>
            <OACLogo size={0.8}/>
            <div>
              <div style={{ fontSize:14,fontWeight:800,color:GOLD.main,letterSpacing:'0.1em' }}>Admin Console</div>
              <div style={{ fontSize:9,color:'#2A2A2A',letterSpacing:'0.15em' }}>OACINTEL INTELLIGENCE PLATFORM</div>
            </div>
          </div>
          <button style={{ background:'none',border:'1px solid #1A1A1A',borderRadius:4,padding:'6px 14px',color:'#3A3A3A',fontSize:9,fontWeight:700,letterSpacing:'0.1em',cursor:'pointer' }} onClick={onExit}>← EXIT</button>
        </div>
        {/* Stats */}
        <div style={{ display:'flex',gap:8,marginBottom:20 }}>
          {[[signals.length,'Signals'],[subs.length,'Subscribers'],[subs.filter(s=>s.hotAlerts).length,'HOT alerts'],[subs.filter(s=>s.dailyBrief).length,'Daily brief']].map(([v,l])=>(
            <div key={l} style={{ flex:1,background:'#0A0A0A',border:'1px solid #111',borderRadius:8,padding:'12px 8px',textAlign:'center' }}>
              <div style={{ fontSize:20,color:GOLD.main,fontFamily:"'Cormorant Garamond',serif",fontWeight:600 }}>{v}</div>
              <div style={{ fontSize:8,color:'#2A2A2A',letterSpacing:'0.1em',marginTop:3 }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {/* Admin tabs */}
        <div style={{ display:'flex',gap:7,marginBottom:20 }}>
          {[{id:'add',l:'＋ ADD'},{id:'manage',l:`◈ MANAGE (${signals.length})`},{id:'email',l:`📬 EMAIL (${subs.length})`}].map(t=>(
            <button key={t.id} style={{ background:'transparent',border:`1px solid ${tab===t.id?'rgba(200,168,75,0.25)':'#141414'}`,borderRadius:6,padding:'8px 16px',color:tab===t.id?GOLD.main:'#2A2A2A',fontSize:9,fontWeight:700,letterSpacing:'0.1em',cursor:'pointer',background:tab===t.id?'rgba(200,168,75,0.05)':'transparent' }} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </div>

        {tab==='add'&&<div style={{ background:'#0A0A0A',border:'1px solid #111',borderRadius:12,padding:20 }}>
          <div style={{ display:'flex',gap:10,marginBottom:14 }}>
            {[{k:'tag',l:'SECTOR',opts:ALL_SECTORS},{k:'urgency',l:'URGENCY',opts:['HOT','RISING','WATCH']},{k:'tier',l:'TIER',opts:['FREE','PRO']}].map(({k,l,opts})=>(
              <div key={k} style={{ flex:1 }}>
                <label style={{ display:'block',fontSize:8,fontWeight:800,letterSpacing:'0.15em',color:'#3A3A3A',marginBottom:6 }}>{l}</label>
                <select style={{ width:'100%',background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:6,padding:'9px 11px',color:'#AAA',fontSize:12,fontFamily:"'DM Sans',sans-serif",cursor:'pointer' }}
                  value={k==='tier'?(form.premium?'PRO':'FREE'):form[k]}
                  onChange={e=>k==='tier'?setForm({...form,premium:e.target.value==='PRO'}):setForm({...form,[k]:e.target.value})}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          {[{k:'what',p:'The signal — specific and direct.'},{k:'why',p:'Why this matters — the consequence.'},{k:'how',p:'How to position — actionable.'}].map(({k,p})=>(
            <div key={k} style={{ marginBottom:12 }}>
              <label style={{ display:'block',fontSize:8,fontWeight:800,letterSpacing:'0.15em',color:'#3A3A3A',marginBottom:6 }}>{k.toUpperCase()}</label>
              <textarea style={{ width:'100%',background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:6,padding:'10px',color:'#AAA',fontSize:12,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5,resize:'vertical' }} placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} rows={3}/>
            </div>
          ))}
          {status&&<div style={{ color:GOLD.main,fontSize:12,textAlign:'center',marginBottom:10 }}>{status}</div>}
          <div style={{ display:'flex',gap:10 }}>
            <button style={{ flex:1,background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:6,padding:12,color:'#000',fontSize:10,fontWeight:800,letterSpacing:'0.15em',cursor:'pointer' }} onClick={add}>PUBLISH</button>
            <button style={{ flex:1,background:'transparent',border:`1px solid ${GOLD.dark}`,borderRadius:6,padding:12,color:GOLD.main,fontSize:10,fontWeight:800,letterSpacing:'0.15em',cursor:'pointer' }} disabled={genning} onClick={aiGen}>{genning?'GENERATING...':'⚡ AI GENERATE'}</button>
          </div>
        </div>}

        {tab==='manage'&&<div style={{ display:'flex',flexDirection:'column',gap:8 }}>
          {signals.map(s=>(
            <div key={s.id} style={{ background:'#0A0A0A',border:'1px solid #0F0F0F',borderRadius:10,padding:'12px 14px' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7 }}>
                <div style={{ display:'flex',gap:6,alignItems:'center' }}>
                  <span style={{ fontSize:9,fontWeight:800,letterSpacing:'0.15em',color:TAG_COLORS[s.tag]||GOLD.main }}>{s.tag}</span>
                  <span style={{ fontSize:9,color:URGENCY_CFG[s.urgency]?.color,background:URGENCY_CFG[s.urgency]?.bg,padding:'2px 6px',borderRadius:3 }}>{s.urgency}</span>
                  {s.premium&&<span style={{ fontSize:8,color:'#000',background:`linear-gradient(135deg,${GOLD.light},${GOLD.dark})`,padding:'2px 6px',borderRadius:3,fontWeight:800 }}>PRO</span>}
                  {s.aiGenerated&&<span style={{ fontSize:8,color:GOLD.main,border:`1px solid rgba(200,168,75,0.3)`,padding:'2px 6px',borderRadius:3 }}>AI</span>}
                </div>
                <div style={{ display:'flex',gap:8,alignItems:'center' }}>
                  <span style={{ fontSize:9,color:'#2A2A2A' }}>▲{s.votes?.bull||0} ▼{s.votes?.bear||0} ◎{s.votes?.watch||0}</span>
                  <button style={{ background:'none',border:'1px solid #1A1A1A',borderRadius:4,color:'#2A2A2A',fontSize:10,cursor:'pointer',padding:'3px 8px' }} onClick={async()=>{ await saveSigs(signals.filter(x=>x.id!==s.id)); setSt('✓ Deleted'); setTimeout(()=>setSt(''),2000) }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize:12,color:'#555',lineHeight:1.4 }}>{s.what}</div>
            </div>
          ))}
        </div>}

        {tab==='email'&&<div>
          <div style={{ background:'#0A0A0A',border:`1px solid rgba(200,168,75,0.15)`,borderRadius:10,padding:18,marginBottom:16 }}>
            <div style={{ fontSize:13,color:GOLD.main,fontFamily:"'Cormorant Garamond',serif",fontWeight:600,marginBottom:8 }}>Send Daily Brief Now</div>
            <div style={{ fontSize:11,color:'#444',marginBottom:14 }}>{subs.filter(s=>s.dailyBrief).length} daily brief subscribers.</div>
            {status&&<div style={{ color:GOLD.main,fontSize:11,marginBottom:10 }}>{status}</div>}
            <button style={{ width:'100%',background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:6,padding:12,color:'#000',fontSize:10,fontWeight:800,letterSpacing:'0.15em',cursor:'pointer' }} onClick={sendBrief}>☀️ SEND DAILY BRIEF TO ALL</button>
          </div>
          <div style={{ fontSize:9,fontWeight:800,letterSpacing:'0.15em',color:'#333',marginBottom:10 }}>SUBSCRIBERS ({subs.length})</div>
          {subs.length===0
            ? <div style={{ textAlign:'center',color:'#1E1E1E',fontSize:12,padding:30 }}>No subscribers yet.</div>
            : subs.map((sub,i)=>(
              <div key={i} style={{ background:'#0A0A0A',border:'1px solid #0F0F0F',borderRadius:8,padding:'12px 14px',marginBottom:8 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div style={{ fontSize:13,color:'#CCC' }}>{sub.email}</div>
                    {sub.name&&<div style={{ fontSize:10,color:'#333',marginTop:2 }}>{sub.name}</div>}
                  </div>
                  <div style={{ display:'flex',gap:6 }}>
                    {sub.hotAlerts&&<span style={{ fontSize:9,color:GOLD.main,border:`1px solid rgba(200,168,75,0.2)`,borderRadius:3,padding:'2px 6px' }}>🔥 HOT</span>}
                    {sub.dailyBrief&&<span style={{ fontSize:9,color:GOLD.main,border:`1px solid rgba(200,168,75,0.2)`,borderRadius:3,padding:'2px 6px' }}>☀️ DAILY</span>}
                  </div>
                </div>
              </div>
            ))
          }
        </div>}
      </div>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function OACIntel() {
  const [screen, setScreen] = useState('loading')
  const [user,   setUser]   = useState(null)

  useEffect(()=>{
    storageGet('oac-user').then(u => {
      if (u) { setUser(u); setScreen('app') }
      else setScreen('onboarding')
    })
  },[])

  const onboard = async u => {
    setUser(u); await storageSet('oac-user',u)
    if (u.email) {
      const subs = await storageGet('oac-subscribers',true)||[]
      if (!subs.find(s=>s.email===u.email)) await storageSet('oac-subscribers',[...subs,{ email:u.email,name:u.name,hotAlerts:u.hotAlerts,dailyBrief:u.dailyBrief }],true)
    }
    setScreen('app')
  }
  const reset = async () => { try{await window.storage.delete('oac-user',false)}catch{} setUser(null); setScreen('onboarding') }

  if (screen==='loading') return <div style={{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center' }}><style>{globalCss}</style><div className="spin-text" style={{ color:GOLD.main,fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.2em',fontSize:11 }}>LOADING INTELLIGENCE...</div></div>
  if (screen==='onboarding') return <><style>{globalCss}</style><Onboarding onComplete={onboard}/></>
  if (screen==='adminLogin') return (
    <div style={{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <style>{globalCss}</style>
      <div style={{ width:300,background:'#0A0A0A',border:`1px solid rgba(200,168,75,0.2)`,borderRadius:16,padding:28 }}>
        <div style={{ textAlign:'center',marginBottom:20 }}><OACLogo/></div>
        <AdminLogin onSuccess={()=>setScreen('admin')} onBack={()=>setScreen('app')}/>
      </div>
    </div>
  )
  if (screen==='admin') return <><style>{globalCss}</style><Admin onExit={()=>setScreen('app')}/></>
  return (
    <div>
      <style>{globalCss}</style>
      <MainApp user={user} onReset={reset}/>
      <div style={{ textAlign:'center',padding:'10px 0',background:'#030303' }}>
        <button style={{ background:'none',border:'none',color:'#181818',fontSize:9,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",letterSpacing:'0.12em' }} onClick={()=>setScreen('adminLogin')}>◈ ADMIN</button>
      </div>
    </div>
  )
}

function AdminLogin({ onSuccess, onBack }) {
  const [pw,setPw]=useState(''); const [err,setErr]=useState('')
  const check=()=>pw===ADMIN_PASSWORD?onSuccess():setErr('Incorrect.')
  return (
    <div>
      <div style={{ fontSize:9,fontWeight:800,letterSpacing:'0.2em',color:'#333',textAlign:'center',marginBottom:18 }}>ADMIN ACCESS</div>
      <input type="password" placeholder="Password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()} style={{ width:'100%',background:'#0F0F0F',border:'1px solid #1E1E1E',borderRadius:6,padding:'12px 14px',color:'#CCC',fontSize:13,fontFamily:"'DM Sans',sans-serif",marginBottom:10 }}/>
      {err&&<div style={{ color:GOLD.main,fontSize:11,textAlign:'center',marginBottom:10 }}>{err}</div>}
      <button style={{ width:'100%',background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:6,padding:13,color:'#000',fontSize:11,fontWeight:800,letterSpacing:'0.15em',cursor:'pointer',marginBottom:10 }} onClick={check}>ENTER</button>
      <button style={{ width:'100%',background:'none',border:'1px solid #1A1A1A',borderRadius:6,padding:10,color:'#333',fontSize:10,cursor:'pointer' }} onClick={onBack}>← Back</button>
    </div>
  )
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  root:{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cormorant Garamond',serif",position:'relative',padding:'20px 20px 0' },
  glow:{ position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 20%,rgba(200,168,75,0.04) 0%,transparent 55%)',pointerEvents:'none' },
  phone:{ width:'100%',background:'#080808',minHeight:'100vh',display:'flex',flexDirection:'column' },
  notch:{ width:120,height:26,background:'#050505',borderRadius:'0 0 16px 16px',margin:'0 auto' },
  statusBar:{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0 26px 5px' },
  header:{ padding:'5px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center' },
  intelTag:{ fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.2em',color:GOLD.main,borderLeft:'1px solid #1E1E1E',paddingLeft:9 },
  liveChip:{ display:'flex',alignItems:'center',gap:5,border:'1px solid #1A1A1A',borderRadius:4,padding:'4px 9px',background:'rgba(200,168,75,0.03)' },
  proChip:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',color:'#000',background:`linear-gradient(135deg,${GOLD.light},${GOLD.dark})`,padding:'3px 8px',borderRadius:3 },
  divider:{ height:1,background:`linear-gradient(90deg,transparent,rgba(200,168,75,0.2) 30%,rgba(200,168,75,0.2) 70%,transparent)`,margin:'0 20px' },
  notifBar:{ display:'flex',alignItems:'center',gap:9,background:'rgba(200,168,75,0.06)',borderBottom:'1px solid rgba(200,168,75,0.1)',padding:'10px 16px',fontSize:13 },
  notifBtn:{ background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:4,padding:'5px 10px',color:'#000',fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.08em',cursor:'pointer',whiteSpace:'nowrap' },
  tabs:{ display:'flex',padding:'8px 14px',gap:3,borderBottom:'1px solid #0C0C0C' },
  tab:{ flex:1,background:'transparent',border:'1px solid transparent',borderRadius:4,padding:'5px 2px',color:'#2E2E2E',fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.08em',cursor:'pointer',transition:'all 0.2s ease' },
  tabOn:{ color:GOLD.main,borderColor:'rgba(200,168,75,0.2)',background:'rgba(200,168,75,0.05)' },
  content:{ flex:1,overflowY:'auto',padding:'12px 12px 0' },
  brief:{ padding:'10px 13px',background:'rgba(200,168,75,0.04)',border:'1px solid rgba(200,168,75,0.08)',borderRadius:8,marginBottom:9 },
  briefDate:{ fontSize:7,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',color:GOLD.main,marginBottom:3 },
  briefText:{ fontSize:11,color:'#3A3A3A',fontFamily:"'DM Sans',sans-serif" },
  lockBanner:{ display:'flex',alignItems:'center',gap:9,background:'#0A0A0A',border:'1px solid #161616',borderRadius:8,padding:'10px 12px',marginBottom:9,fontSize:13 },
  lockBtn:{ background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:4,padding:'5px 11px',color:'#000',fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,cursor:'pointer',whiteSpace:'nowrap' },
  filterBtn:{ background:'transparent',border:'1px solid #141414',borderRadius:20,padding:'4px 11px',color:'#2E2E2E',fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.1em',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0 },
  filterOn:{ color:GOLD.main,borderColor:'rgba(200,168,75,0.3)',background:'rgba(200,168,75,0.06)' },
  genBtn:{ width:'100%',background:'transparent',border:'1px dashed rgba(200,168,75,0.22)',borderRadius:8,padding:'10px',color:GOLD.main,fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.07em',cursor:'pointer',marginBottom:9 },
  card:{ background:'#0A0A0A',border:'1px solid #141414',borderRadius:12,padding:'15px 15px 11px 19px',marginBottom:9,cursor:'pointer',position:'relative',overflow:'hidden',transition:'border-color 0.2s ease' },
  hotGlow:{ position:'absolute',inset:0,background:'radial-gradient(ellipse at top left,rgba(200,168,75,0.04) 0%,transparent 60%)',pointerEvents:'none' },
  cardAccent:{ position:'absolute',left:0,top:'18%',bottom:'18%',width:2,background:`linear-gradient(180deg,transparent,${GOLD.main},transparent)`,borderRadius:2 },
  cardTop:{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:9 },
  tag:{ fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em' },
  urg:{ fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.08em',padding:'2px 7px',borderRadius:3 },
  proBadge:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,color:'#000',background:`linear-gradient(135deg,${GOLD.light},${GOLD.dark})`,padding:'2px 6px',borderRadius:3 },
  aiBadge:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:GOLD.main,border:`1px solid rgba(200,168,75,0.3)`,padding:'2px 6px',borderRadius:3 },
  cardTime:{ fontSize:9,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A' },
  starBtn:{ background:'transparent',border:'none',fontSize:15,cursor:'pointer',padding:0,transition:'color 0.2s ease' },
  cardWhat:{ fontSize:14,color:'#D0D0D0',lineHeight:1.6,fontFamily:"'Cormorant Garamond',serif",fontWeight:400 },
  lockOverlay:{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' },
  lockText:{ fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:GOLD.main,background:'#0A0A0A',padding:'6px 14px',borderRadius:6,border:`1px solid rgba(200,168,75,0.2)`,cursor:'pointer' },
  expanded:{ marginTop:12 },
  expDiv:{ height:1,background:`linear-gradient(90deg,rgba(200,168,75,0.3),transparent)`,marginBottom:12 },
  layer:{ display:'flex',gap:10,marginBottom:10,alignItems:'flex-start' },
  layerN:{ fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,minWidth:18,marginTop:3 },
  layerT:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',color:'#3A3A3A',marginBottom:4 },
  layerB:{ fontSize:12,color:'#666',lineHeight:1.6,fontFamily:"'DM Sans',sans-serif" },
  cardFoot:{ marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center' },
  expandHint:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.12em',color:'#202020' },
  empty:{ textAlign:'center',padding:'70px 20px' },
  emptyT:{ color:'#2E2E2E',fontSize:15,fontWeight:600,marginBottom:8 },
  emptyS:{ color:'#1E1E1E',fontSize:11,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5 },
  profileWrap:{ display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 0' },
  profileRing:{ width:76,height:76,borderRadius:'50%',border:`1px solid rgba(200,168,75,0.2)`,background:'rgba(200,168,75,0.04)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12 },
  profileName:{ fontSize:19,color:GOLD.main,fontWeight:600,letterSpacing:'0.03em',marginBottom:5 },
  profileTier:{ fontSize:8,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.2em',color:'#2A2A2A',background:'#0F0F0F',border:'1px solid #141414',padding:'3px 12px',borderRadius:3,marginBottom:16 },
  statsRow:{ display:'flex',width:'100%',gap:1,marginBottom:13 },
  statBox:{ flex:1,background:'#0A0A0A',border:'1px solid #0F0F0F',borderRadius:8,padding:'11px 8px',textAlign:'center' },
  statV:{ fontSize:18,color:GOLD.main,fontWeight:600 },
  statL:{ fontSize:7,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.1em',color:'#232323',marginTop:3 },
  proCard:{ width:'100%',background:'#0A0A0A',border:`1px solid rgba(200,168,75,0.12)`,borderRadius:12,padding:16,marginBottom:14 },
  proBtn:{ marginTop:14,width:'100%',background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:6,padding:13,color:'#000',fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',cursor:'pointer' },
  overlay:{ position:'absolute',inset:0,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'flex-end',zIndex:100 },
  sheet:{ width:'100%',background:'#0C0C0C',border:`1px solid rgba(200,168,75,0.15)`,borderRadius:'18px 18px 0 0',padding:'24px 22px 34px',position:'relative' },
  sheetClose:{ position:'absolute',top:13,right:18,background:'none',border:'none',color:'#333',fontSize:16,cursor:'pointer' },
  sectionTitle:{ fontSize:20,color:'#E0E0E0',fontWeight:600,fontFamily:"'Cormorant Garamond',serif",marginBottom:4 },
  // Onboarding
  obRoot:{ minHeight:'100vh',background:'#050505',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:"'Cormorant Garamond',serif" },
  obBg:{ position:'fixed',inset:0,background:'radial-gradient(ellipse at 50% 40%,rgba(200,168,75,0.06) 0%,transparent 60%)',pointerEvents:'none' },
  obCard:{ width:380,maxWidth:'100%',background:'#0A0A0A',border:'1px solid rgba(200,168,75,0.15)',borderRadius:20,padding:30,boxShadow:'0 40px 100px rgba(0,0,0,0.8)' },
  obInner:{ display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center' },
  obTitle:{ fontSize:22,color:'#E8E8E8',fontWeight:600,letterSpacing:'0.02em',marginTop:16,marginBottom:10,lineHeight:1.3 },
  obSub:{ fontSize:13,color:'#444',lineHeight:1.6,marginBottom:18,fontFamily:"'DM Sans',sans-serif" },
  obFeat:{ fontSize:12,fontFamily:"'DM Sans',sans-serif",color:'#555',padding:'7px 0',borderBottom:'1px solid #111',textAlign:'left',width:'100%' },
  goldBtn:{ marginTop:16,width:'100%',background:`linear-gradient(135deg,${GOLD.main},${GOLD.dark})`,border:'none',borderRadius:8,padding:14,color:'#000',fontSize:11,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.15em',cursor:'pointer' },
  obSmall:{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A',marginTop:10 },
  skipBtn:{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#2A2A2A',background:'none',border:'none',cursor:'pointer',marginTop:8 },
  stepLbl:{ fontSize:9,fontFamily:"'DM Sans',sans-serif",fontWeight:800,letterSpacing:'0.2em',color:'#333',marginBottom:14 },
  obInput:{ width:'100%',background:'#0F0F0F',border:'1px solid #1E1E1E',borderRadius:8,padding:'13px 15px',color:'#CCC',fontSize:15,fontFamily:"'DM Sans',sans-serif",marginBottom:16,textAlign:'center' },
  toggleGroup:{ width:'100%',marginBottom:16 },
  toggleRow:{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #111',cursor:'pointer' },
  toggleLbl:{ fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#CCC',fontWeight:600,textAlign:'left' },
  toggleSub:{ fontSize:10,fontFamily:"'DM Sans',sans-serif",color:'#333',marginTop:3,textAlign:'left' },
  sectorGrid:{ display:'flex',flexWrap:'wrap',gap:7,justifyContent:'center',width:'100%' },
  sectorBtn:{ background:'#0F0F0F',border:'1px solid #1A1A1A',borderRadius:6,padding:'7px 13px',color:'#3A3A3A',fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700,letterSpacing:'0.1em',cursor:'pointer' },
  sectorOn:{ background:'rgba(200,168,75,0.1)',borderColor:'rgba(200,168,75,0.4)',color:GOLD.main },
}

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700;800&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  .gold-pulse { animation: gp 2s ease-in-out infinite; }
  @keyframes gp { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(200,168,75,0.5)} 50%{opacity:0.4;box-shadow:0 0 0 6px rgba(200,168,75,0)} }
  .oac-card:hover { border-color: rgba(200,168,75,0.2) !important; }
  .oac-expand { animation: ex 0.3s cubic-bezier(0.16,1,0.3,1); }
  @keyframes ex { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .spin-text { animation: fade 1.2s ease-in-out infinite alternate; }
  @keyframes fade { from{opacity:0.3} to{opacity:1} }
  ::-webkit-scrollbar { width:0; height:0; }
  select option { background:#0F0F0F; color:#AAA; }
`
