// Hand-drawn study diagrams. Simplified and NOT to scale. Real charts: see Links tab.
const BLUE = "#1f5fbf", MAG = "#b0287f", GRN = "#1e8a4c", INK = "currentColor";

const DIAGRAMS = {
  airspace: {
    title: "US airspace classes (side view, not to scale)",
    svg: `<svg viewBox="0 0 660 320" role="img" aria-label="Airspace class side view">
  <defs>
    <linearGradient id="egrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${MAG}" stop-opacity=".05"/><stop offset="1" stop-color="${MAG}" stop-opacity=".14"/></linearGradient>
  </defs>
  <rect x="20" y="14" width="620" height="30" fill="#888" opacity=".15"/>
  <text x="330" y="34" text-anchor="middle" font-size="12" fill="${INK}">Class A: 18,000 ft MSL to FL600 (IFR only)</text>
  <rect x="20" y="44" width="620" height="206" fill="url(#egrad)"/>
  <text x="600" y="70" text-anchor="end" font-size="12" fill="${MAG}">Class E (controlled, fills the gaps)</text>
  <!-- Class B -->
  <path d="M40 215 H70 V240 H100 V270 H160 V240 H190 V215 H220 V60 H40 Z" fill="${BLUE}" opacity=".12" stroke="${BLUE}" stroke-width="2"/>
  <text x="130" y="110" text-anchor="middle" font-size="13" font-weight="700" fill="${BLUE}">Class B</text>
  <text x="130" y="127" text-anchor="middle" font-size="11" fill="${INK}">surface to ~10,000 MSL</text>
  <text x="130" y="141" text-anchor="middle" font-size="11" fill="${INK}">"upside-down wedding cake"</text>
  <!-- Class C -->
  <path d="M250 235 H285 V270 H335 V235 H370 V175 H250 Z" fill="${MAG}" opacity=".12" stroke="${MAG}" stroke-width="2"/>
  <text x="310" y="200" text-anchor="middle" font-size="13" font-weight="700" fill="${MAG}">Class C</text>
  <text x="310" y="215" text-anchor="middle" font-size="10" fill="${INK}">to ~4,000 ft above airport</text>
  <!-- Class D -->
  <rect x="400" y="215" width="60" height="55" fill="${BLUE}" opacity=".08" stroke="${BLUE}" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="430" y="238" text-anchor="middle" font-size="13" font-weight="700" fill="${BLUE}">D</text>
  <text x="430" y="253" text-anchor="middle" font-size="9" fill="${INK}">~2,500 AGL</text>
  <!-- Class E surface -->
  <rect x="485" y="232" width="45" height="38" fill="${MAG}" opacity=".08" stroke="${MAG}" stroke-width="2" stroke-dasharray="6 4"/>
  <text x="507" y="250" text-anchor="middle" font-size="10" font-weight="700" fill="${MAG}">E sfc</text>
  <!-- Class G -->
  <rect x="540" y="232" width="100" height="38" fill="#999" opacity=".12"/>
  <text x="590" y="247" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">Class G</text>
  <text x="590" y="258" text-anchor="middle" font-size="9" fill="${INK}">below 700 or 1,200 AGL</text>
  <line x1="530" y1="232" x2="640" y2="232" stroke="${MAG}" stroke-width="1"/>
  <text x="640" y="227" text-anchor="end" font-size="9" fill="${MAG}">E floor 700 / 1,200 AGL</text>
  <!-- 400 ft -->
  <line x1="20" y1="262" x2="640" y2="262" stroke="${GRN}" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="24" y="258" font-size="10" fill="${GRN}">400 ft AGL Part 107 limit</text>
  <line x1="20" y1="270" x2="640" y2="270" stroke="${INK}" stroke-width="2"/>
  <text x="130" y="290" text-anchor="middle" font-size="11" fill="${INK}">needs authorization</text>
  <text x="310" y="290" text-anchor="middle" font-size="11" fill="${INK}">needs authorization</text>
  <text x="470" y="290" text-anchor="middle" font-size="11" fill="${INK}">needs authorization</text>
  <text x="590" y="290" text-anchor="middle" font-size="11" fill="${GRN}">no authorization</text>
  <text x="330" y="312" text-anchor="middle" font-size="11" fill="${INK}">Authorization through LAANC or FAADroneZone</text>
</svg>`,
  },

  symbols: {
    title: "Sectional chart airspace symbols",
    svg: `<svg viewBox="0 0 660 360" role="img" aria-label="Sectional airspace symbols">
  <defs>
    <linearGradient id="vigM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${MAG}" stop-opacity=".55"/><stop offset="1" stop-color="${MAG}" stop-opacity="0"/></linearGradient>
    <linearGradient id="vigB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE}" stop-opacity=".55"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/></linearGradient>
  </defs>
  <g font-size="13" fill="${INK}">
    <line x1="20" y1="30" x2="160" y2="30" stroke="${BLUE}" stroke-width="4"/>
    <text x="175" y="35"><tspan font-weight="700" fill="${BLUE}">Class B</tspan>: solid blue. Label <tspan font-weight="700">70/20</tspan> = ceiling 7,000 MSL, floor 2,000 MSL</text>
    <line x1="20" y1="72" x2="160" y2="72" stroke="${MAG}" stroke-width="4"/>
    <text x="175" y="77"><tspan font-weight="700" fill="${MAG}">Class C</tspan>: solid magenta. <tspan font-weight="700">40/SFC</tspan> = surface to 4,000 MSL</text>
    <line x1="20" y1="114" x2="160" y2="114" stroke="${BLUE}" stroke-width="3" stroke-dasharray="9 6"/>
    <rect x="70" y="122" width="36" height="20" fill="none" stroke="${BLUE}"/><text x="88" y="137" text-anchor="middle" font-size="12" fill="${BLUE}">25</text>
    <text x="175" y="119"><tspan font-weight="700" fill="${BLUE}">Class D</tspan>: dashed blue. Box <tspan font-weight="700">[25]</tspan> = up to 2,500 MSL;</text>
    <text x="175" y="137"><tspan font-weight="700">[-25]</tspan> = up to but not including 2,500 MSL</text>
    <line x1="20" y1="170" x2="160" y2="170" stroke="${MAG}" stroke-width="3" stroke-dasharray="9 6"/>
    <text x="175" y="175"><tspan font-weight="700" fill="${MAG}">Class E surface area</tspan>: dashed magenta. Needs authorization</text>
    <rect x="20" y="198" width="140" height="22" fill="url(#vigM)"/><line x1="20" y1="198" x2="160" y2="198" stroke="${MAG}" stroke-width="1"/>
    <text x="175" y="214"><tspan font-weight="700" fill="${MAG}">Magenta vignette</tspan>: Class E from 700 AGL on the shaded side</text>
    <rect x="20" y="238" width="140" height="22" fill="url(#vigB)"/><line x1="20" y1="238" x2="160" y2="238" stroke="${BLUE}" stroke-width="1"/>
    <text x="175" y="254"><tspan font-weight="700" fill="${BLUE}">Blue vignette</tspan>: Class E from 1,200 AGL on the shaded side</text>
    <circle cx="55" cy="300" r="15" fill="none" stroke="${BLUE}" stroke-width="3"/><line x1="43" y1="308" x2="67" y2="292" stroke="${BLUE}" stroke-width="5"/>
    <circle cx="125" cy="300" r="15" fill="none" stroke="${MAG}" stroke-width="3"/><line x1="113" y1="308" x2="137" y2="292" stroke="${MAG}" stroke-width="5"/>
    <text x="175" y="297"><tspan font-weight="700" fill="${BLUE}">Blue airport</tspan> = has a control tower</text>
    <text x="175" y="315"><tspan font-weight="700" fill="${MAG}">Magenta airport</tspan> = no tower (non-towered)</text>
    <text x="20" y="348" font-size="11" opacity=".75">Numbers on Class B and C are in hundreds of feet MSL. Simplified drawing, not the FAA legend.</text>
  </g>
</svg>`,
  },

  datablock: {
    title: "Reading airport data on a sectional",
    svg: `<svg viewBox="0 0 660 230" role="img" aria-label="Airport data block">
  <g font-family="ui-monospace,Menlo,monospace" font-size="16" fill="${BLUE}">
    <text x="40" y="50" font-weight="700">EXAMPLE (XMP)</text>
    <text x="40" y="78">CT 118.3 ✱ <tspan font-weight="700">Ⓒ</tspan></text>
    <text x="40" y="106">ATIS 125.2</text>
    <text x="40" y="134">380 <tspan>L</tspan> 72 122.95</text>
  </g>
  <g font-size="12" fill="${INK}">
    <line x1="215" y1="45" x2="300" y2="45" stroke="${INK}" opacity=".4"/><text x="305" y="49">Name and identifier</text>
    <line x1="150" y1="73" x2="300" y2="73" stroke="${INK}" opacity=".4"/><text x="305" y="70">CT = tower frequency. ✱ = tower is part time.</text>
    <text x="305" y="86">Ⓒ = this is the CTAF (use when the tower is closed)</text>
    <line x1="150" y1="101" x2="300" y2="104" stroke="${INK}" opacity=".4"/><text x="305" y="108">ATIS: recorded airport info and weather</text>
    <line x1="72" y1="140" x2="72" y2="170" stroke="${INK}" opacity=".4"/><text x="40" y="185">Elevation 380 ft MSL</text>
    <line x1="92" y1="140" x2="140" y2="200" stroke="${INK}" opacity=".4"/><text x="110" y="215">L = runway lights</text>
    <line x1="112" y1="140" x2="250" y2="170" stroke="${INK}" opacity=".4"/><text x="255" y="174">72 = longest runway 7,200 ft</text>
    <line x1="160" y1="140" x2="400" y2="205" stroke="${INK}" opacity=".4"/><text x="405" y="209">122.95 = UNICOM</text>
  </g>
  <text x="40" y="18" font-size="11" fill="${INK}" opacity=".75">Example data block (fictional airport). Blue text = towered; magenta = non-towered.</text>
</svg>`,
  },

  obstacle: {
    title: "Obstacles on a sectional",
    svg: `<svg viewBox="0 0 660 200" role="img" aria-label="Obstacle symbols">
  <g stroke="${BLUE}" stroke-width="2.5" fill="none">
    <path d="M80 140 L100 95 L120 140"/><circle cx="100" cy="132" r="2.5" fill="${BLUE}"/>
    <path d="M300 150 L320 70 L340 150"/><circle cx="320" cy="142" r="2.5" fill="${BLUE}"/>
    <path d="M305 62 l10 6 M335 62 l-10 6 M320 52 v10"/>
  </g>
  <g font-size="14" fill="${BLUE}" font-weight="700" text-anchor="middle">
    <text x="100" y="166">1149</text><text x="320" y="176">2049</text>
  </g>
  <g font-size="13" fill="${BLUE}" text-anchor="middle">
    <text x="100" y="184">(457)</text><text x="320" y="194">(1003) UC</text>
  </g>
  <g font-size="12" fill="${INK}">
    <text x="420" y="80">Bold = top of obstacle in ft MSL</text>
    <text x="420" y="100">(Parentheses) = height in ft AGL</text>
    <text x="420" y="120">Tall symbol = 1,000 ft AGL or more</text>
    <text x="420" y="140">Rays on top = lighted</text>
    <text x="420" y="160">UC = under construction</text>
  </g>
  <text x="20" y="22" font-size="11" fill="${INK}" opacity=".75">Ground under the left tower is about 1149 − 457 = 692 ft MSL.</text>
</svg>`,
  },

  latlon: {
    title: "Latitude and longitude",
    svg: `<svg viewBox="0 0 660 270" role="img" aria-label="Latitude longitude grid">
  <rect x="80" y="30" width="480" height="200" fill="none" stroke="${INK}" opacity=".35"/>
  <line x1="80" y1="130" x2="560" y2="130" stroke="${INK}" opacity=".6"/>
  <line x1="320" y1="30" x2="320" y2="230" stroke="${INK}" opacity=".6"/>
  <g stroke="${INK}" opacity=".6">${Array.from({length:29},(_,i)=>`<line x1="${88+i*16}" y1="126" x2="${88+i*16}" y2="${i%5==4?120:123}"/>`).join("")}${Array.from({length:11},(_,i)=>`<line x1="316" y1="${38+i*16}" x2="${i%5==4?310:313}" y2="${38+i*16}"/>`).join("")}</g>
  <g font-size="12" fill="${INK}">
    <text x="566" y="34">38°00'N</text><text x="566" y="134">37°30'N</text><text x="566" y="234">37°00'N</text>
    <text x="70" y="250" text-anchor="middle">123°00'W</text><text x="320" y="250" text-anchor="middle">122°30'W</text><text x="560" y="250" text-anchor="middle">122°00'W</text>
  </g>
  <g font-size="12" fill="${BLUE}">
    <text x="90" y="22">Latitude: north/south of equator, read on the side; goes UP going north</text>
    <text x="90" y="266">Longitude: east/west of Greenwich; in the US, the number gets BIGGER going LEFT (west)</text>
  </g>
  <circle cx="400" cy="82" r="5" fill="${MAG}"/><text x="410" y="86" font-size="12" fill="${MAG}">≈ 37°45'N, 122°15'W</text>
  <text x="90" y="160" font-size="11" fill="${INK}" opacity=".75">Tick marks = 1 minute. 60 minutes = 1°.</text>
</svg>`,
  },

  metar: {
    title: "Decoding a METAR",
    html: `<div class="metar">
  <div class="metar-line">
    <span class="m1">METAR</span> <span class="m2">KSFO</span> <span class="m3">161753Z</span> <span class="m4">18004KT</span> <span class="m5">1 1/2SM</span> <span class="m6">RA</span> <span class="m7">OVC007</span> <span class="m8">12/M01</span> <span class="m9">A2992</span>
  </div>
  <ul class="metar-key">
    <li><span class="m1">METAR</span> routine report (SPECI = special)</li>
    <li><span class="m2">KSFO</span> station: San Francisco Intl</li>
    <li><span class="m3">161753Z</span> 16th day, 17:53 UTC</li>
    <li><span class="m4">18004KT</span> wind from 180° TRUE at 4 knots</li>
    <li><span class="m5">1 1/2SM</span> visibility 1.5 statute miles (below the 3 SM Part 107 minimum)</li>
    <li><span class="m6">RA</span> rain (−RA light, +RA heavy)</li>
    <li><span class="m7">OVC007</span> overcast at 700 ft AGL (this is the ceiling)</li>
    <li><span class="m8">12/M01</span> temp 12°C, dewpoint −1°C</li>
    <li><span class="m9">A2992</span> altimeter 29.92 inHg</li>
  </ul>
  <p class="small">Example built for practice, not a real observation.</p>
</div>`,
  },

  loadfactor: {
    title: "Load factor vs bank angle",
    svg: `<svg viewBox="0 0 660 280" role="img" aria-label="Load factor chart">
  <line x1="60" y1="240" x2="620" y2="240" stroke="${INK}"/><line x1="60" y1="20" x2="60" y2="240" stroke="${INK}"/>
  ${[0,10,20,30,40,50,60,70,80].map(b=>`<text x="${60+b*7}" y="258" font-size="11" text-anchor="middle" fill="${INK}">${b}°</text>`).join("")}
  ${[1,2,3,4,5].map(g=>`<text x="50" y="${240-(g-1)*50+4}" font-size="11" text-anchor="end" fill="${INK}">${g}G</text><line x1="60" y1="${240-(g-1)*50}" x2="620" y2="${240-(g-1)*50}" stroke="${INK}" opacity=".12"/>`).join("")}
  <polyline fill="none" stroke="${BLUE}" stroke-width="3" points="${Array.from({length:79},(_,b)=>{const g=1/Math.cos(b*Math.PI/180);return g>5.2?"":`${60+b*7},${240-(g-1)*50}`}).join(" ")}"/>
  ${[[30,1.154],[45,1.414],[60,2]].map(([b,g])=>`<circle cx="${60+b*7}" cy="${240-(g-1)*50}" r="5" fill="${MAG}"/><text x="${60+b*7-8}" y="${240-(g-1)*50-10}" font-size="12" text-anchor="end" fill="${MAG}" font-weight="700">${b}° = ${g.toFixed(2)}G</text>`).join("")}
  <text x="340" y="276" font-size="12" text-anchor="middle" fill="${INK}">Bank angle. Load factor = 1 ÷ cos(bank). Stall speed rises with √load factor.</text>
</svg>`,
  },

  pattern: {
    title: "Left traffic pattern for Runway 27",
    svg: `<svg viewBox="0 0 660 300" role="img" aria-label="Traffic pattern">
  <text x="330" y="22" text-anchor="middle" font-size="12" fill="${INK}">North is up. Planes land on Runway 27 heading WEST (270°), into a west wind.</text>
  <rect x="180" y="96" width="300" height="24" fill="#777" opacity=".5"/>
  <text x="192" y="113" font-size="13" font-weight="700" fill="#fff">9</text>
  <text x="452" y="113" font-size="13" font-weight="700" fill="#fff">27</text>
  <g fill="none" stroke="${BLUE}" stroke-width="2.5" marker-end="url(#arr)">
    <path d="M620 108 H500"/><path d="M170 108 H90"/><path d="M80 120 V230"/><path d="M90 240 H560"/><path d="M570 230 V122"/>
  </g>
  <defs><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${BLUE}"/></marker></defs>
  <g font-size="12" fill="${INK}">
    <text x="560" y="96">Final (west)</text><text x="70" y="96">Upwind</text>
    <text x="20" y="180">Crosswind</text><text x="300" y="262" text-anchor="middle">Downwind: flying EAST, south of the runway</text>
    <text x="580" y="180">Base</text>
    <text x="40" y="60" fill="${GRN}">Wind ← from the west</text>
    <text x="330" y="292" text-anchor="middle" opacity=".75">Left traffic = all turns to the left. Pattern altitude is often about 1,000 ft AGL.</text>
  </g>
</svg>`,
  },

  opsover: {
    title: "Operations over people (Subpart D)",
    html: `<table class="tbl">
  <tr><th>Category</th><th>Who qualifies</th><th>Key limits</th></tr>
  <tr><td><b>1</b></td><td>0.55 lb or less, no exposed parts that cut skin</td><td>No declaration needed</td></tr>
  <tr><td><b>2</b></td><td>Injury under 11 ft-lb; FAA-accepted Declaration of Compliance (DOC)</td><td>No lacerating parts, no safety defects</td></tr>
  <tr><td><b>3</b></td><td>Injury under 25 ft-lb; DOC</td><td>Never over open-air assemblies. Over people only at closed/restricted sites with notice, or if participating/under cover</td></tr>
  <tr><td><b>4</b></td><td>FAA airworthiness certificate (Part 21)</td><td>Fly within its operating limitations</td></tr>
</table>
<p class="small">Sustained flight over open-air assemblies (crowds) for categories 1, 2 and 4 requires Remote ID compliance.</p>`,
  },
};

// Chart Lab: practice sectional (fictional) + questions
const CHART_LAB_SVG = `<svg viewBox="0 0 700 460" role="img" aria-label="Practice sectional">
  <defs>
    <radialGradient id="vigR" cx=".5" cy=".5" r=".5"><stop offset=".78" stop-color="${MAG}" stop-opacity="0"/><stop offset=".92" stop-color="${MAG}" stop-opacity=".35"/><stop offset="1" stop-color="${MAG}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="700" height="460" fill="#f4f1e6"/>
  <path d="M0 360 Q200 330 350 380 T700 350 V460 H0Z" fill="#d6e8d0"/>
  <!-- Class C airport -->
  <circle cx="200" cy="170" r="130" fill="none" stroke="${MAG}" stroke-width="3"/>
  <circle cx="200" cy="170" r="60" fill="none" stroke="${MAG}" stroke-width="3"/>
  <text x="200" y="65" text-anchor="middle" font-size="15" font-weight="700" fill="${MAG}">40/12</text>
  <text x="235" y="138" text-anchor="middle" font-size="15" font-weight="700" fill="${MAG}">40/SFC</text>
  <circle cx="200" cy="170" r="12" fill="none" stroke="${BLUE}" stroke-width="3"/><line x1="190" y1="177" x2="210" y2="163" stroke="${BLUE}" stroke-width="5"/>
  <text x="150" y="200" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">CENTRAL (CXA)</text>
  <text x="150" y="214" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">CT 119.2 Ⓒ</text>
  <text x="150" y="228" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">215 L 110 122.95</text>
  <!-- Class D airport -->
  <circle cx="520" cy="120" r="55" fill="none" stroke="${BLUE}" stroke-width="2.5" stroke-dasharray="9 6"/>
  <rect x="555" y="58" width="44" height="20" fill="#f4f1e6" stroke="${BLUE}"/><text x="577" y="73" text-anchor="middle" font-size="13" fill="${BLUE}">-25</text>
  <circle cx="520" cy="120" r="11" fill="none" stroke="${BLUE}" stroke-width="3"/><line x1="511" y1="126" x2="529" y2="114" stroke="${BLUE}" stroke-width="5"/>
  <text x="470" y="195" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">RIVERTON (RVT)</text>
  <text x="470" y="209" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">CT 118.6 ✱ Ⓒ</text>
  <text x="470" y="223" font-size="12" fill="${BLUE}" font-family="ui-monospace,monospace">62 L 45 122.95</text>
  <!-- Non-towered with E surface -->
  <circle cx="520" cy="320" r="40" fill="none" stroke="${MAG}" stroke-width="2.5" stroke-dasharray="9 6"/>
  <circle cx="520" cy="320" r="10" fill="none" stroke="${MAG}" stroke-width="3"/><line x1="512" y1="326" x2="528" y2="314" stroke="${MAG}" stroke-width="4"/>
  <text x="565" y="315" font-size="12" fill="${MAG}" font-family="ui-monospace,monospace">LAKEVIEW (LKV)</text>
  <text x="565" y="329" font-size="12" fill="${MAG}" font-family="ui-monospace,monospace">640 L 38 122.8 Ⓒ</text>
  <circle cx="520" cy="320" r="110" fill="url(#vigR)"/>
  <!-- Obstacle -->
  <g stroke="${BLUE}" stroke-width="2.5" fill="none"><path d="M360 300 L375 255 L390 300"/><path d="M362 250 l8 5 M388 250 l-8 5 M375 242 v8"/></g>
  <text x="375" y="318" text-anchor="middle" font-size="13" font-weight="700" fill="${BLUE}">1890</text>
  <text x="375" y="334" text-anchor="middle" font-size="12" fill="${BLUE}">(1210)</text>
  <!-- MOA -->
  <path d="M20 300 L120 300 L120 450 L20 450 Z" fill="none" stroke="${MAG}" stroke-width="5" opacity=".35"/>
  <text x="70" y="380" text-anchor="middle" font-size="12" font-weight="700" fill="${MAG}">EAGLE</text><text x="70" y="395" text-anchor="middle" font-size="12" font-weight="700" fill="${MAG}">MOA</text>
  <!-- Points -->
  ${[[200,150,"1"],[290,170,"2"],[520,95,"3"],[520,300,"4"],[640,420,"5"],[345,90,"6"]].map(([x,y,n])=>`<circle cx="${x}" cy="${y}" r="11" fill="#111"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${n}</text>`).join("")}
  <text x="10" y="18" font-size="11" fill="#333">PRACTICE MAP. Fictional and simplified; not for navigation.</text>
</svg>`;

const CHART_LAB_QS = [
  { q: "Point 1 is inside the inner ring of Central (CXA). What airspace is it, and do you need authorization at 200 ft AGL?", a: "Class C (solid magenta), surface to 4,000 ft MSL (40/SFC). Yes, ATC authorization (LAANC or DroneZone) is required." },
  { q: "Point 2 is in Central's outer ring (40/12). You fly at 300 ft AGL where the ground is 400 ft MSL. Which airspace are you in?", a: "You are at 400 + 300 = 700 ft MSL. The Class C shelf starts at 1,200 ft MSL, so you are BELOW the shelf, not in Class C. (On this map nothing else is charted there, so it's Class G.) Trick: the outer ring's floor is in MSL, so subtract ground elevation." },
  { q: "Point 3 is at Riverton (RVT). What airspace, and what does [-25] mean?", a: "Class D (dashed blue). Up to but not including 2,500 ft MSL. Authorization required." },
  { q: "Riverton's tower is closed (it has a ✱). What frequency should you monitor?", a: "118.6, the frequency marked with the Ⓒ (CTAF)." },
  { q: "Point 4 is at Lakeview (LKV), a magenta airport with a dashed magenta circle. Towered? Airspace? Authorization?", a: "Non-towered (magenta). Class E surface area (dashed magenta). Authorization IS required." },
  { q: "What is Lakeview's CTAF and field elevation?", a: "CTAF 122.8 (Ⓒ). Elevation 640 ft MSL. Longest runway 3,800 ft." },
  { q: "Point 5 is just outside the magenta vignette around Lakeview. At 300 ft AGL, what airspace are you in?", a: "Class G. Inside the shaded magenta vignette, Class E starts at 700 ft AGL; outside it with nothing else charted, Class E starts at 14,500 ft MSL. Either way 300 ft AGL is Class G. No authorization needed." },
  { q: "The obstacle near the middle shows 1890 and (1210). What do they mean, and what's the ground elevation?", a: "Top is 1,890 ft MSL; it's 1,210 ft AGL (tall symbol, lighted). Ground ≈ 1,890 − 1,210 = 680 ft MSL." },
  { q: "Eagle MOA: can you fly a drone there without permission?", a: "A MOA is not prohibited, but military training happens there. Check if it's active and use extreme caution." },
  { q: "Point 6 is outside every drawn line and vignette. At 350 ft AGL, which class?", a: "Class G (Class E starts at 14,500 ft MSL where nothing else is charted). No authorization needed." },
  { q: "Central's data block reads 215 L 110 122.95. Decode it.", a: "Elevation 215 ft MSL, runway lighting, longest runway 11,000 ft, UNICOM 122.95." },
];
