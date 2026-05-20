import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertTriangle, TrendingUp, DollarSign, ArrowLeft, BarChart2,
  Star, Archive, Zap, Calendar, Download, RefreshCw, Search,
  Sun, Moon, Activity, Target, Percent, Clock, AlertCircle, CheckCircle2,
  Bell, Brain, Flame, Award, TrendingDown, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, Filter, X, Menu
} from "lucide-react";
import Chart from "chart.js/auto";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";


Chart.register(TreemapController, TreemapElement, MatrixController, MatrixElement);

/* ─── Design Tokens ─── */
const ORANGE = {
  50:  "#fff7ed",
  100: "#ffedd5",
  200: "#fed7aa",
  300: "#fdba74",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
  800: "#9a3412",
  900: "#7c2d12",
};

const THEME = {
  light: {
    bg:        "#fafaf9",
    surface:   "#ffffff",
    surfaceAlt:"#fff7ed",
    border:    "#e7e5e4",
    borderSoft:"#f5f5f4",
    text:      "#1c1917",
    textSec:   "#78716c",
    textTer:   "#a8a29e",
    accent:    ORANGE[500],
    accentDark:ORANGE[700],
    accentBg:  ORANGE[50],
    success:   "#16a34a",
    successBg: "#f0fdf4",
    danger:    "#dc2626",
    dangerBg:  "#fef2f2",
    warning:   "#d97706",
    warningBg: "#fffbeb",
    info:      "#2563eb",
    infoBg:    "#eff6ff",
  },
  dark: {
    bg:        "#0c0a09",
    surface:   "#1c1917",
    surfaceAlt:"#292524",
    border:    "#292524",
    borderSoft:"#1c1917",
    text:      "#fafaf9",
    textSec:   "#a8a29e",
    textTer:   "#78716c",
    accent:    ORANGE[400],
    accentDark:ORANGE[300],
    accentBg:  "#1c1917",
    success:   "#4ade80",
    successBg: "#052e16",
    danger:    "#f87171",
    dangerBg:  "#450a0a",
    warning:   "#fbbf24",
    warningBg: "#451a03",
    info:      "#60a5fa",
    infoBg:    "#172554",
  },
};

/* ─── Helpers ─── */
const fmt = (n) => `₹${Math.abs(Number(n)||0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
  const num = Number(n)||0;
  if(num>=10000000) return `₹${(num/10000000).toFixed(1)}Cr`;
  if(num>=100000)   return `₹${(num/100000).toFixed(1)}L`;
  if(num>=1000)     return `₹${(num/1000).toFixed(1)}K`;
  return `₹${num}`;
};
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

/* ─── Theme ─── */
function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("tp-theme")==="dark" : false
  );
  const t = dark ? THEME.dark : THEME.light;
  useEffect(() => { localStorage.setItem("tp-theme", dark?"dark":"light"); }, [dark]);
  return [t, dark, () => setDark(d=>!d)];
}

/* ─── CSS vars injector ─── */
function ThemeInjector({ t }) {
  useEffect(() => {
    const r = document.documentElement;
    Object.entries(t).forEach(([k,v]) => r.style.setProperty(`--tp-${k}`, v));
  }, [t]);
  return null;
}

/* ─── Product Score ─── */
function calcScore(p) {
  const price  = Number(p.price)||0;
  const cost   = Number(p.cost)||0;
  const sold   = Number(p.soldCount)||0;
  const stock  = Number(p.stock)||0;
  const vel    = Number(p.avgDailySales)||0;
  const margin = price>0 ? (price-cost)/price*100 : 0;
  return Math.round(
    Math.min(margin/100*40,40) +
    Math.min(vel*10,30) +
    (stock>0 ? Math.min(sold/(sold+stock)*20,20) : 0) +
    Math.min(sold/10,10)
  );
}

/* ─── AI Insights ─── */
function useAIInsights(products) {
  return useMemo(() => {
    if(!products.length) return { alerts:[], insights:[], anomalies:[] };
    const alerts=[],insights=[],anomalies=[];

    const totalProfit = products.reduce((a,p)=>{
      return a+(Number(p.price)-Number(p.cost||0))*Number(p.soldCount||0);
    },0);
    const catRev = products.reduce((acc,p)=>{
      const cat=p.category||"Uncategorized";
      acc[cat]=(acc[cat]||0)+(Number(p.price)-Number(p.cost||0))*Number(p.soldCount||0);
      return acc;
    },{});
    const topCat=Object.entries(catRev).sort((a,b)=>b[1]-a[1])[0];
    if(topCat && totalProfit>0) {
      insights.push({ type:"opportunity", icon:TrendingUp, title:"Category Leader",
        text:`${topCat[0]} generates ${(topCat[1]/totalProfit*100).toFixed(0)}% of profit`,
        metric:fmtShort(topCat[1]) });
    }

    const lowStock=products.filter(p=>{
      const s=Number(p.stock)||0, d=Number(p.avgDailySales)||0;
      return s>0&&d>0&&s/d<7;
    });
    if(lowStock.length) alerts.push({ type:"danger", icon:AlertTriangle,
      title:"Stockout Risk", text:`${lowStock.length} items may stock out in 7 days` });

    const deadStock=products.filter(p=>{
      if(!p.dateAdded) return false;
      const daysOld=(new Date()-new Date(p.dateAdded))/(1000*60*60*24);
      return daysOld>90&&Number(p.soldCount||0)<3;
    });
    if(deadStock.length) {
      const val=deadStock.reduce((a,p)=>a+Number(p.price)*Number(p.stock||0),0);
      alerts.push({ type:"warning", icon:Archive,
        title:"Dead Inventory", text:`${fmtShort(val)} in ${deadStock.length} slow items` });
    }

    const gems=products
      .map(p=>({...p,margin:Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0}))
      .filter(p=>p.margin>60&&Number(p.soldCount||0)<10)
      .sort((a,b)=>b.margin-a.margin);
    if(gems.length) insights.push({ type:"success", icon:Star,
      title:"Hidden Gem", text:`${gems[0].name} has ${fmtPct(gems[0].margin)} margin`,
      metric:fmtPct(gems[0].margin) });

    const hot=products.filter(p=>Number(p.soldCount||0)>50);
    if(hot.length) {
      const avg=hot.reduce((a,p)=>a+Number(p.stock||0),0)/hot.length;
      if(avg<20) alerts.push({ type:"warning", icon:Flame,
        title:"Hot Sellers Low", text:`${hot.length} best-sellers avg ${Math.round(avg)} units` });
    }

    const roi=products.map(p=>{
      const cost=Number(p.cost||0)*Number(p.stock||0);
      const profit=(Number(p.price)-Number(p.cost||0))*Number(p.soldCount||0);
      return {...p,roi:cost>0?profit/cost*100:0};
    }).sort((a,b)=>b.roi-a.roi)[0];
    if(roi?.roi>100) insights.push({ type:"info", icon:Award,
      title:"ROI Champion", text:`${roi.name} delivering ${fmtPct(roi.roi)} ROI`,
      metric:fmtPct(roi.roi) });

    products.forEach(p=>{
      const sold=Number(p.soldCount)||0, avg=Number(p.avgDailySales)||0;
      if(avg>0&&sold>avg*10) anomalies.push({ icon:Zap, title:"Sales Spike",
        text:`${p.name}: ${sold} vs avg ${avg}/day` });
      const margin=Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0;
      if(margin<5&&sold>0) anomalies.push({ icon:TrendingDown, title:"Low Margin",
        text:`${p.name}: only ${fmtPct(margin)} margin` });
    });

    return { alerts:alerts.slice(0,4), insights:insights.slice(0,4), anomalies:anomalies.slice(0,3) };
  },[products]);
}

/* ─── Sparkline ─── */
function Sparkline({ data=[], color="#f97316", h=40 }) {
  const ref=useRef(null), chart=useRef(null);
  useEffect(()=>{
    if(!ref.current||!data.length) return;
    chart.current?.destroy();
    chart.current=new Chart(ref.current,{
      type:"line",
      data:{ labels:data.map((_,i)=>i), datasets:[{
        data, borderColor:color, borderWidth:2, fill:true,
        backgroundColor:color+"25", tension:0.4, pointRadius:0
      }]},
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{enabled:false}},
        scales:{x:{display:false},y:{display:false}}
      }
    });
    return()=>chart.current?.destroy();
  },[data,color]);
  return <canvas ref={ref} style={{height:h,width:"100%"}} />;
}

/* ─── Animated Number ─── */
function Count({ value }) {
  const [v,setV]=useState(0);
  useEffect(()=>{
    const n=typeof value==="number"?value:parseFloat(String(value).replace(/[^\d.]/g,""))||0;
    if(isNaN(n)){setV(value);return;}
    let cur=0;
    const step=n/50;
    const id=setInterval(()=>{
      cur+=step;
      if(cur>=n){setV(n);clearInterval(id);}
      else setV(Math.floor(cur));
    },16);
    return()=>clearInterval(id);
  },[value]);
  return <>{typeof v==="number"?v.toLocaleString():v}</>;
}

/* ─── KPI Card ─── */
function KpiCard({ label, value, icon:Icon, color, bg, trend, sparkline, sub }) {
  const up=Number(trend)>=0;
  return (
    <motion.div
      initial={{opacity:0,y:16}}
      animate={{opacity:1,y:0}}
      whileHover={{y:-3,transition:{duration:0.15}}}
      style={{
        background:"var(--tp-surface)", borderRadius:16,
        border:"1px solid var(--tp-border)", padding:"1.1rem 1.2rem",
        display:"flex", flexDirection:"column", gap:8, overflow:"hidden",
        position:"relative", cursor:"default"
      }}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{
          width:40,height:40,borderRadius:12,
          background:bg||"var(--tp-accentBg)",
          display:"flex",alignItems:"center",justifyContent:"center",
          color:color||"var(--tp-accent)"
        }}>
          <Icon size={20} />
        </div>
        <div style={{
          display:"flex",alignItems:"center",gap:3,fontSize:12,fontWeight:600,
          color:up?"var(--tp-success)":"var(--tp-danger)",
          background:up?"var(--tp-successBg)":"var(--tp-dangerBg)",
          padding:"2px 8px",borderRadius:20
        }}>
          {up?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}
          {fmtPct(Math.abs(Number(trend)||0))}
        </div>
      </div>
      <div>
        <div style={{fontSize:22,fontWeight:700,color:"var(--tp-text)",lineHeight:1.2}}>
          <Count value={value}/>
        </div>
        <div style={{fontSize:12,color:"var(--tp-textSec)",marginTop:2}}>{label}</div>
        {sub&&<div style={{fontSize:11,color:"var(--tp-textTer)",marginTop:1}}>{sub}</div>}
      </div>
      {sparkline&&<div style={{marginTop:4,height:36}}><Sparkline data={sparkline} color={color||"var(--tp-accent)"} h={36}/></div>}
    </motion.div>
  );
}

/* ─── Alert Badge ─── */
function AlertBadge({ alert }) {
  const colors={
    danger:  { bg:"var(--tp-dangerBg)",  color:"var(--tp-danger)",  border:"#fca5a5" },
    warning: { bg:"var(--tp-warningBg)", color:"var(--tp-warning)", border:"#fcd34d" },
    info:    { bg:"var(--tp-infoBg)",    color:"var(--tp-info)",    border:"#93c5fd" },
  };
  const c=colors[alert.type]||colors.info;
  return (
    <motion.div
      initial={{opacity:0,x:-12}}
      animate={{opacity:1,x:0}}
      style={{
        display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",
        background:c.bg,borderRadius:12,border:`1px solid ${c.border}`
      }}
    >
      <div style={{color:c.color,flexShrink:0,paddingTop:1}}><alert.icon size={16}/></div>
      <div>
        <div style={{fontSize:13,fontWeight:600,color:c.color}}>{alert.title}</div>
        <div style={{fontSize:12,color:"var(--tp-textSec)",marginTop:2}}>{alert.text}</div>
      </div>
    </motion.div>
  );
}

/* ─── Insight Card ─── */
function InsightCard({ ins }) {
  const acc={
    opportunity:{bg:"var(--tp-accentBg)",color:"var(--tp-accent)"},
    success:    {bg:"var(--tp-successBg)",color:"var(--tp-success)"},
    info:       {bg:"var(--tp-infoBg)",   color:"var(--tp-info)"},
    warning:    {bg:"var(--tp-warningBg)",color:"var(--tp-warning)"},
  };
  const c=acc[ins.type]||acc.info;
  return (
    <motion.div
      initial={{opacity:0,scale:0.95}}
      animate={{opacity:1,scale:1}}
      style={{
        background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
        borderRadius:14,padding:"12px 16px",display:"flex",
        alignItems:"flex-start",gap:12
      }}
    >
      <div style={{
        width:34,height:34,borderRadius:10,flexShrink:0,
        background:c.bg,color:c.color,
        display:"flex",alignItems:"center",justifyContent:"center"
      }}>
        <ins.icon size={16}/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)"}}>{ins.title}</div>
          {ins.metric&&<div style={{fontSize:12,fontWeight:700,color:c.color,flexShrink:0}}>{ins.metric}</div>}
        </div>
        <div style={{fontSize:12,color:"var(--tp-textSec)",marginTop:2}}>{ins.text}</div>
      </div>
    </motion.div>
  );
}

/* ─── Chart Section ─── */
function ChartSection({ products }) {
  const charts=useRef({});
  const [tab,setTab]=useState("treemap");

  useEffect(()=>{
    Object.values(charts.current).forEach(c=>c?.destroy());
    charts.current={};
    if(!products.length) return;
    const isDark=localStorage.getItem("tp-theme")==="dark";
    const tick=isDark?"#a8a29e":"#78716c";
    const grid=isDark?"#292524":"#f5f5f4";
    const orange=ORANGE[500];
    const green="#16a34a",blue="#2563eb";

    if(tab==="treemap") {
      const el=document.getElementById("tp-treemap");
      if(!el) return;
      const catData=products.reduce((acc,p)=>{
        const cat=p.category||"Other";
        const profit=(Number(p.price)-Number(p.cost||0))*Number(p.soldCount||0);
        const rev=Number(p.price)*Number(p.soldCount||0);
        if(!acc[cat]) acc[cat]={rev:0,profit:0};
        acc[cat].rev+=rev; acc[cat].profit+=profit;
        return acc;
      },{});
      charts.current.treemap=new Chart(el,{
        type:"treemap",
        data:{ datasets:[{
          tree:Object.entries(catData).map(([cat,d])=>({cat,value:d.rev||1,profit:d.profit})),
          key:"value", groups:["cat"],
          backgroundColor:(ctx)=>{
            if(!ctx.raw) return orange;
            const m=ctx.raw._data.value>0?ctx.raw._data.profit/ctx.raw._data.value*100:0;
            return m>40?green:m>20?orange:"#dc2626";
          },
          borderWidth:2,borderColor:isDark?"#0c0a09":"#fff",
          labels:{ display:true, formatter:(ctx)=>ctx.raw._data.cat,
            color:"#fff",font:{weight:"bold",size:11} }
        }]},
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{ legend:{display:false},
            tooltip:{ callbacks:{ label:(ctx)=>{
              const d=ctx.raw._data;
              return[d.cat,`Rev: ${fmtShort(d.value)}`,`Profit: ${fmtShort(d.profit)}`];
            }}}
          }
        }
      });
    }

    if(tab==="bubble") {
      const el=document.getElementById("tp-bubble");
      if(!el) return;
      charts.current.bubble=new Chart(el,{
        type:"bubble",
        data:{ datasets:[{
          label:"Products",
          data:products.map(p=>({
            x:Number(p.avgDailySales)||0,
            y:Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0,
            r:Math.max(5,Math.sqrt(Number(p.soldCount||0))),
            label:p.name
          })),
          backgroundColor:products.map(p=>{
            const vel=Number(p.avgDailySales)||0;
            const m=Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0;
            return(vel>5&&m>40?green:vel>5?blue:m>40?orange:"#dc2626")+"bb";
          }),
          borderWidth:0
        }]},
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{ callbacks:{ label:(ctx)=>[ctx.raw.label,`Velocity: ${ctx.raw.x.toFixed(1)}/day`,`Margin: ${ctx.raw.y.toFixed(1)}%`]}}
          },
          scales:{
            x:{ title:{display:true,text:"Sales Velocity",color:tick},grid:{color:grid},ticks:{color:tick}},
            y:{ title:{display:true,text:"Margin %",color:tick},grid:{color:grid},ticks:{color:tick}}
          }
        }
      });
    }

    if(tab==="waterfall") {
      const el=document.getElementById("tp-waterfall");
      if(!el) return;
      const rev=products.reduce((a,p)=>a+Number(p.price)*Number(p.soldCount||0),0);
      const cost=products.reduce((a,p)=>a+Number(p.cost||0)*Number(p.soldCount||0),0);
      const ship=rev*0.05,disc=rev*0.03,ret=rev*0.02;
      const net=rev-cost-ship-disc-ret;
      charts.current.waterfall=new Chart(el,{
        type:"bar",
        data:{
          labels:["Revenue","COGS","Shipping","Discounts","Returns","Net Profit"],
          datasets:[{
            data:[rev,-cost,-ship,-disc,-ret,net],
            backgroundColor:[green,"#ef4444","#ef4444","#ef4444","#ef4444",blue],
            borderRadius:8
          }]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{legend:{display:false},tooltip:{callbacks:{label:(ctx)=>fmt(ctx.raw)}}},
          scales:{
            x:{grid:{display:false},ticks:{color:tick}},
            y:{grid:{color:grid},ticks:{color:tick,callback:v=>fmtShort(v)}}
          }
        }
      });
    }
    return()=>Object.values(charts.current).forEach(c=>c?.destroy());
  },[products,tab]);

  const tabs=[
    { id:"treemap", label:"Revenue Map", icon:BarChart2 },
    { id:"bubble",  label:"Product Matrix", icon:Activity },
    { id:"waterfall",label:"P&L Breakdown", icon:TrendingUp },
  ];

  return (
    <div style={{background:"var(--tp-surface)",border:"1px solid var(--tp-border)",borderRadius:16,overflow:"hidden"}}>
      <div style={{display:"flex",gap:0,borderBottom:"1px solid var(--tp-border)",overflowX:"auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"12px 18px",
            background:"none",border:"none",borderBottom:`2px solid ${tab===t.id?"var(--tp-accent)":"transparent"}`,
            color:tab===t.id?"var(--tp-accent)":"var(--tp-textSec)",
            fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",
            whiteSpace:"nowrap",transition:"all 0.15s"
          }}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>
      <div style={{padding:"1rem",height:320}}>
        {tab==="treemap"  &&<canvas id="tp-treemap"   style={{width:"100%",height:"100%"}}/>}
        {tab==="bubble"   &&<canvas id="tp-bubble"    style={{width:"100%",height:"100%"}}/>}
        {tab==="waterfall"&&<canvas id="tp-waterfall" style={{width:"100%",height:"100%"}}/>}
      </div>
    </div>
  );
}

/* ─── Product Row ─── */
function ProductRow({ p, expanded, onToggle }) {
  const price=Number(p.price)||0,cost=Number(p.cost)||0,sold=Number(p.soldCount)||0;
  const stock=Number(p.stock)||0;
  const margin=price>0?(price-cost)/price*100:0;
  const score=calcScore(p);
  const revenue=price*sold,profit=(price-cost)*sold;
  const stockStatus=stock===0?"danger":stock<10?"warning":"success";
  const statusColor={danger:"var(--tp-danger)",warning:"var(--tp-warning)",success:"var(--tp-success)"};

  return (
    <motion.div
      layout
      style={{borderBottom:"1px solid var(--tp-borderSoft)"}}
    >
      <div
        onClick={onToggle}
        style={{
          display:"grid",
          gridTemplateColumns:"1fr 60px 70px 80px 80px 70px",
          gap:12,padding:"12px 16px",cursor:"pointer",
          background:expanded?"var(--tp-accentBg)":"transparent",
          transition:"background 0.15s",
          alignItems:"center"
        }}
      >
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          <div style={{
            width:36,height:36,borderRadius:10,flexShrink:0,
            background:"var(--tp-accentBg)",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:"var(--tp-accent)",fontSize:14,fontWeight:700
          }}>
            {(p.name||"?")[0].toUpperCase()}
          </div>
          <div style={{minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)",
              overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
            <div style={{fontSize:11,color:"var(--tp-textTer)"}}>{p.category||"Uncategorized"}</div>
          </div>
        </div>
        <div style={{
          width:34,height:22,borderRadius:20,
          background:score>75?"var(--tp-successBg)":score>50?"var(--tp-warningBg)":"var(--tp-dangerBg)",
          color:score>75?"var(--tp-success)":score>50?"var(--tp-warning)":"var(--tp-danger)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:11,fontWeight:700
        }}>{score}</div>
        <div style={{fontSize:12,color:"var(--tp-text)",textAlign:"right"}}>{fmt(price)}</div>
        <div style={{fontSize:12,fontWeight:600,color:margin>40?"var(--tp-success)":"var(--tp-warning)",textAlign:"right"}}>
          {fmtPct(margin)}</div>
        <div style={{fontSize:12,color:"var(--tp-text)",textAlign:"right"}}>{fmtShort(revenue)}</div>
        <div style={{
          padding:"3px 8px",borderRadius:20,fontSize:11,fontWeight:600,textAlign:"center",
          color:statusColor[stockStatus],
          background:stockStatus==="danger"?"var(--tp-dangerBg)":stockStatus==="warning"?"var(--tp-warningBg)":"var(--tp-successBg)"
        }}>{stock}</div>
      </div>
      <AnimatePresence>
        {expanded&&(
          <motion.div
            initial={{height:0,opacity:0}}
            animate={{height:"auto",opacity:1}}
            exit={{height:0,opacity:0}}
            style={{overflow:"hidden"}}
          >
            <div style={{
              padding:"12px 16px 16px",background:"var(--tp-surfaceAlt)",
              display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10
            }}>
              {[
                {label:"Total Sold",value:sold},
                {label:"Gross Profit",value:fmtShort(profit)},
                {label:"Stock Value",value:fmtShort(price*stock)},
                {label:"Avg Daily",value:`${Number(p.avgDailySales||0).toFixed(1)}/day`},
                {label:"SKU",value:p.sku||"N/A"},
                {label:"Rec",value:stock<10?"Reorder":margin>50?"Boost Ads":"Monitor"},
              ].map(item=>(
                <div key={item.label} style={{
                  background:"var(--tp-surface)",borderRadius:10,padding:"8px 12px",
                  border:"1px solid var(--tp-border)"
                }}>
                  <div style={{fontSize:11,color:"var(--tp-textSec)"}}>{item.label}</div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)",marginTop:2}}>{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Product Table ─── */
function ProductTable({ products, search }) {
  const [sort,setSort]=useState({key:"score",dir:"desc"});
  const [expanded,setExpanded]=useState(null);
  const [page,setPage]=useState(0);
  const PER=20;

  const sorted=useMemo(()=>{
    return products
      .filter(p=>(p.name||"").toLowerCase().includes(search.toLowerCase()))
      .map(p=>({...p,score:calcScore(p),
        revenue:(Number(p.price)||0)*(Number(p.soldCount)||0),
        margin:(Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0)
      }))
      .sort((a,b)=>(sort.dir==="asc"?1:-1)*(a[sort.key]>b[sort.key]?1:-1));
  },[products,search,sort]);

  const paged=sorted.slice(page*PER,(page+1)*PER);
  const pages=Math.ceil(sorted.length/PER);

  const headers=[
    {key:"name",label:"Product"},
    {key:"score",label:"Score"},
    {key:"price",label:"Price"},
    {key:"margin",label:"Margin"},
    {key:"revenue",label:"Revenue"},
    {key:"stock",label:"Stock"},
  ];

  return (
    <div style={{background:"var(--tp-surface)",border:"1px solid var(--tp-border)",borderRadius:16,overflow:"hidden"}}>
      <div style={{padding:"14px 16px",borderBottom:"1px solid var(--tp-border)",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:14,fontWeight:600,color:"var(--tp-text)"}}>
          Product Performance
        </div>
        <div style={{fontSize:12,color:"var(--tp-textSec)"}}>{sorted.length} items</div>
      </div>
      <div style={{
        display:"grid",
        gridTemplateColumns:"1fr 60px 70px 80px 80px 70px",
        gap:12,padding:"8px 16px",
        borderBottom:"1px solid var(--tp-border)",
        background:"var(--tp-bg)"
      }}>
        {headers.map(h=>(
          <button key={h.key} onClick={()=>setSort(s=>({key:h.key,dir:s.key===h.key&&s.dir==="desc"?"asc":"desc"}))}
            style={{
              background:"none",border:"none",padding:0,cursor:"pointer",
              fontSize:11,fontWeight:600,color:"var(--tp-textSec)",
              textAlign:h.key==="name"?"left":"right",
              display:"flex",alignItems:"center",justifyContent:h.key==="name"?"flex-start":"flex-end",gap:3
            }}>
            {h.label}
            {sort.key===h.key&&(sort.dir==="desc"?<ChevronDown size={10}/>:<ChevronDown size={10} style={{transform:"rotate(180deg)"}}/>)}
          </button>
        ))}
      </div>

      {paged.length===0?(
        <div style={{textAlign:"center",padding:"3rem",color:"var(--tp-textSec)"}}>
          <Package size={40} style={{margin:"0 auto 12px",opacity:0.3}}/>
          <div>No products found</div>
        </div>
      ):(
        paged.map(p=>(
          <ProductRow key={p.id||p.name} p={p}
            expanded={expanded===p.id}
            onToggle={()=>setExpanded(expanded===p.id?null:p.id)}
          />
        ))
      )}

      {pages>1&&(
        <div style={{padding:"12px 16px",borderTop:"1px solid var(--tp-border)",
          display:"flex",justifyContent:"center",gap:8}}>
          {Array.from({length:pages},(_,i)=>(
            <button key={i} onClick={()=>setPage(i)} style={{
              width:28,height:28,borderRadius:8,border:"1px solid var(--tp-border)",
              background:page===i?"var(--tp-accent)":"none",
              color:page===i?"#fff":"var(--tp-textSec)",
              fontSize:12,cursor:"pointer"
            }}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main ─── */
export default function TotalProductsPage({ products=[], onBack }) {
  const [t,dark,toggleTheme]=useTheme();
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");
  const [dateRange,setDateRange]=useState("all");
  const [sidebarOpen,setSidebarOpen]=useState(false);

  const cats=useMemo(()=>{
    const s=new Set(products.map(p=>p.category||"Uncategorized"));
    return["all",...Array.from(s).sort()];
  },[products]);

  const filtered=useMemo(()=>{
    const now=new Date(), past=new Date();
    if(dateRange==="7d")  past.setDate(now.getDate()-7);
    else if(dateRange==="30d") past.setDate(now.getDate()-30);
    else if(dateRange==="90d") past.setDate(now.getDate()-90);
    return products.filter(p=>{
      const matchCat=category==="all"||(p.category||"Uncategorized")===category;
      const matchDate=dateRange==="all"||!p.dateAdded||new Date(p.dateAdded)>=past;
      return matchCat&&matchDate;
    });
  },[products,category,dateRange]);

  const { alerts,insights,anomalies }=useAIInsights(filtered);

  const kpis=useMemo(()=>{
    const p=filtered;
    const total=p.length;
    const totalStock=p.reduce((a,x)=>a+Number(x.stock||0),0);
    const totalSold=p.reduce((a,x)=>a+Number(x.soldCount||0),0);
    const totalRev=p.reduce((a,x)=>a+Number(x.price)*(Number(x.soldCount||0)),0);
    const totalProfit=p.reduce((a,x)=>a+(Number(x.price)-Number(x.cost||0))*(Number(x.soldCount||0)),0);
    const totalValue=p.reduce((a,x)=>a+Number(x.price)*Number(x.stock||0),0);
    const avgMargin=totalRev>0?totalProfit/totalRev*100:0;
    const inStock=p.filter(x=>Number(x.stock)>5).length;
    const lowStock=p.filter(x=>{const s=Number(x.stock);return s>0&&s<=5;}).length;
    const outStock=p.filter(x=>Number(x.stock)===0).length;
    const fast=p.filter(x=>Number(x.soldCount||0)>10).length;
    const dead=p.filter(x=>{
      if(!x.dateAdded) return false;
      const d=(new Date()-new Date(x.dateAdded))/(1000*60*60*24);
      return d>90&&Number(x.soldCount||0)<3;
    }).length;
    const restock=p.filter(x=>{
      const s=Number(x.stock)||0,d=Number(x.avgDailySales)||0;
      return d>0&&s/d<14;
    }).length;
    const roi=totalValue>0?totalProfit/totalValue*100:0;
    const sell=totalStock+totalSold>0?totalSold/(totalStock+totalSold)*100:0;
    return{total,totalStock,totalSold,totalRev,totalProfit,totalValue,
      avgMargin,inStock,lowStock,outStock,fast,dead,restock,roi,sell};
  },[filtered]);

  const handleExport=()=>{
    const rows=filtered.map(p=>[
      p.name,p.category||"",p.price,p.cost||0,p.stock,p.soldCount||0,calcScore(p)
    ]);
    const csv=[["Name","Category","Price","Cost","Stock","Sold","Score"],...rows]
      .map(r=>r.join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`products_${dateRange}.csv`;
    a.click();
  };

  const kpiCards=[
    {label:"Total Products",value:kpis.total,icon:Package,color:ORANGE[500],bg:ORANGE[50],trend:12.5,sparkline:[10,15,12,18,22,25,28]},
    {label:"Total Stock",value:kpis.totalStock,icon:Archive,color:"#2563eb",bg:"#eff6ff",trend:-3.2,sparkline:[100,95,98,92,88,85,82]},
    {label:"Inventory Value",value:fmtShort(kpis.totalValue),icon:DollarSign,color:"#7c3aed",bg:"#f5f3ff",trend:8.7,sparkline:[50,55,53,60,65,70,75]},
    {label:"Total Profit",value:fmtShort(kpis.totalProfit),icon:TrendingUp,color:"#16a34a",bg:"#f0fdf4",trend:15.3,sparkline:[20,25,30,35,42,48,55]},
    {label:"Avg Margin",value:fmtPct(kpis.avgMargin),icon:Percent,color:"#db2777",bg:"#fdf2f8",trend:2.1,sparkline:[30,32,31,33,34,35,36]},
    {label:"Fast Moving",value:kpis.fast,icon:Zap,color:"#16a34a",bg:"#f0fdf4",trend:18.9,sparkline:[5,7,6,9,11,13,15]},
    {label:"Out of Stock",value:kpis.outStock,icon:AlertTriangle,color:"#dc2626",bg:"#fef2f2",trend:-12.1,sparkline:[12,10,8,6,4,3,2]},
    {label:"Needs Restock",value:kpis.restock,icon:Bell,color:ORANGE[600],bg:ORANGE[50],trend:22.5,sparkline:[3,4,5,7,8,10,12]},
    {label:"ROI %",value:fmtPct(kpis.roi),icon:Target,color:"#0891b2",bg:"#ecfeff",trend:9.8,sparkline:[15,17,16,19,21,23,25]},
    {label:"Sell-Through",value:fmtPct(kpis.sell),icon:Activity,color:"#7c3aed",bg:"#f5f3ff",trend:4.2,sparkline:[60,62,61,63,65,67,68]},
    {label:"Dead Stock",value:kpis.dead,icon:Archive,color:"#dc2626",bg:"#fef2f2",trend:-5.4,sparkline:[8,7,6,5,4,3,2]},
    {label:"In Stock",value:kpis.inStock,icon:CheckCircle2,color:"#16a34a",bg:"#f0fdf4",trend:3.4,sparkline:[80,82,81,83,85,87,89]},
  ];

  return (
    <div style={{
      minHeight:"100vh",background:"var(--tp-bg)",color:"var(--tp-text)",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    }}>
      <ThemeInjector t={t}/>

      {/* ─ Header ─ */}
      <div style={{
        position:"sticky",top:0,zIndex:50,
        background:dark?"rgba(12,10,9,0.95)":"rgba(250,250,249,0.95)",
        backdropFilter:"blur(12px)",
        borderBottom:"1px solid var(--tp-border)",
        padding:"0 1rem"
      }}>
        <div style={{
          maxWidth:1400,margin:"0 auto",
          display:"flex",alignItems:"center",gap:12,height:60
        }}>
          {onBack&&(
            <button onClick={onBack} style={{
              display:"flex",alignItems:"center",gap:6,
              background:"none",border:"1px solid var(--tp-border)",
              borderRadius:10,padding:"6px 12px",cursor:"pointer",
              color:"var(--tp-textSec)",fontSize:13
            }}>
              <ArrowLeft size={14}/>Back
            </button>
          )}

          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{
              width:32,height:32,borderRadius:10,
              background:`linear-gradient(135deg,${ORANGE[500]},${ORANGE[700]})`,
              display:"flex",alignItems:"center",justifyContent:"center"
            }}>
              <BarChart2 size={16} color="#fff"/>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"var(--tp-text)"}}>Total Products </div>
              <div style={{fontSize:11,color:"var(--tp-textSec)"}}>AI-powered inventory intelligence</div>
            </div>
          </div>

          <div style={{flex:1}}/>

          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={toggleTheme} style={{
              width:34,height:34,borderRadius:10,
              border:"1px solid var(--tp-border)",background:"none",
              cursor:"pointer",color:"var(--tp-textSec)",
              display:"flex",alignItems:"center",justifyContent:"center"
            }}>
              {dark?<Sun size={16}/>:<Moon size={16}/>}
            </button>
            <button onClick={handleExport} style={{
              display:"flex",alignItems:"center",gap:6,
              border:"1px solid var(--tp-border)",background:"none",
              borderRadius:10,padding:"6px 12px",cursor:"pointer",
              color:"var(--tp-textSec)",fontSize:12
            }}>
              <Download size={14}/>Export
            </button>
            <button onClick={()=>window.print()} style={{
              display:"flex",alignItems:"center",gap:6,
              background:`linear-gradient(135deg,${ORANGE[500]},${ORANGE[600]})`,
              border:"none",borderRadius:10,padding:"6px 14px",
              cursor:"pointer",color:"#fff",fontSize:12,fontWeight:600
            }}>
              <Download size={14}/>PDF
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1400,margin:"0 auto",padding:"1.5rem 1rem"}}>

        {/* ─ Filters ─ */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"1fr auto auto",
          gap:10,marginBottom:"1.5rem",
          "@media (max-width: 600px)":{gridTemplateColumns:"1fr"}
        }}>
          <div style={{
            display:"flex",alignItems:"center",gap:8,
            background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
            borderRadius:12,padding:"0 12px",height:40
          }}>
            <Search size={15} style={{color:"var(--tp-textTer)"}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search products..." style={{
                flex:1,border:"none",background:"none",outline:"none",
                fontSize:13,color:"var(--tp-text)"
              }}/>
            {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"var(--tp-textTer)"}}>
              <X size={14}/>
            </button>}
          </div>

          <select value={category} onChange={e=>setCategory(e.target.value)} style={{
            height:40,background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
            borderRadius:12,padding:"0 12px",fontSize:13,color:"var(--tp-text)",
            outline:"none",cursor:"pointer",minWidth:140
          }}>
            {cats.map(c=><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
          </select>

          <select value={dateRange} onChange={e=>setDateRange(e.target.value)} style={{
            height:40,background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
            borderRadius:12,padding:"0 12px",fontSize:13,color:"var(--tp-text)",
            outline:"none",cursor:"pointer",minWidth:130
          }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* ─ KPI Grid ─ */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
          gap:12,marginBottom:"1.5rem"
        }}>
          {kpiCards.map((k,i)=><KpiCard key={k.label} {...k} />)}
        </div>

        {/* ─ AI Panel ─ */}
        {(alerts.length>0||insights.length>0)&&(
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
            gap:12,marginBottom:"1.5rem"
          }}>
            {alerts.length>0&&(
              <div style={{
                background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
                borderRadius:16,padding:"1rem"
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{
                    width:28,height:28,borderRadius:8,
                    background:"var(--tp-accentBg)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"var(--tp-accent)"
                  }}><AlertTriangle size={14}/></div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)"}}>Alerts</div>
                  <div style={{
                    marginLeft:"auto",background:"var(--tp-dangerBg)",color:"var(--tp-danger)",
                    borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700
                  }}>{alerts.length}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {alerts.map((a,i)=><AlertBadge key={i} alert={a}/>)}
                </div>
              </div>
            )}

            {insights.length>0&&(
              <div style={{
                background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
                borderRadius:16,padding:"1rem"
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{
                    width:28,height:28,borderRadius:8,
                    background:"var(--tp-accentBg)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"var(--tp-accent)"
                  }}><Brain size={14}/></div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)"}}>AI Insights</div>
                  <div style={{
                    marginLeft:"auto",fontSize:11,color:"var(--tp-textSec)",
                    display:"flex",alignItems:"center",gap:4
                  }}>
                    <div style={{width:6,height:6,borderRadius:"50%",background:"var(--tp-success)",animation:"pulse 2s infinite"}}/>
                    Live
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {insights.map((ins,i)=><InsightCard key={i} ins={ins}/>)}
                </div>
              </div>
            )}

            {anomalies.length>0&&(
              <div style={{
                background:"var(--tp-surface)",border:"1px solid var(--tp-border)",
                borderRadius:16,padding:"1rem"
              }}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                  <div style={{
                    width:28,height:28,borderRadius:8,
                    background:"var(--tp-warningBg)",
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"var(--tp-warning)"
                  }}><Zap size={14}/></div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--tp-text)"}}>Anomalies</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {anomalies.map((a,i)=>(
                    <div key={i} style={{
                      display:"flex",gap:10,padding:"10px 12px",
                      background:"var(--tp-warningBg)",borderRadius:12,
                      border:"1px solid #fcd34d"
                    }}>
                      <a.icon size={14} style={{color:"var(--tp-warning)",flexShrink:0,paddingTop:1}}/>
                      <div>
                        <div style={{fontSize:12,fontWeight:600,color:"var(--tp-warning)"}}>{a.title}</div>
                        <div style={{fontSize:11,color:"var(--tp-textSec)",marginTop:1}}>{a.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Charts ─ */}
        <div style={{marginBottom:"1.5rem"}}>
          <ChartSection products={filtered}/>
        </div>

        {/* ─ Table ─ */}
        <ProductTable products={filtered} search={search}/>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box}
        select option{background:var(--tp-surface);color:var(--tp-text)}
        @media(max-width:640px){
          .tp-filters{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}