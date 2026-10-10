import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity, AlertTriangle, ArrowRight, BatteryCharging, BookOpen, CarFront, CheckCircle2,
  ChevronRight, CircleHelp, Cpu, Database, FileSearch, Gauge, HardDrive, KeyRound,
  Layers3, Menu, Search, Settings2, ShieldCheck, SlidersHorizontal, Thermometer, Bluetooth, Wifi,
  Wrench, X, Zap
} from "lucide-react";
import { faultCodes, sensors, vehicles, systems, programmingTasks, hardware } from "./data";
import "./styles.css";

const nav = [
  ["Overview", "overview", Gauge], ["Fault code lookup", "codes", FileSearch],
  ["Component library", "components", Layers3], ["ECU programming", "programming", Cpu],
  ["Vehicle database", "vehicles", CarFront], ["Repair workflows", "repairs", Wrench],
  ["Symptom diagnosis", "symptoms", Activity], ["OBD-II scanner", "scanner", Bluetooth], ["Live data guide", "live-data", SlidersHorizontal],
  ["Maintenance planner", "maintenance", CheckCircle2], ["Tools & glossary", "tools", BookOpen],
];
const iconMap = { Engine: Gauge, Electrical: Zap, Transmission: Settings2, "ABS & Brakes": ShieldCheck, Cooling: Thermometer, Emissions: Activity, "Body & Safety": CarFront, Sensors: SlidersHorizontal };

function App() {
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState(faultCodes[0]);
  const [selectedSensor, setSelectedSensor] = useState(sensors[0]);
  const [systemFilter, setSystemFilter] = useState("All systems");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [vehicleMake, setVehicleMake] = useState("Toyota");
  const [vehicleModel, setVehicleModel] = useState("Corolla");
  const [vehicleYear, setVehicleYear] = useState("2018");
  const [checked, setChecked] = useState([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [symptom, setSymptom] = useState("Engine cranks but will not start");
  const [symptomResults, setSymptomResults] = useState(false);
  const [toolSearch, setToolSearch] = useState("");
  const [scannerState, setScannerState] = useState("idle");
  const [scannerMessage, setScannerMessage] = useState("No scanner connected");
  const [scannerCodes, setScannerCodes] = useState([]);

  const filteredCodes = useMemo(() => faultCodes.filter(c => {
    const q = query.toLowerCase().trim();
    const matches = !q || [c.code,c.title,c.component,c.system,c.description,...c.symptoms,...c.causes].join(" ").toLowerCase().includes(q);
    return matches && (systemFilter === "All systems" || c.system === systemFilter);
  }), [query, systemFilter]);

  const go = (id) => { setPage(id); setMobileMenu(false); window.scrollTo({top:0, behavior:"smooth"}); };
  const toggleCheck = (item) => setChecked(old => old.includes(item) ? old.filter(x=>x!==item) : [...old,item]);
  const componentForCode = (code) => {
    const text = `${code.component} ${code.title}`.toLowerCase();
    if (text.includes("misfire") || text.includes("ignition")) return sensors.find(x=>x.name.includes("Crankshaft")) || sensors[0];
    if (text.includes("air flow") || text.includes("maf") || text.includes("lean")) return sensors.find(x=>x.name.includes("Mass Air Flow")) || sensors[2];
    if (text.includes("oxygen") || text.includes("catalyst") || text.includes("exhaust")) return sensors.find(x=>x.name.includes("Oxygen")) || sensors[4];
    if (text.includes("coolant") || text.includes("temperature")) return sensors.find(x=>x.name.includes("Coolant")) || sensors[5];
    if (text.includes("pressure")) return sensors.find(x=>x.name.includes("MAP")) || sensors[3];
    if (text.includes("throttle")) return sensors.find(x=>x.name.includes("Throttle")) || sensors[5];
    return sensors.find(x=>x.name.toLowerCase().includes((code.component||"").split(" ")[0].toLowerCase())) || sensors[0];
  };
  const connectScanner = async () => {
    if (!window.isSecureContext) { setScannerState("error"); setScannerMessage("Open this site over HTTPS to request Bluetooth access."); return; }
    if (!navigator.bluetooth) { setScannerState("error"); setScannerMessage("This browser does not support Web Bluetooth. Try current Chrome on Android with a compatible BLE adapter."); return; }
    try {
      setScannerState("connecting");
      const device = await navigator.bluetooth.requestDevice({acceptAllDevices:true, optionalServices:["generic_access","generic_attribute"]});
      setScannerState("connected");
      setScannerMessage(`Bluetooth device selected: ${device.name || "Unnamed adapter"}. Device discovery worked, but this adapter's OBD protocol is not yet verified.`);
      device.addEventListener("gattserverdisconnected",()=>{setScannerState("idle");setScannerMessage("Scanner disconnected.");});
    } catch (e) { setScannerState("error"); setScannerMessage(e.name === "NotFoundError" ? "No device selected. Check adapter power and Bluetooth." : (e.message || "Could not connect to device.")); }
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><CarFront size={24}/><span className="brand-dot"/></div>
        <div><strong>NEDDOZ<span> AUTO</span></strong><small>DIAGNOSTICS PLATFORM</small></div>
        <button className="icon-btn mobile-close" onClick={()=>setMobileMenu(false)} aria-label="Close menu"><X/></button>
      </div>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(([label,id,Icon])=><button key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>go(id)}><Icon size={18}/><span>{label}</span>{id==="codes"&&<span className="nav-count">{faultCodes.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="system-status"><span className="status-dot"/> Reference mode <small>No vehicle connected</small></div>
        <div className="side-help"><ShieldCheck size={18}/><div><b>Safety first</b><p>Verify procedures for the exact vehicle.</p></div></div>
        <small className="version">V1.0 · FREE-FIRST EDITION</small>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="icon-btn menu-toggle" onClick={()=>setMobileMenu(true)} aria-label="Open menu"><Menu/></button>
        <div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{nav.find(n=>n[1]===page)?.[0] || "Overview"}</b></div>
        <div className="top-actions"><span className="mode-pill"><span className="status-dot"/> Offline reference</span><button className="avatar" title="Neddoz Auto Diagnostics">NA</button></div>
      </header>

      {page==="overview" && <section className="content">
        <div className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line"/> AUTOMOTIVE INTELLIGENCE</div>
            <h1>Find the fault.<br/><em>Understand the fix.</em></h1>
            <p>One workspace for fault codes, component references, repair workflows and ECU programming preparation.</p>
            <div className="hero-actions"><button className="btn btn-primary" onClick={()=>go("codes")}><Search size={17}/> Diagnose a fault <ArrowRight size={16}/></button><button className="btn btn-secondary" onClick={()=>go("programming")}><Cpu size={17}/> ECU programming</button></div>
          </div>
          <div className="hero-art"><div className="scan-ring ring-one"/><div className="scan-ring ring-two"/><div className="engine-graphic"><Cpu size={78} strokeWidth={1.2}/><span>ECU</span></div><div className="floating-tag tag-a"><Activity size={15}/> Live-data concepts</div><div className="floating-tag tag-b"><ShieldCheck size={15}/> Safety-led workflow</div><div className="hero-grid"/></div>
        </div>

        <div className="notice"><AlertTriangle size={18}/><div><b>Reference mode — not connected to a vehicle</b><span>This V1 explains diagnostic information. It cannot read a real ECU or perform programming without compatible hardware and approved software.</span></div><button onClick={()=>go("programming")}>Programming requirements <ArrowRight size={15}/></button></div>

        <div className="section-heading"><div><span className="eyebrow">QUICK ACCESS</span><h2>Diagnostic workspace</h2></div><span className="subtle">Choose a starting point</span></div>
        <div className="quick-grid">
          <button className="quick-card" onClick={()=>go("codes")}><div className="quick-icon orange"><FileSearch/></div><span className="quick-meta">FAULT LIBRARY</span><h3>Fault code lookup</h3><p>Search a code, symptom or component.</p><span className="quick-link">Search codes <ArrowRight size={15}/></span></button>
          <button className="quick-card" onClick={()=>go("components")}><div className="quick-icon blue"><Layers3/></div><span className="quick-meta">COMPONENTS</span><h3>Sensors & systems</h3><p>Understand purpose, symptoms and tests.</p><span className="quick-link">Browse library <ArrowRight size={15}/></span></button>
          <button className="quick-card" onClick={()=>go("programming")}><div className="quick-icon purple"><Cpu/></div><span className="quick-meta">ECU WORKFLOW</span><h3>Programming centre</h3><p>Plan updates, coding and adaptations safely.</p><span className="quick-link">Open centre <ArrowRight size={15}/></span></button>
          <button className="quick-card" onClick={()=>go("repairs")}><div className="quick-icon green"><Wrench/></div><span className="quick-meta">WORKSHOP</span><h3>Repair workflows</h3><p>Use a repeatable diagnose-test-verify process.</p><span className="quick-link">View workflow <ArrowRight size={15}/></span></button>
        </div>

        <div className="section-heading"><div><span className="eyebrow">STARTER DATASET</span><h2>Example fault codes</h2></div><button className="text-btn" onClick={()=>go("codes")}>View all codes <ArrowRight size={15}/></button></div>
        <div className="table-card"><div className="table-head"><span>CODE / SYSTEM</span><span>DESCRIPTION</span><span>RELATED COMPONENT</span><span>STATUS</span></div>{faultCodes.slice(0,4).map(c=><button className="table-row" key={c.code} onClick={()=>{setSelectedCode(c);setPage("codes");setQuery(c.code)}}><div><b className="code">{c.code}</b><small>{c.system}</small></div><div className="row-desc">{c.title}</div><div>{c.component}</div><span className="status-tag">Reference</span></button>)}</div>
        <Footer/>
      </section>}

      {page==="codes" && <section className="content">
        <PageTitle eyebrow="FAULT CODE DATABASE" title="Fault code lookup" desc="Search generic example codes, symptoms or components. Always confirm definitions against service information for the exact vehicle."/>
        <div className="search-panel"><div className="search-input"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try P0301, misfire, oxygen sensor..."/>{query&&<button onClick={()=>setQuery("")}><X size={16}/></button>}</div><select value={systemFilter} onChange={e=>setSystemFilter(e.target.value)}><option>All systems</option>{systems.map(s=><option key={s.name}>{s.name}</option>)}</select></div>
        <div className="vehicle-inline"><b><CarFront size={17}/> Selected vehicle</b><label><span>Make</span><select value={vehicleMake} onChange={e=>{setVehicleMake(e.target.value);setVehicleModel((vehicles[e.target.value]||["Other"])[0]);}}>{Object.keys(vehicles).map(m=><option key={m}>{m}</option>)}</select></label><label><span>Model</span><select value={vehicleModel} onChange={e=>setVehicleModel(e.target.value)}>{(vehicles[vehicleMake]||["Other"]).map(m=><option key={m}>{m}</option>)}</select></label><label><span>Year</span><select value={vehicleYear} onChange={e=>setVehicleYear(e.target.value)}>{Array.from({length:35},(_,i)=>String(2026-i)).map(y=><option key={y}>{y}</option>)}</select></label><small>Generic code reference only; confirm code definition and component location for this exact engine/VIN.</small></div><div className="result-layout"><div className="result-list"><div className="list-summary">{filteredCodes.length} reference results</div>{filteredCodes.map(c=><button className={`fault-result ${selectedCode.code===c.code?"selected":""}`} key={c.code} onClick={()=>setSelectedCode(c)}><div className="result-top"><b className="code">{c.code}</b><span className="mini-tag">{c.system}</span></div><strong>{c.title}</strong><span>{c.component}</span><small>{c.description}</small></button>)}{!filteredCodes.length&&<div className="empty-state"><CircleHelp size={30}/><b>No matching sample code</b><p>Try a generic code such as P0301, P0171, P0101 or a symptom keyword.</p></div>}</div>
          <div className="detail-card"><div className="detail-image">{componentForCode(selectedCode).image ? <img className="sensor-detail-photo" src={componentForCode(selectedCode).image} alt={componentForCode(selectedCode).name}/> : <div className="component-placeholder"><Cpu size={48}/><span>COMPONENT REFERENCE</span></div>}<span className="image-caption">Related component reference — confirm by VIN and engine</span></div><div className="detail-body"><div className="detail-code">{selectedCode.code}<span className="mini-tag">{selectedCode.system}</span></div><h2>{selectedCode.title}</h2><p>{selectedCode.description}</p><div className="detail-section"><h4><Activity size={16}/> Common symptoms</h4><ul>{selectedCode.symptoms.map(s=><li key={s}>{s}</li>)}</ul></div><div className="detail-section"><h4><CircleHelp size={16}/> Possible causes</h4><ul>{selectedCode.causes.map(s=><li key={s}>{s}</li>)}</ul></div><div className="detail-section"><h4><Wrench size={16}/> Diagnostic approach</h4><ol>{selectedCode.steps.map(s=><li key={s}>{s}</li>)}</ol></div><div className="component-chip"><span>RELATED COMPONENT</span><b>{selectedCode.component}</b><small>{selectedCode.note}</small></div><div className="safety-note"><AlertTriangle size={17}/><span>Code meaning is not a confirmed failed part. Test the circuit/system before replacing components.</span></div></div></div>
        </div><Footer/>
      </section>}

      {page==="components" && <section className="content">
        <PageTitle eyebrow="VISUAL REFERENCE LIBRARY" title="Sensors & components" desc="Learn what each component does, symptoms that may be associated with faults and how a trained technician begins testing."/>
        <div className="component-grid">{sensors.map(s=><button key={s.name} className={`sensor-card ${selectedSensor.name===s.name?"chosen":""}`} onClick={()=>setSelectedSensor(s)}><div className="sensor-visual">{s.image ? <img className="sensor-photo" src={s.image} alt={s.name} loading="lazy"/> : <div className="sensor-art"><Cpu size={35}/></div>}<span>{s.system}</span></div><div className="sensor-info"><h3>{s.name}</h3><p>{s.purpose}</p><span className="quick-link">View test notes <ArrowRight size={14}/></span></div></button>)}</div>
        <div className="sensor-detail">{selectedSensor.image ? <img className="sensor-detail-photo" src={selectedSensor.image} alt={selectedSensor.name}/> : <div className="sensor-detail-icon"><SlidersHorizontal size={30}/></div>}<div className="sensor-detail-content"><span className="eyebrow">COMPONENT PROFILE</span><h2>{selectedSensor.name}</h2><p>{selectedSensor.purpose}</p><div className="three-col"><div><b>Possible symptoms</b><p>{selectedSensor.symptoms}</p></div><div><b>Inspection ideas</b><p>{selectedSensor.inspection}</p></div><div><b>Testing notes</b><p>{selectedSensor.testing}</p></div></div></div></div><Footer/>
      </section>}

      {page==="programming" && <section className="content">
        <PageTitle eyebrow="ADVANCED SERVICE WORKFLOWS" title="ECU programming centre" desc="Plan legitimate module service operations. This is a preparation and reference centre; no ECU is connected and no firmware is written by this website."/>
        <div className="program-hero"><div className="program-hero-icon"><Cpu size={40}/></div><div><span className="eyebrow">BEFORE YOU BEGIN</span><h2>Identify first. Verify compatibility. Then program.</h2><p>Incorrect calibration or interrupted programming can immobilize a vehicle or damage a control module.</p></div></div>
        <div className="program-grid">{programmingTasks.map((t,i)=><article className="program-card" key={t.title}><div className="program-number">0{i+1}</div><div className="program-icon">{t.icon==="refresh"?<Activity/>:t.icon==="settings"?<Settings2/>:t.icon==="key"?<KeyRound/>:<Layers3/>}</div><h3>{t.title}</h3><p>{t.desc}</p><div className="requirements"><b>Typical requirements</b><span>{t.requirements}</span></div><div className="caution-line"><ShieldCheck size={15}/>{t.caution}</div></article>)}</div>
        <div className="section-heading"><div><span className="eyebrow">HARDWARE & SOFTWARE</span><h2>What you may need</h2></div></div>
        <div className="hardware-list">{hardware.map(h=><div className="hardware-row" key={h.name}><div className="hardware-icon"><HardDrive size={22}/></div><div className="hardware-copy"><b>{h.name}</b><p>{h.desc}</p></div><span className={`requirement-tag ${h.level==="Required for some operations"?"needed":""}`}>{h.level}</span></div>)}</div>
        <div className="official-links"><h3><BookOpen size={19}/> Legitimate information sources</h3><p>Use manufacturer service portals and authorized/licensed tool providers. Access, coverage and fees vary by make and country; verify the official domain and vehicle coverage before purchase.</p><div className="link-pills"><a href="https://www.nastf.org/" target="_blank" rel="noreferrer">NASTF <ArrowRight size={13}/></a><a href="https://www.nhtsa.gov/" target="_blank" rel="noreferrer">NHTSA <ArrowRight size={13}/></a><a href="https://www.sae.org/" target="_blank" rel="noreferrer">SAE International <ArrowRight size={13}/></a></div><small>These are general industry / safety information sources, not a guarantee of ECU programming coverage for a specific vehicle.</small></div>
        <div className="notice warning"><AlertTriangle size={18}/><div><b>Security and safety boundary</b><span>Use authorized workflows and proof of ownership where required. This platform does not provide immobilizer bypasses, security defeats, emissions tampering or unverified firmware downloads.</span></div></div><Footer/>
      </section>}

      {page==="vehicles" && <section className="content">
        <PageTitle eyebrow="VEHICLE COMPATIBILITY" title="Vehicle database" desc="Select a vehicle profile to organize diagnostic notes. The examples below are not a VIN-decoded compatibility guarantee."/>
        <div className="vehicle-layout"><div className="vehicle-form"><div className="form-heading"><CarFront size={22}/><div><h3>Vehicle profile</h3><p>Choose a sample vehicle</p></div></div><label>Make<select value={vehicleMake} onChange={e=>{setVehicleMake(e.target.value);setVehicleModel(e.target.value==="Toyota"?"Corolla":e.target.value==="Nissan"?"Note":e.target.value==="Mazda"?"Mazda3":"Impreza")}}>{["Toyota","Nissan","Mazda","Subaru","Honda","BMW","Volkswagen"].map(x=><option key={x}>{x}</option>)}</select></label><label>Model<select value={vehicleModel} onChange={e=>setVehicleModel(e.target.value)}>{(vehicles[vehicleMake]||["Other"]).map(x=><option key={x}>{x}</option>)}</select></label><label>Year<select value={vehicleYear} onChange={e=>setVehicleYear(e.target.value)}>{Array.from({length:25},(_,i)=>String(2026-i)).map(x=><option key={x}>{x}</option>)}</select></label><button className="btn btn-primary full" onClick={()=>setReportOpen(true)}><Database size={16}/> Create profile summary</button></div><div className="vehicle-summary"><div className="vehicle-art"><CarFront size={76} strokeWidth={1}/><span>VEHICLE PROFILE</span></div><div className="vehicle-summary-body"><span className="eyebrow">CURRENT SELECTION</span><h2>{vehicleYear} {vehicleMake} {vehicleModel}</h2><p>Use the VIN and exact engine/module details to confirm diagnostic coverage before selecting parts or programming software.</p><div className="vehicle-stats"><div><b>Generic OBD-II</b><span>Where supported</span></div><div><b>ECU coverage</b><span>Must be verified</span></div><div><b>Wiring specs</b><span>Vehicle-specific manual</span></div></div>{reportOpen&&<div className="generated-report"><CheckCircle2 size={18}/><div><b>Profile summary created</b><p>{vehicleMake} {vehicleModel}, model year {vehicleYear}. VIN, engine code and module IDs still need to be entered from the actual vehicle.</p></div></div>}</div></div></div>
        <div className="section-heading"><div><span className="eyebrow">SAMPLE COVERAGE GROUPS</span><h2>Starter vehicle index</h2></div></div><div className="vehicle-list">{Object.entries(vehicles).map(([make,models])=><div key={make} className="vehicle-make"><b><CarFront size={18}/>{make}</b><div>{models.map(m=><span key={m}>{m}</span>)}</div></div>)}</div><div className="safety-note"><AlertTriangle size={17}/><span>Vehicle names are starter examples only. This build does not include a full OEM database, VIN decoding, verified wiring diagrams or calibration files.</span></div><Footer/>
      </section>}

      {page==="symptoms" && <section className="content">
        <PageTitle eyebrow="GUIDED TROUBLESHOOTING" title="Symptom diagnosis" desc="Choose the closest symptom to build a safe first-check plan. These are possibilities, not a confirmed diagnosis."/>
        <div className="vehicle-form symptom-form"><div className="form-heading"><Activity size={22}/><div><h3>What is the vehicle doing?</h3><p>Pick one symptom to see common causes and next checks.</p></div></div><label>Symptom<select value={symptom} onChange={e=>{setSymptom(e.target.value);setSymptomResults(false)}}>{["Engine cranks but will not start","Engine does not crank","Rough idle or misfire","Overheating","Poor fuel economy","Loss of power","Battery keeps going flat","ABS warning light","Transmission shifts badly","Check-engine light is on"].map(x=><option key={x}>{x}</option>)}</select></label><button className="btn btn-primary" onClick={()=>setSymptomResults(true)}>Build diagnostic plan <ArrowRight size={16}/></button></div>
        {symptomResults && <div className="detail-card symptom-results"><div className="detail-body"><span className="eyebrow">FIRST-CHECK PLAN</span><h2>{symptom}</h2><div className="detail-section"><h4>Start with these checks</h4><ol>{(symptom.includes("cranks but")?["Check fuel level and note whether the security indicator behaves normally.","Scan for stored and pending codes before disconnecting the battery.","Check cranking RPM/live data if a compatible scanner is available.","Inspect relevant fuses, connectors and intake hoses safely."]:symptom.includes("does not crank")?["Check battery condition and terminal connections.","Observe dashboard warnings and listen for the starter response.","Check the correct fuse/relay information for this vehicle.","Have starter-control and voltage-drop tests performed if needed."]:symptom.includes("Overheating")?["Stop driving if temperature is in the danger zone or steam appears.","Never open a hot pressurized cooling system.","When fully cool, inspect coolant level and visible leaks.","Have fans, thermostat, pump and circulation checked using the service procedure."]: ["Record all codes and freeze-frame data before clearing anything.","Check battery voltage, connectors, grounds and visible damage.","Compare live data with vehicle-specific specifications.","Test the most likely system before replacing parts."]).map(x=><li key={x}>{x}</li>)}</ol></div><div className="notice warning"><AlertTriangle size={17}/><div><b>Important</b><span>If the car has brake, steering, fuel leak, overheating, airbag or high-voltage warnings, stop and seek a qualified technician.</span></div></div><button className="btn btn-secondary" onClick={()=>{setQuery(symptom);go("codes")}}>Search related fault references <ArrowRight size={15}/></button></div></div>}
        <div className="section-heading"><div><span className="eyebrow">DIAGNOSIS RULE</span><h2>Test before replacing</h2></div></div><div className="quick-grid"><article className="quick-card"><h3>1. Verify</h3><p>Confirm the complaint and vehicle identity.</p></article><article className="quick-card"><h3>2. Measure</h3><p>Use scan data and correct test equipment.</p></article><article className="quick-card"><h3>3. Confirm</h3><p>Match findings to service specifications before buying parts.</p></article></div><Footer/>
      </section>}

      {page==="scanner" && <section className="content">
        <PageTitle eyebrow="OBD-II CONNECTIVITY" title="Connect a compatible scanner" desc="Pair a supported Bluetooth Low Energy adapter, then use its supported OBD protocol to retrieve real vehicle data."/>
        <div className="scanner-hero"><div className="scanner-icon"><Bluetooth size={34}/></div><div><span className="eyebrow">HARDWARE CONNECTION</span><h2>{scannerState==="connected"?"Device selected":"Connect OBD-II adapter"}</h2><p>{scannerMessage}</p><span className={`scanner-status ${scannerState}`}>{scannerState==="connected"?"DEVICE DISCOVERED":scannerState==="connecting"?"WAITING FOR DEVICE":scannerState==="error"?"CONNECTION ISSUE":"NOT CONNECTED"}</span></div><button className="btn btn-primary" onClick={connectScanner} disabled={scannerState==="connecting"}><Bluetooth size={16}/>{scannerState==="connecting"?"Searching…":"Find Bluetooth device"}</button></div>
        <div className="notice warning"><AlertTriangle size={18}/><div><b>Important compatibility limit</b><span>Most inexpensive ELM327 adapters use Bluetooth Classic and cannot be selected by Web Bluetooth. This page currently discovers BLE devices only; it does not yet decode OBD-II data from arbitrary adapters, so it will never invent scan results.</span></div></div>
        <div className="quick-grid"><article className="quick-card"><div className="quick-icon blue"><Bluetooth/></div><h3>1. Compatible adapter</h3><p>Use a BLE adapter whose GATT service and OBD protocol are documented and supported.</p></article><article className="quick-card"><div className="quick-icon orange"><CarFront/></div><h3>2. Vehicle ready</h3><p>Park safely, apply the parking brake and follow the vehicle manual before connecting.</p></article><article className="quick-card"><div className="quick-icon purple"><FileSearch/></div><h3>3. Read real codes</h3><p>When a supported protocol driver is added, real DTCs can be matched to the code library and component references.</p></article></div>
        <div className="official-links"><h3><BookOpen size={19}/> What this version can do</h3><p>Use Fault Code Lookup to enter a code manually and see likely causes, diagnostic steps and a related sensor/component photo. Live scanning and automated vehicle-specific sensor-location diagrams require a tested adapter protocol and verified vehicle data.</p><button className="btn btn-secondary" onClick={()=>go("codes")}>Open fault code lookup <ArrowRight size={15}/></button></div><Footer/>
      </section>}

      {page==="live-data" && <section className="content">
        <PageTitle eyebrow="OBD-II LEARNING CENTRE" title="Live data guide" desc="Learn what common scan-tool parameters mean and how to interpret them. This page does not connect to or read a real vehicle."/>
        <div className="notice"><Activity size={18}/><div><b>Scanner not connected</b><span>Live values must come from a compatible OBD-II adapter and app/tool. The guide below explains parameters; it does not generate fake readings.</span></div></div>
        <div className="table-card"><div className="table-head"><span>PARAMETER</span><span>WHAT IT MEANS</span><span>INTERPRETATION</span><span>NOTE</span></div>{[["Engine RPM","Crankshaft rotational speed","Compare idle and cranking behavior","Vehicle-specific range"],["Coolant temperature","Reported engine coolant temperature","Cold-soak reading should be plausible","Never open a hot system"],["Short-term fuel trim","Immediate ECU fuel correction","Large sustained corrections need investigation","Context matters"],["Long-term fuel trim","Learned fuel correction","Compare banks and operating conditions","Not a part-failure verdict"],["MAF airflow","Measured intake air mass","Compare with engine/load specifications","Engine dependent"],["O2 / A-F sensor","Exhaust feedback signal","Signal strategy varies by sensor type","Use OEM procedure"],["Throttle position","Throttle/pedal position data","Compare redundant channels where applicable","Drive-by-wire caution"],["System voltage","Voltage seen by scan tool/module","Compare under specified conditions","Smart charging varies"]].map(r=><div className="table-row" key={r[0]}><b>{r[0]}</b><span>{r[1]}</span><span className="row-desc">{r[2]}</span><span>{r[3]}</span></div>)}</div><div className="section-heading"><div><span className="eyebrow">HARDWARE</span><h2>What you need</h2></div></div><div className="hardware-list">{["A compatible OBD-II scanner or adapter","A supported phone app or diagnostic software","Vehicle-specific definitions and service data","A safe parked vehicle and correct ignition state"].map((x,i)=><div className="hardware-row" key={x}><div className="hardware-icon"><CheckCircle2 size={20}/></div><div className="hardware-copy"><b>{x}</b><p>{["Basic code readers may not support all modules or data.","Compatibility differs by adapter, phone and vehicle.","Generic values are not a substitute for OEM specifications.","Do not use a phone while driving or run tests unsafely."][i]}</p></div></div>)}</div><Footer/>
      </section>}

      {page==="maintenance" && <section className="content">
        <PageTitle eyebrow="OWNERSHIP & SERVICE PLANNING" title="Maintenance planner" desc="A general maintenance tracker to help organize service records. Always follow the schedule for your exact vehicle, engine and driving conditions."/>
        <div className="quick-grid">{[["Engine oil & filter","Use the exact approved oil grade and interval."],["Air & cabin filters","Inspect or replace according to service schedule and conditions."],["Tyres & brakes","Check pressures, tread and brake condition regularly."],["Battery & charging","Inspect terminals and test condition when symptoms appear."],["Coolant & belts","Use the specified coolant and inspection procedure."],["Transmission service","Intervals and fluid procedures vary significantly by model."]].map(([t,d],i)=><article className="quick-card" key={t}><div className="quick-icon blue"><CheckCircle2/></div><span className="quick-meta">SERVICE ITEM {String(i+1).padStart(2,"0")}</span><h3>{t}</h3><p>{d}</p><label className="maintenance-check"><input type="checkbox"/> Mark reviewed</label></article>)}</div><div className="notice warning"><AlertTriangle size={18}/><div><b>Do not rely on a universal interval</b><span>Service schedules differ by model, engine, mileage, time and severe-use conditions. Confirm the correct schedule in the owner's manual or authorized service information.</span></div></div><Footer/>
      </section>}

      {page==="tools" && <section className="content">
        <PageTitle eyebrow="REFERENCE DESK" title="Tools & automotive glossary" desc="Search common workshop tools and automotive terms. Choose equipment based on the task and your training."/>
        <div className="search-panel"><div className="search-input"><Search size={20}/><input value={toolSearch} onChange={e=>setToolSearch(e.target.value)} placeholder="Search multimeter, OBD-II, ECU, freeze frame..."/></div></div>
        <div className="component-grid">{[["OBD-II scanner","Reads supported diagnostic trouble codes and, depending on coverage, live data."],["Digital multimeter","Measures voltage, resistance and current with correct setup and safe procedures."],["Wiring diagram","Shows circuits, connectors, grounds and pin references for a specific vehicle."],["Freeze-frame data","Snapshot of operating conditions recorded when some faults were detected."],["ECU / ECM","Electronic control unit / engine control module; names and roles vary by vehicle."],["DTC","Diagnostic trouble code; it points to a monitored condition, not automatically a failed part."],["J2534 interface","A pass-through interface used with compatible manufacturer software for supported tasks."],["Technical Service Bulletin","Manufacturer guidance about known conditions and approved repair approaches."]].filter(([t,d])=>(t+" "+d).toLowerCase().includes(toolSearch.toLowerCase())).map(([t,d])=><article className="quick-card" key={t}><div className="quick-icon purple"><BookOpen/></div><h3>{t}</h3><p>{d}</p></article>)}</div><div className="official-links"><h3>Useful legitimate references</h3><div className="link-pills"><a href="https://www.nhtsa.gov/" target="_blank" rel="noreferrer">NHTSA <ArrowRight size={13}/></a><a href="https://www.nastf.org/" target="_blank" rel="noreferrer">NASTF <ArrowRight size={13}/></a><a href="https://www.sae.org/" target="_blank" rel="noreferrer">SAE International <ArrowRight size={13}/></a></div><small>Coverage, access requirements and fees vary. Verify the official service source for your vehicle and region.</small></div><Footer/>
      </section>}

      {page==="repairs" && <section className="content">
        <PageTitle eyebrow="WORKSHOP PROCEDURES" title="Repair workflows" desc="A consistent process reduces guesswork and prevents unnecessary part replacement."/>
        <div className="repair-intro"><div className="repair-icon"><Wrench size={30}/></div><div><h2>Diagnose → Test → Repair → Verify</h2><p>Use this checklist for a general fault investigation. Follow the vehicle-specific service manual for exact procedures and values.</p></div></div>
        <div className="checklist">{["Confirm the customer's complaint and operating conditions","Record warning lights and all relevant DTCs before clearing anything","Identify the exact vehicle: VIN, model year, engine and module","Inspect battery condition, connectors, grounds, leaks and obvious damage","Check service information, wiring diagrams and technical service bulletins","Choose a test that can distinguish between the likely causes","Measure against manufacturer specifications using suitable tools","Repair only after the cause is supported by evidence","Clear codes only when appropriate and complete required relearns","Re-test the original complaint and document the result"].map((item,i)=><label className={`check-row ${checked.includes(item)?"checked":""}`} key={item}><input type="checkbox" checked={checked.includes(item)} onChange={()=>toggleCheck(item)}/><span className="check-number">{String(i+1).padStart(2,"0")}</span><span>{item}</span><CheckCircle2 size={18}/></label>)}</div><div className="check-progress"><div><b>{checked.length} of 10 steps complete</b><span>Checklist is stored only in this current page session.</span></div><div className="progress-track"><span style={{width:`${checked.length*10}%`}}/></div><button className="btn btn-secondary" onClick={()=>setChecked([])}>Reset checklist</button></div>
        <div className="notice warning"><AlertTriangle size={18}/><div><b>Stop when the risk is high</b><span>Airbag/SRS, high-voltage hybrid/EV, fuel-pressure, brake-hydraulic and structural repairs require the correct training, equipment and manufacturer procedures.</span></div></div><Footer/>
      </section>}
    </main>
  </div>;
}

function PageTitle({eyebrow,title,desc}) { return <div className="page-title"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{desc}</p></div>; }
function Footer(){return <footer className="footer"><span>© 2026 Neddoz Auto Diagnostics</span><span><ShieldCheck size={14}/> Educational reference · Verify with OEM service data</span></footer>}
createRoot(document.getElementById("root")).render(<App/>);