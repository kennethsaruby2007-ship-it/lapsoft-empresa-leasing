document.addEventListener("DOMContentLoaded", function () {
  const money = n => new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);

  document.querySelectorAll(".filtro").forEach(function(filtro){
    filtro.addEventListener("click",function(){
      document.querySelectorAll(".filtro").forEach(x=>x.classList.remove("activo-filtro"));
      filtro.classList.add("activo-filtro");
      const categoria=filtro.dataset.filtro;
      document.querySelectorAll(".equipo").forEach(function(e){
        e.style.display=(categoria==="todos"||e.dataset.categoria===categoria)?"block":"none";
      });
    });
  });

  document.querySelectorAll(".seleccionar").forEach(function(boton){
    boton.addEventListener("click",function(){
      localStorage.setItem("equipoSeleccionado",boton.dataset.equipo);
      window.location.href="contacto.html";
    });
  });

  document.querySelectorAll(".faq-item button").forEach(function(pregunta){
    pregunta.addEventListener("click",function(){
      const item=pregunta.parentElement;
      item.classList.toggle("abierto");
      pregunta.querySelector("span").textContent=item.classList.contains("abierto")?"−":"+";
    });
  });

  const elegido=localStorage.getItem("equipoSeleccionado");
  const inputEquipo=document.querySelector("#equipoInteres");
  if(elegido && inputEquipo){inputEquipo.value=elegido;localStorage.removeItem("equipoSeleccionado");}

  document.querySelectorAll("#formContacto,#formSoporte").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      const solicitudes=JSON.parse(localStorage.getItem("lapsoftSolicitudes")||"[]");
      solicitudes.push({fecha:new Date().toLocaleString("es-CO"),tipo:form.id==="formSoporte"?"Soporte":"Comercial",datos:Object.fromEntries(new FormData(form))});
      localStorage.setItem("lapsoftSolicitudes",JSON.stringify(solicitudes));
      alert("Solicitud registrada en la demostración de LAPSOFT.");
      form.reset();
    });
  });

  const simEquipo=document.querySelector("#simEquipo"), simMeses=document.querySelector("#simMeses"), simResultado=document.querySelector("#simResultado");
  function actualizarSim(){
    if(!simEquipo||!simMeses||!simResultado)return;
    const base=Number(simEquipo.value), meses=Number(simMeses.value);
    const descuento={1:1,3:.94,6:.88,12:.82}[meses];
    const canon=Math.round(base*descuento/1000)*1000;
    simResultado.textContent=money(canon)+" / mes";
  }
  if(simEquipo){simEquipo.addEventListener("change",actualizarSim);simMeses.addEventListener("change",actualizarSim);actualizarSim();}

  const login=document.querySelector("#formLogin");
  if(login){
    login.addEventListener("submit",function(e){
      e.preventDefault();
      if(document.querySelector("#usuario").value==="admin" && document.querySelector("#clave").value==="lapsoft2026"){
        window.location.href="admin.html";
      }else{alert("Usuario o contraseña incorrectos.");}
    });
  }

  const tabla=document.querySelector("#tablaInventario");
  if(tabla){
    const equipos=[
      ["LAP-001","Lenovo IdeaPad Slim 3","Disponible",1899070,210000],
      ["LAP-002","Lenovo IdeaPad Slim 3","Alquilado",1899070,210000],
      ["LAP-003","Acer Aspire 15.6","Disponible",2349030,255000],
      ["LAP-004","HP 15 Core i5","Alquilado",2509900,270000],
      ["LAP-005","HP ProBook 14","Mantenimiento",5139070,480000],
      ["LAP-006","HP Omen 16","Disponible",10299070,850000]
    ];
    tabla.innerHTML=equipos.map(e=>`<tr><td>${e[0]}</td><td>${e[1]}</td><td class="estado ${e[2].toLowerCase()}">${e[2]}</td><td>${money(e[3])}</td><td>${money(e[4])}</td></tr>`).join("");
    const inventario=equipos.reduce((a,e)=>a+e[3],0);
    const ingreso=equipos.filter(e=>e[2]==="Alquilado").reduce((a,e)=>a+e[4],0);
    const gastosBase=300000;
    let movimientos=JSON.parse(localStorage.getItem("lapsoftMovimientos")||"[]");
    const extrasI=movimientos.filter(m=>m.tipo==="ingreso").reduce((a,m)=>a+Number(m.valor),0);
    const extrasG=movimientos.filter(m=>m.tipo==="gasto").reduce((a,m)=>a+Number(m.valor),0);
    const ingresos=ingreso+extrasI, gastos=gastosBase+extrasG, utilidad=ingresos-gastos;
    document.querySelector("#kpiInventario").textContent=money(inventario);
    document.querySelector("#kpiIngresos").textContent=money(ingresos);
    document.querySelector("#kpiGastos").textContent=money(gastos);
    document.querySelector("#kpiUtilidad").textContent=money(utilidad);
    document.querySelector("#resIngreso").textContent=money(ingresos);
    document.querySelector("#resMant").textContent=money(gastosBase);
    document.querySelector("#resAdmin").textContent=money(extrasG);
    document.querySelector("#resUtilidad").textContent=money(utilidad);

    const movBox=document.querySelector("#movimientos");
    movBox.innerHTML=movimientos.length?movimientos.map(m=>`<div class="movimiento"><span>${m.concepto}</span><b class="${m.tipo}">${m.tipo==="ingreso"?"+":"−"} ${money(Number(m.valor))}</b></div>`).join(""):"<p class='nota'>No hay movimientos adicionales registrados.</p>";

    document.querySelector("#formMovimiento").addEventListener("submit",function(e){
      e.preventDefault();
      const data=Object.fromEntries(new FormData(e.target));
      movimientos.push({tipo:data.tipo,concepto:data.concepto,valor:Number(data.valor)});
      localStorage.setItem("lapsoftMovimientos",JSON.stringify(movimientos));
      location.reload();
    });
    document.querySelector("#btnReset").addEventListener("click",function(){
      localStorage.removeItem("lapsoftMovimientos");localStorage.removeItem("lapsoftSolicitudes");location.reload();
    });
  }
});