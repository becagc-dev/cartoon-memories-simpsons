// @ts-nocheck
// CARTOON MEMORIES — consumo da API e criação dinâmica dos cards (Português-BR)
const API_URL = "https://apisimpsons.fly.dev/api/personajes?limit=1000";
const characterGrid = document.querySelector("#characterGrid");
const statusMessage = document.querySelector("#statusMessage");
const searchInput = document.querySelector("#searchInput");
const resultCount = document.querySelector("#resultCount");
const reloadButton = document.querySelector("#reloadButton");
const loadMoreButton = document.querySelector("#loadMoreButton");

let allCharacters = [];
let visibleLimit = 12;

function getCharacterList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.docs)) return data.docs;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.personajes)) return data.personajes;
  return [];
}

function getField(character, possibleNames) {
  for (const name of possibleNames) {
    if (character[name] !== undefined && character[name] !== null && character[name] !== "") {
      return character[name];
    }
  }
  return "";
}

// Traduz os status vindos em espanhol da API para Português-BR
function translateStatus(rawStatus) {
  if (!rawStatus) return "Personagem da série";
  const normalized = String(rawStatus).trim().toLowerCase();

  const statusMap = {
    "vivo": "Vivo(a)",
    "alive": "Vivo(a)",
    "fallecido": "Falecido(a)",
    "muerto": "Falecido(a)",
    "dead": "Falecido(a)",
    "desconocido": "Desconhecido",
    "unknown": "Desconhecido",
    "ficticio": "Fictício",
    "masculino": "Masculino",
    "femenino": "Feminino"
  };

  return statusMap[normalized] || rawStatus;
}

// Traduz e formata as descrições/ocupações para o Português-BR
function formatDescription(character) {
  let occupation = getField(character, ["Ocupacion", "ocupacion", "occupation"]);
  const gender = getField(character, ["Genero", "genero", "gender"]);
  const history = getField(character, ["Historia", "historia", "description"]);

  const translatedGender =
    gender.toLowerCase() === "masculino" ? "Masculino" :
    gender.toLowerCase() === "femenino" ? "Feminino" :
    gender ? "Não informado" : "";

  const occupationTranslations = {
    "empresario ceo y presidente de powell motor company": "Empresário, CEO e presidente da Powell Motor Company",
    "ayudante de charles montgomery burns": "Assistente de Charles Montgomery Burns",
    "ama de casa": "Do lar",
    "estudiante": "Estudante",
    "estudiante de la escuela primaria de springfield": "Estudante da Escola Primária de Springfield",
    "dependiente de la tienda de historietas": "Atendente da loja de quadrinhos",
    "cervecero": "Cervejeiro",
    "director": "Diretor",
    "profesor": "Professor",
    "conductor de autobús": "Motorista de ônibus"
  };

  if (occupation) {
    const cleanOcc = occupation.trim().toLowerCase();
    occupation = occupationTranslations[cleanOcc] || occupation;
    return `Ocupação: ${occupation}${translatedGender ? ` • Gênero: ${translatedGender}` : ""}`;
  }

  if (history && history.trim() && history.toLowerCase() !== "desconocido") {
    return String(history).slice(0, 115);
  }

  if (translatedGender) {
    return `Personagem do universo de Os Simpsons • Gênero: ${translatedGender}`;
  }

  return "Personagem clássico do universo de Os Simpsons.";
}

function createCharacterCard(character) {
  const name = getField(character, ["Nombre", "nombre", "name", "Name"]) || "Personagem sem nome";
  const image = getField(character, ["Imagen", "imagen", "image", "Image", "img"]);
  const rawStatus = getField(character, ["Estado", "estado", "status"]);

  const statusPtBr = translateStatus(rawStatus);
  const descriptionPtBr = formatDescription(character);

  const article = document.createElement("article");
  article.className = "character-card";

  const imageWrap = document.createElement("div");
  imageWrap.className = "character-image-wrap";

  if (typeof image === "string" && image.trim()) {
    const img = document.createElement("img");
    img.className = "character-image";
    img.src = image;
    img.alt = `Imagem de ${name}`;
    img.loading = "lazy";
    img.onerror = () => {
      img.remove();
      const placeholder = document.createElement("span");
      placeholder.className = "character-placeholder";
      placeholder.textContent = "★";
      imageWrap.appendChild(placeholder);
    };
    imageWrap.appendChild(img);
  } else {
    const placeholder = document.createElement("span");
    placeholder.className = "character-placeholder";
    placeholder.textContent = "★";
    imageWrap.appendChild(placeholder);
  }

  const info = document.createElement("div");
  info.className = "character-info";

  const title = document.createElement("h3");
  title.textContent = name;

  const detail = document.createElement("p");
  detail.textContent = descriptionPtBr.slice(0, 115);

  const tag = document.createElement("span");
  tag.className = "character-tag";
  tag.textContent = `Status: ${statusPtBr}`.slice(0, 35);

  info.append(title, detail, tag);
  article.append(imageWrap, info);
  return article;
}

function renderCharacters(characters) {
  characterGrid.replaceChildren();
  const visibleCharacters = characters.slice(0, visibleLimit);

  visibleCharacters.forEach((character) => {
    const card = createCharacterCard(character);
    characterGrid.appendChild(card);
  });

  resultCount.textContent = `${characters.length} personagem(ns) encontrado(s)`;
  loadMoreButton.hidden = characters.length <= visibleLimit;
  statusMessage.textContent = characters.length
    ? ""
    : "Nenhum personagem encontrado. Tente outra busca.";
}

async function loadCharacters() {
  statusMessage.textContent = "Carregando personagens da API...";
  characterGrid.replaceChildren();
  resultCount.textContent = "Buscando dados...";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    allCharacters = getCharacterList(data);

    if (!allCharacters.length) {
      throw new Error("A API respondeu, mas não foi encontrada uma lista de personagens.");
    }

    visibleLimit = 12;
    renderCharacters(allCharacters);
  } catch (error) {
    console.error("Não foi possível carregar os personagens:", error);
    resultCount.textContent = "Falha ao carregar";
    statusMessage.textContent = "Não foi possível carregar os personagens agora. Verifique sua conexão e tente novamente.";
  }
}

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const filtered = allCharacters.filter((character) => {
    const name = getField(character, ["Nombre", "nombre", "name", "Name"]);
    return String(name).toLocaleLowerCase("pt-BR").includes(searchTerm);
  });
  visibleLimit = 12;
  renderCharacters(filtered);
});

reloadButton.addEventListener("click", loadCharacters);

loadMoreButton.addEventListener("click", () => {
  visibleLimit += 12;
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("pt-BR");
  const filtered = allCharacters.filter((character) => {
    const name = getField(character, ["Nombre", "nombre", "name", "Name"]);
    return String(name).toLocaleLowerCase("pt-BR").includes(searchTerm);
  });
  renderCharacters(filtered);
});

loadCharacters();
