import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, AlertTriangle, TrendingUp, DollarSign, ArrowLeft, BarChart3,
  Star, Archive, Zap, Calendar, Download, RefreshCw, Search,
  Sun, Moon, Activity, Target, Percent, Clock, AlertCircle, CheckCircle2,
  Bell, Brain, Flame, Award, TrendingDown, ChevronRight, ChevronDown,
  ArrowUpRight, ArrowDownRight, Filter, X
} from "lucide-react";
import Chart from "chart.js/auto";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";
import "../../styles/TotalProductsPage.css";

Chart.register(TreemapController, TreemapElement, MatrixController, MatrixElement);

/* ─── Design Tokens ─── */
const ORANGE = {
  50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c",
  500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12",
};

const THEME = {
  light: {
    bg: "#fafaf9", surface: "#ffffff", surfaceAlt:"#fff7ed", border: "#e7e5e4", borderSoft:"#f5f4",
    text: "#1c1917", textSec: "#78716c", textTer: "#a8a29e",
    accent: ORANGE[500], accentDark:ORANGE[700], accentBg: ORANGE[50],
    success: "#16a34a", successBg: "#f0fdf4", danger: "#dc2626", dangerBg: "#fef2f2",
    warning: "#d97706", warningBg: "#fffbeb", info: "#2563eb", infoBg: "#eff6ff",
  },
  dark: {
    bg: "#0c0a09", surface: "#1c1917", surfaceAlt:"#292524", border: "#292524", borderSoft:"#1c1917",
    text: "#fafaf9", textSec: "#a8a29e", textTer: "#78716c",
    accent: ORANGE[400], accentDark:ORANGE[300], accentBg: "#1c1917",
    success: "#4ade80", successBg: "#052e16", danger: "#f87171", dangerBg: "#450a0a",
    warning: "#fbbf24", warningBg: "#451a03", info: "#60a5fa", infoBg: "#172554",
  },
};

/* ─── Helpers ─── */
const fmt = (n) => `₹${Math.abs(Number(n)||0).toLocaleString("en-IN")}`;
const fmtShort = (n) => {
  const num = Number(n)||0;
  if(num>=10000000) return `₹${(num/10000000).toFixed(1)}Cr`;
  if(num>=100000) return `₹${(num/100000).toFixed(1)}L`;
  if(num>=1000) return `₹${(num/1000).toFixed(1)}K`;
  return `₹${num}`;
};
const fmtPct = (n) => `${Number(n).toFixed(1)}%`;

/* ─── Theme ─── */
function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof window!== "undefined"? localStorage.getItem("tp-theme")==="dark" : false
  );
  const t = dark? THEME.dark : THEME.light;
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
  const price = Number(p.price)||0;
  const cost = Number(p.cost)||0;
  const sold = Number(p.soldCount)||0;
  const stock = Number(p.stock)||0;
  const vel = Number(p.avgDailySales)||0;
  const margin = price>0? (price-cost)/price*100 : 0;
  return Math.round(
    Math.min(margin/100*40,40) +
    Math.min(vel*10,30) +
    (stock>0? Math.min(sold/(sold+stock)*20,20) : 0) +
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
      const daysOld=(new Date()-new Date(p.dateAdded))/(1000*60*24);
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
      className="total-products-kpi-card"
    >
      <div className="total-products-kpi-top">
        <div className="total-products-kpi-icon" style={{background:bg,color}}>
          <Icon size={20} />
        </div>
        <div className={`total-products-kpi-trend ${up?'up':'down'}`}>
          {up?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}
          {fmtPct(Math.abs(Number(trend)||0))}
        </div>
      </div>
      <div>
        <div className="total-products-kpi-value"><Count value={value}/></div>
        <div className="total-products-kpi-label">{label}</div>
        {sub&&<div className="total-products-kpi-sub">{sub}</div>}
      </div>
      {sparkline&&<div className="total-products-kpi-spark"><Sparkline data={sparkline} color={bg} h={36}/></div>}
    </motion.div>
  );
}

/* ─── Alert Badge ─── */
function AlertBadge({ alert }) {
  return (
    <motion.div
      initial={{opacity:0,x:-12}}
      animate={{opacity:1,x:0}}
      className={`total-products-alert ${alert.type}`}
    >
      <div className="total-products-alert-icon"><alert.icon size={16}/></div>
      <div>
        <div className="total-products-alert-title">{alert.title}</div>
        <div className="total-products-alert-text">{alert.text}</div>
      </div>
    </motion.div>
  );
}

/* ─── Insight Card ─── */
function InsightCard({ ins }) {
  return (
    <motion.div
      initial={{opacity:0,scale:0.95}}
      animate={{opacity:1,scale:1}}
      className={`total-products-insight ${ins.type}`}
    >
      <div className="total-products-insight-icon"><ins.icon size={16}/></div>
      <div className="total-products-insight-content">
        <div className="total-products-insight-title">{ins.title}</div>
        <div className="total-products-insight-text">{ins.text}</div>
        {ins.metric&&<div className="total-products-insight-metric">{ins.metric}</div>}
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
            if(!ctx.raw) return ORANGE[500];
            const m=ctx.raw._data.value>0?ctx.raw._data.profit/ctx.raw._data.value*100:0;
            return m>40?"#16a34a":m>20?ORANGE[500]:"#dc2626";
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

      // Sort by velocity for proper line connection
      const bubbleData = products.map(p=>({
        x:Number(p.avgDailySales)||0,
        y:Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0,
        r:Math.max(5,Math.sqrt(Number(p.soldCount||0))),
        label:p.name
      })).sort((a,b)=>a.x-b.x); // Sort by velocity so line flows left->right

      charts.current.bubble=new Chart(el,{
        type:"bubble",
        data:{
          datasets:[
            {
              label:"Products",
              type: "line", // Add line type first
              data: bubbleData,
              borderColor: ORANGE[500],
              backgroundColor: ORANGE[500] + "20",
              borderWidth: 2,
              pointRadius: 0,
              fill: false,
              tension: 0.4,
              order: 1
            },
            {
              label:"Products",
              type: "bubble", // Then bubbles on top
              data: bubbleData,
              backgroundColor:products.map(p=>{
                const vel=Number(p.avgDailySales)||0;
                const m=Number(p.price)>0?(Number(p.price)-Number(p.cost||0))/Number(p.price)*100:0;
                return(vel>5&&m>40?"#16a34a":vel>5?"#2563eb":m>40?ORANGE[500]:"#dc2626")+"bb";
              }),
              borderWidth:0,
              order: 0
            }
          ]
        },
        options:{
          responsive:true,maintainAspectRatio:false,
          plugins:{
            legend:{display:false},
            tooltip:{ callbacks:{ label:(ctx)=>{
              if(ctx.dataset.type === "line") return null;
              return[ctx.raw.label,`Velocity: ${ctx.raw.x.toFixed(1)}/day`,`Margin: ${ctx.raw.y.toFixed(1)}%`]
            }}}
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
            backgroundColor:["#16a34a","#ef4444","#ef4444","#ef4444","#ef4444","#2563eb"],
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
    { id:"treemap", label:"Revenue Map", icon:BarChart3 },
    { id:"bubble", label:"Product Matrix", icon:Activity },
    { id:"waterfall",label:"P&L Breakdown", icon:TrendingUp },
  ];

  return (
    <div className="total-products-chart-card">
      <div className="total-products-chart-tabs">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`total-products-chart-tab ${tab===t.id?'active':''}`}>
            <t.icon size={14}/>{t.label}
          </button>
        ))}
      </div>
      <div className="total-products-chart-body">
        {tab==="treemap" &&<canvas id="tp-treemap"/>}
        {tab==="bubble" &&<canvas id="tp-bubble"/>}
        {tab==="waterfall"&&<canvas id="tp-waterfall"/>}
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

  return (
    <motion.div layout className="total-products-table-row">
      <div onClick={onToggle} className="total-products-row-main">
        <div className="total-products-product-cell">
          <div className="total-products-avatar">{(p.name||"?")[0].toUpperCase()}</div>
          <div className="total-products-product-info">
            <div className="total-products-product-name">{p.name}</div>
            <div className="total-products-product-cat">{p.category||"Uncategorized"}</div>
          </div>
        </div>
        <div className={`total-products-score ${score>75?"high":score>50?"mid":"low"}`}>{score}</div>
        <div className="total-products-cell-right">{fmt(price)}</div>
        <div className={`total-products-cell-right total-products-margin-${margin>40?"high":margin>20?"mid":"low"}`}>{fmtPct(margin)}</div>
        <div className="total-products-cell-right">{fmtShort(revenue)}</div>
        <div className={`total-products-stock-badge ${stockStatus}`}>{stock}</div>
      </div>
      <AnimatePresence>
        {expanded&&(
          <motion.div
            initial={{height:0,opacity:0}}
            animate={{height:"auto",opacity:1}}
            exit={{height:0,opacity:0}}
            className="total-products-row-expanded"
          >
            <div className="total-products-expanded-grid">
              {[
                {label:"Total Sold",value:sold},
                {label:"Gross Profit",value:fmtShort(profit)},
                {label:"Stock Value",value:fmtShort(price*stock)},
                {label:"Avg Daily",value:`${Number(p.avgDailySales||0).toFixed(1)}/day`},
                {label:"SKU",value:p.sku||"N/A"},
                {label:"Rec",value:stock<10?"Reorder":margin>50?"Boost Ads":"Monitor"},
              ].map(item=>(
                <div key={item.label} className="total-products-expanded-item">
                  <div className="total-products-expanded-label">{item.label}</div>
                  <div className="total-products-expanded-value">{item.value}</div>
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
    <div className="total-products-table-card">
      <div className="total-products-table-header">
        <div className="total-products-section-title">Product Performance</div>
        <div className="total-products-table-count">{sorted.length} items</div>
      </div>
      
      {/* SCROLL WRAPPER - THIS FIXES MOBILE */}
      <div className="total-products-table-scroll">
        <div className="total-products-table-inner">
          <div className="total-products-table-header-row">
            {headers.map(h=>(
              <button key={h.key} onClick={()=>setSort(s=>({key:h.key,dir:s.key===h.key&&s.dir==="desc"?"asc":"desc"}))}
                className={`total-products-th ${h.key==="name"?'left':'right'}`}>
                {h.label}
                {sort.key===h.key&&(sort.dir==="desc"?<ChevronDown size={10}/>:<ChevronDown size={10} style={{transform:"rotate(180deg)"}}/>)}
              </button>
            ))}
          </div>

          {paged.length===0?(
            <div className="total-products-empty">
              <Package size={40} className="total-products-empty-icon"/>
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
        </div>
      </div>

      {pages>1&&(
        <div className="total-products-pagination">
          {Array.from({length:pages},(_,i)=>(
            <button key={i} onClick={()=>setPage(i)}
              className={`total-products-page-btn ${page===i?'active':''}`}>
              {i+1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function TotalProductsPage({ products=[], onBack }) {
  const [t,dark,toggleTheme]=useTheme();
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("all");
  const [dateRange,setDateRange]=useState("all");

  const cats=useMemo(()=>{
    const s=new Set(products.map(p=>p.category||"Uncategorized"));
    return["all",...Array.from(s).sort()];
  },[products]);

  const filtered=useMemo(()=>{
    const now=new Date(), past=new Date();
    if(dateRange==="7d") past.setDate(now.getDate()-7);
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
    <div className="total-products-page">
      <ThemeInjector t={t}/>

      {/* ─ Header ─ */}
      <div className="total-products-header">
        <div className="total-products-header-inner">
          {onBack&&(
            <button onClick={onBack} className="total-products-back-btn">
              <ArrowLeft size={20}/>Back
            </button>
          )}
          <div className="total-products-header-left">
            
            <div>
              <h1 className="total-products-title">Total Products Analytics</h1>
              <p className="total-products-subtitle">AI-powered inventory intelligence</p>
            </div>
          </div>
          <div className="total-products-header-actions">
            <button onClick={toggleTheme} className="total-products-icon-btn">
              {dark?<Sun size={16}/>:<Moon size={16}/>}
            </button>
            <button onClick={handleExport} className="total-products-export-btn">
              <Download size={18}/>Export
            </button>
          </div>
        </div>
      </div>

      <div className="total-products-container">

        {/* ─ Filters ─ */}
        <div className="total-products-filters">
          <div className="total-products-search-box">
            <Search size={18}/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search products..."/>
            {search&&<button onClick={()=>setSearch("")}><X size={14}/></button>}
          </div>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="total-products-select">
            {cats.map(c=><option key={c} value={c}>{c==="all"?"All Categories":c}</option>)}
          </select>
          <select value={dateRange} onChange={e=>setDateRange(e.target.value)} className="total-products-select">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        {/* ─ KPI Grid ─ */}
        <div className="total-products-kpi-grid">
          {kpiCards.map((k,i)=><KpiCard key={k.label} {...k} />)}
        </div>

        {/* ─ AI Panel ─ */}
        {(alerts.length>0||insights.length>0)&&(
          <div className="total-products-ai-panel">
            {alerts.length>0&&(
              <div className="total-products-ai-section">
                <div className="total-products-ai-header">
                  <div className="total-products-ai-icon"><AlertTriangle size={14}/></div>
                  <div className="total-products-ai-title">Alerts</div>
                  <div className="total-products-ai-badge">{alerts.length}</div>
                </div>
                <div className="total-products-ai-list">
                  {alerts.map((a,i)=><AlertBadge key={i} alert={a}/>)}
                </div>
              </div>
            )}

            {insights.length>0&&(
              <div className="total-products-ai-section">
                <div className="total-products-ai-header">
                  <div className="total-products-ai-icon"><Brain size={14}/></div>
                  <div className="total-products-ai-title">AI Insights</div>
                  <div className="total-products-ai-live">
                    <div className="total-products-ai-live-dot"/>
                    Live
                  </div>
                </div>
                <div className="total-products-ai-list">
                  {insights.map((ins,i)=><InsightCard key={i} ins={ins}/>)}
                </div>
              </div>
            )}

            {anomalies.length>0&&(
              <div className="total-products-ai-section">
                <div className="total-products-ai-header">
                  <div className="total-products-ai-icon"><Zap size={14}/></div>
                  <div className="total-products-ai-title">Anomalies</div>
                </div>
                <div className="total-products-ai-list">
                  {anomalies.map((a,i)=>(
                    <div key={i} className="total-products-anomaly-item">
                      <a.icon size={14} className="total-products-anomaly-icon"/>
                      <div>
                        <div className="total-products-anomaly-title">{a.title}</div>
                        <div className="total-products-anomaly-text">{a.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─ Charts ─ */}
        <div className="total-products-charts-section">
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
          .total-products-filters{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}