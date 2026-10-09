document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("jugadorActual");
  if (localStorage.getItem("sesionActiva") !== "true" || !user) { location.href = "Login.html"; return; }
  const missions = [
    {planet:"PLANETA 1 · MERCURIO", title:"El salto de impulso", description:"Un módulo de 3 kg debe alcanzar 4 m/s para despegar de la superficie. Calculá el impulso necesario.", formula:"Impulso = masa × cambio de velocidad", question:"¿Qué impulso necesita el módulo?", choices:["7 N·s","12 N·s","1 N·s","24 N·s"], answer:1, fact:"I = 3 kg × 4 m/s = 12 N·s. ¡Despegue exitoso!", scene:"launch"},
    {planet:"PLANETA 2 · VENUS", title:"Gravedad entre nubes", description:"La cápsula lleva un instrumento de 10 kg. En este planeta la gravedad es 8,9 m/s². Encontrá su peso.", formula:"Peso = masa × gravedad", question:"¿Cuánto pesa el instrumento aproximadamente?", choices:["8,9 N","89 N","0,89 N","890 N"], answer:1, fact:"P = 10 kg × 8,9 m/s² = 89 N. ¡Cápsula estable!", scene:"gravity"},
    {planet:"PLANETA 3 · TIERRA", title:"Zona de asteroides", description:"La nave avanza a velocidad constante. Apagás los motores: en el espacio, sin rozamiento, ¿qué ocurre?", formula:"Primera ley de Newton · inercia", question:"¿Cómo sigue moviéndose la nave?", choices:["Se detiene de inmediato","Sigue recta a velocidad constante","Gira hacia el planeta más cercano","Acelera sola"], answer:1, fact:"Por inercia conserva su velocidad y dirección hasta que una fuerza la cambie.", scene:"inertia"},
    {planet:"PLANETA 4 · MARTE", title:"Aterrizaje en el cráter", description:"El rover debe cruzar un cráter. Si lanza una sonda en diagonal, la gravedad curva su recorrido.", formula:"Movimiento horizontal + caída vertical", question:"¿Qué trayectoria sigue un proyectil ideal?", choices:["Una línea recta","Una parábola","Un círculo perfecto","Se queda suspendido"], answer:1, fact:"La sonda dibuja una parábola: avanza mientras la gravedad la hace caer.", scene:"projectile"},
    {planet:"PLANETA 5 · JÚPITER", title:"Órbita de rescate", description:"Una sonda pasa junto al gigante gaseoso. La gravedad puede cambiar su velocidad y dirección.", formula:"Gravedad = fuerza de atracción entre masas", question:"¿Qué hace posible que una luna permanezca en órbita?", choices:["La gravedad la atrae mientras su velocidad la hace avanzar","No actúa ninguna fuerza","El viento la empuja hacia afuera","La luna está quieta"], answer:0, fact:"La atracción gravitatoria curva el avance de la luna y mantiene su órbita.", scene:"orbit"},
    {planet:"PLANETA 6 · SATURNO", title:"Energía para el hogar", description:"La última maniobra usa un motor para elevar una cápsula. ¿En qué se transforma principalmente la energía del combustible?", formula:"La energía se transforma y se conserva", question:"¿Qué transformación inicia el ascenso?", choices:["Energía química → térmica → movimiento","Movimiento → masa","Gravedad → electricidad sin motor","Luz → sonido"], answer:0, fact:"El combustible aporta energía química que el motor transforma en calor y movimiento. ¡Misión cumplida!", scene:"rings"}
  ];
  const level = Math.max(1, Math.min(6, Number(new URLSearchParams(location.search).get("nivel")) || 1));
  const m = missions[level - 1], state = JuegoDB.progress(user);
  if (level > state.nivel && !state.completados.includes(level)) { location.href = "Niveles.html"; return; }
  document.getElementById("jugador").textContent = user;
  document.getElementById("estado").textContent = `PLANETA ${level} / 6 · ${state.puntuacion} PUNTOS`;
  document.getElementById("planeta").textContent = m.planet; document.getElementById("titulo").textContent = m.title;
  document.getElementById("descripcion").textContent = m.description; document.getElementById("formula").textContent = m.formula;
  document.getElementById("pregunta").textContent = m.question;
  const answers = document.getElementById("respuestas"), msg = document.getElementById("mensaje"), next = document.getElementById("siguiente");
  let solved = state.completados.includes(level);
  function finish() {
    if (!solved) JuegoDB.complete(user, level, 100);
    solved = true; msg.textContent = `✅ ${m.fact} +100 puntos`;
    [...answers.children].forEach((b,i) => { b.disabled = true; if (i === m.answer) b.classList.add("correcta"); });
    next.hidden = false; next.textContent = level === 6 ? "VER FINAL DE MISIÓN →" : "CONTINUAR AL PRÓXIMO PLANETA →";
  }
  m.choices.forEach((choice, index) => { const b = document.createElement("button"); b.className = "respuesta"; b.textContent = choice; b.addEventListener("click", () => {
    if (solved) return;
    if (index === m.answer) finish(); else { b.classList.add("incorrecta"); b.disabled = true; msg.textContent = "Todavía no: revisá la pista de física y probá otra respuesta."; }
  }); answers.appendChild(b); });
  if (solved) finish();
  next.addEventListener("click", () => { if (level < 6) location.href = `Juego.html?nivel=${level + 1}`; else location.href = "Final.html"; });
  animate(m.scene);
});
function animate(scene) {
  const c = document.getElementById("escena"), ctx = c.getContext("2d"); let t = 0;
  function draw() {
    const w = c.clientWidth, h = c.clientHeight, d = window.devicePixelRatio || 1;
    if (c.width !== w*d || c.height !== h*d) { c.width=w*d; c.height=h*d; }
    ctx.setTransform(d,0,0,d,0,0); ctx.clearRect(0,0,w,h); ctx.fillStyle="#d9f3ff";
    for(let i=0;i<28;i++){let x=(i*83+19)%w,y=(i*47+9)%(h-24);ctx.globalAlpha=.3+(i%4)*.15;ctx.fillRect(x,y,2,2)}ctx.globalAlpha=1;
    const x=(t*1.3)%(w-48)+15, y=h-35;
    if(scene==="orbit"||scene==="rings") {let cx=w/2,cy=h/2;ctx.strokeStyle="#547899";ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,cy,Math.min(w*.35,105),48,-.15,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#efbb65";ctx.beginPath();ctx.arc(cx,cy,25,0,7);ctx.fill();ctx.fillStyle="#e5eeff";ctx.beginPath();ctx.arc(cx+Math.cos(t/30)*Math.min(w*.35,105),cy+Math.sin(t/30)*48,7,0,7);ctx.fill();if(scene==="rings"){ctx.strokeStyle="#d1a779";ctx.beginPath();ctx.ellipse(cx,cy,49,12,.1,0,7);ctx.stroke()}}
    else if(scene==="gravity"){ctx.fillStyle="#72513a";ctx.beginPath();ctx.ellipse(w/2,h-10,w*.45,17,0,Math.PI,7);ctx.fill();ctx.fillStyle="#6fe2ff";ctx.beginPath();ctx.arc(w/2,25+((t%110)/2),8,0,7);ctx.fill();ctx.strokeStyle="#c1ecff";ctx.beginPath();ctx.moveTo(w/2-17,42);ctx.lineTo(w/2-8,32);ctx.moveTo(w/2+17,42);ctx.lineTo(w/2+8,32);ctx.stroke()}
    else if(scene==="projectile"){ctx.fillStyle="#b8865d";ctx.fillRect(0,h-20,w,20);ctx.fillStyle="#ffe18a";ctx.beginPath();ctx.arc(24,h-27,6,0,7);ctx.fill();ctx.strokeStyle="#73eaff";ctx.beginPath();for(let i=0;i<55;i++){let px=24+i*(w-60)/55,py=h-27-Math.sin(i/55*Math.PI)*h*.52;if(!i)ctx.moveTo(px,py);else ctx.lineTo(px,py)}ctx.stroke();ctx.fillStyle="#c5fbff";let p=(t%100)/100;ctx.beginPath();ctx.arc(24+p*(w-60),h-27-Math.sin(p*Math.PI)*h*.52,5,0,7);ctx.fill()}
    else {ctx.fillStyle=scene==="launch"?"#ffcf7a":scene==="inertia"?"#a9ecff":"#eb8069";if(scene==="launch"){ctx.save();ctx.translate(x,y);ctx.rotate(-.2);ctx.fillRect(-14,-9,29,18);ctx.fillStyle="#79e9ff";ctx.beginPath();ctx.moveTo(-14,-7);ctx.lineTo(-25,0);ctx.lineTo(-14,7);ctx.fill();ctx.restore();ctx.fillStyle="#ff8b52";ctx.beginPath();ctx.moveTo(x-13,y+2);ctx.lineTo(x-23,y);ctx.lineTo(x-13,y-2);ctx.fill()}else{ctx.beginPath();ctx.arc(x,h/2,scene==="inertia"?11:15,0,7);ctx.fill();if(scene==="inertia"){ctx.strokeStyle="#a9ecff";ctx.beginPath();ctx.moveTo(10,h/2+22);ctx.lineTo(w-10,h/2+22);ctx.stroke()}}}
    t++;requestAnimationFrame(draw);
  }requestAnimationFrame(draw);
}
