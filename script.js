const clases = {
  A: { inicio: "0.0.0.0", fin: "127.255.255.255", min: 0, max: 127 },
  B: { inicio: "128.0.0.0", fin: "191.255.255.255", min: 128, max: 191 },
  C: { inicio: "192.0.0.0", fin: "223.255.255.255", min: 192, max: 223 }
};

const octetos = ["o1", "o2", "o3", "o4"].map(id => document.getElementById(id));
const cantidad = document.getElementById("cantidad");
const validarBtn = document.getElementById("validar");
const generarBtn = document.getElementById("generar");
const borrarBtn = document.getElementById("borrar");

let claseSeleccionada = null;
let ipValidada = false;

document.querySelectorAll("input[name='clase']").forEach(radio => {
  radio.addEventListener("change", () => seleccionarClase(radio.value));
});

octetos.forEach((input, index) => {
  permitirSoloNumeros(input);

  input.addEventListener("input", () => {
    if (Number(input.value) > 255) input.value = "255";

    if (input.value.length === 3 && index < octetos.length - 1) {
      octetos[index + 1].focus();
    }
  });
});

permitirSoloNumeros(cantidad);

validarBtn.addEventListener("click", validarIP);
generarBtn.addEventListener("click", generarSubredes);
borrarBtn.addEventListener("click", limpiarTodo);

document.getElementById("salir").addEventListener("click", () => {
  alert("Gracias por usar el sistema");
});

function seleccionarClase(clase) {
  claseSeleccionada = clase;
  ipValidada = false;

  document.getElementById("rangoInicial").value = clases[clase].inicio;
  document.getElementById("rangoFinal").value = clases[clase].fin;

  octetos.forEach(input => {
    input.disabled = false;
    input.value = "";
  });

  cantidad.value = "";
  cantidad.disabled = true;
  validarBtn.disabled = false;
  generarBtn.disabled = true;
  borrarBtn.disabled = false;
  limpiarListas();

  octetos[0].focus();
}

function permitirSoloNumeros(input) {
  input.addEventListener("keydown", e => {
    const teclasPermitidas = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (teclasPermitidas.includes(e.key)) return;

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      alert("Solo se puede ingresar números");
    }
  });

  input.addEventListener("paste", e => {
    const texto = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^[0-9]+$/.test(texto)) {
      e.preventDefault();
      alert("Solo se puede pegar números");
    }
  });
}

function validarIP() {
  if (!claseSeleccionada) {
    alert("Primero seleccione una clase de IP");
    return;
  }

  const nums = [];

  for (let i = 0; i < octetos.length; i++) {
    const valor = octetos[i].value.trim();

    if (valor === "") {
      alert(`El octeto ${i + 1} está vacío`);
      octetos[i].focus();
      return;
    }

    const numero = Number(valor);

    if (numero < 0 || numero > 255) {
      alert(`El octeto ${i + 1} está fuera de rango`);
      octetos[i].value = "";
      octetos[i].focus();
      return;
    }

    nums.push(numero);
  }

  const clase = clases[claseSeleccionada];

  if (nums[0] < clase.min || nums[0] > clase.max) {
    alert(`La IP no pertenece a Clase ${claseSeleccionada}. Debe iniciar entre ${clase.min} y ${clase.max}`);
    octetos[0].value = "";
    octetos[0].focus();
    return;
  }

  alert("SU DIRECCIÓN IP ES VÁLIDA");

  ipValidada = true;
  octetos.forEach(input => input.disabled = true);
  document.querySelectorAll("input[name='clase']").forEach(radio => radio.disabled = true);
  cantidad.disabled = false;
  validarBtn.disabled = true;
  generarBtn.disabled = false;
  borrarBtn.disabled = false;
  
  cantidad.focus();
}

function generarSubredes() {
  if (!ipValidada) {
    alert("Primero debe validar la IP");
    return;
  }

  const numSub = Number(cantidad.value);

  if (!cantidad.value || numSub <= 0) {
    alert("Debe indicar la cantidad de subredes");
    cantidad.focus();
    return;
  }

  limpiarListas();

  let [a1, a2, a3, a4] = octetos.map(input => Number(input.value));

  let pot = 0;
  while ((Math.pow(2, pot) - 2) < numSub) {
    pot++;
  }

  let bitsHost = 8 - pot;
  let salto = 0;

  while (bitsHost <= 7) {
    salto += Math.pow(2, bitsHost);
    bitsHost++;
  }

  const tamBloque = 256 - salto;
  const mascara = `255.255.255.${salto}`;

  for (let c = 1; c <= numSub; c++) {
    if (a2 > 255) {
      a2 = 0;
      a1++;
    }

    if (a3 > 255) {
      a3 = 0;
      a2++;
    }

    if (a4 + tamBloque > 255) {
      a4 = 0;
      a3++;
    }

    agregarLinea("listaRed", c);
    agregarLinea("listaDireccion", `${a1}.${a2}.${a3}.${a4}`);
    agregarLinea("listaPrimera", `${a1}.${a2}.${a3}.${a4 + 1}`);
    agregarLinea("listaUltima", `${a1}.${a2}.${a3}.${a4 + tamBloque - 2}`);
    agregarLinea("listaBroadcast", `${a1}.${a2}.${a3}.${a4 + tamBloque - 1}`);
    agregarLinea("listaMascara", mascara);
    agregarLinea("listaSalto", tamBloque);
    agregarLinea("listaPuerta", `${a1}.${a2}.${a3}.${a4 + 1}`);

    a4 += tamBloque;
  }

  alert("Proceso terminado con éxito");

  generarBtn.disabled = true;
  cantidad.disabled = true;
}

function agregarLinea(id, texto) {
  const area = document.getElementById(id);
  area.value += texto + "\n";
}

function limpiarListas() {
  [
    "listaRed", "listaDireccion", "listaPrimera", "listaUltima",
    "listaBroadcast", "listaMascara", "listaSalto", "listaPuerta"
  ].forEach(id => document.getElementById(id).value = "");
}

function limpiarTodo() {
  claseSeleccionada = null;
  ipValidada = false;

  document.querySelectorAll("input[name='clase']").forEach(radio => {
    radio.checked = false;
    radio.disabled = false;
  });

  document.getElementById("rangoInicial").value = "";
  document.getElementById("rangoFinal").value = "";

  octetos.forEach(input => {
    input.value = "";
    input.disabled = true;
  });

  cantidad.value = "";
  cantidad.disabled = true;

  validarBtn.disabled = true;
  generarBtn.disabled = true;
  borrarBtn.disabled = true;

  limpiarListas();
}
