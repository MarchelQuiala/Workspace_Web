// ==================== ARMAZENAMENTO GLOBAL ====================
let ocorrencias = JSON.parse(localStorage.getItem('ocorrencias')) || [];

function salvarOcorrenciasLocalStorage() {
    localStorage.setItem('ocorrencias', JSON.stringify(ocorrencias));
}

// ==================== MODAL DE REPORTE ====================
function toggleModal(open) {
    const modal = document.getElementById('modalFormulario');
    if (!modal) return;
    if (open) {
        modal.classList.add('active');
        const geoStatus = document.getElementById('geoStatus');
        if (geoStatus) geoStatus.innerHTML = "Status: Aguardando coordenadas geográficas...";
        const mapLink = document.getElementById('googleMapsLink');
        if (mapLink) mapLink.value = '';
    } else {
        modal.classList.remove('active');
        const form = document.getElementById('formReporte');
        if (form) form.reset();
    }
}

function abrirReporte() {
    toggleModal(true);
}

// ==================== GEOLOCALIZAÇÃO ====================
function buildMapLink(latitude, longitude) {
    return `https://www.google.com/maps?q=${encodeURIComponent(latitude + ',' + longitude)}`;
}

// GPS Telemóvel
document.getElementById('btnCapturarGPS')?.addEventListener('click', () => {
    const geoStatus = document.getElementById('geoStatus');
    if (!geoStatus) return;
    geoStatus.innerHTML = "A solicitar autorização de GPS...";
    
    if (!navigator.geolocation) {
        geoStatus.innerHTML = "<span style='color:red;'>O seu navegador não suporta geolocalização.</span>";
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const latitude = pos.coords.latitude.toFixed(6);
            const longitude = pos.coords.longitude.toFixed(6);
            geoStatus.innerHTML = "Coordenadas obtidas! Convertendo endereço...";
            
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=18`;
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            
            if (res.ok) {
                const data = await res.json();
                if (data && data.address) {
                    const localidade = data.address.neighbourhood || data.address.suburb || data.address.road || '';
                    const bairroInput = document.getElementById('bairro');
                    if (bairroInput) bairroInput.value = localidade;
                    
                    const cidadeInfo = JSON.stringify(data.address).toLowerCase();
                    const selectMunicipio = document.getElementById('municipio');
                    if (cidadeInfo.includes('cazenga')) selectMunicipio.value = 'Cazenga';
                    else if (cidadeInfo.includes('viana')) selectMunicipio.value = 'Viana';
                    else if (cidadeInfo.includes('catete') || cidadeInfo.includes('icolo')) selectMunicipio.value = 'Catete';
                    else if (cidadeInfo.includes('bom jesus')) selectMunicipio.value = 'Bom Jesus';
                }
            }
            const mapLink = buildMapLink(latitude, longitude);
            const mapInput = document.getElementById('googleMapsLink');
            if (mapInput) mapInput.value = mapLink;
            geoStatus.innerHTML = "<span style='color:green;'><i class='fa-solid fa-circle-check'></i> GPS capturado e campos preenchidos!</span>";
        } catch(err) {
            geoStatus.innerHTML = "<span style='color:orange;'>GPS obtido, erro ao traduzir o texto do endereço.</span>";
        }
    }, (err) => {
        geoStatus.innerHTML = `<span style='color:red;'>Falha na leitura de satélite: ${err.message}</span>`;
    }, { enableHighAccuracy: true, timeout: 8000 });
});

// Busca manual de endereço
document.getElementById('btnBuscarEndereco')?.addEventListener('click', async () => {
    const geoStatus = document.getElementById('geoStatus');
    const municipio = document.getElementById('municipio')?.value;
    const bairro = document.getElementById('bairro')?.value.trim();
    if (!bairro) {
        if (geoStatus) geoStatus.innerHTML = "<span style='color:red;'>Escreva algo no campo Bairro/Rua para validarmos.</span>";
        return;
    }
    if (geoStatus) geoStatus.innerHTML = "Pesquisando coordenadas geográficas...";
    const queryCompleta = `${bairro}, ${municipio}, Luanda, Angola`;
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryCompleta)}`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (data && data.length > 0) {
            const mapLink = buildMapLink(data[0].lat, data[0].lon);
            const mapInput = document.getElementById('googleMapsLink');
            if (mapInput) mapInput.value = mapLink;
            if (geoStatus) geoStatus.innerHTML = "<span style='color:green;'><i class='fa-solid fa-circle-check'></i> Endereço verificado e cadastrado!</span>";
        } else {
            const fallbackLink = `https://www.google.com/maps?q=${encodeURIComponent(bairro + ', ' + municipio + ', Luanda Angola')}`;
            const mapInput = document.getElementById('googleMapsLink');
            if (mapInput) mapInput.value = fallbackLink;
            if (geoStatus) geoStatus.innerHTML = "<span style='color:orange;'><i class='fa-solid fa-triangle-exclamation'></i> Ponto gerado por aproximação de texto.</span>";
        }
    } catch {
        const fallbackLink = `https://www.google.com/maps?q=${encodeURIComponent(bairro + ', ' + municipio + ', Luanda Angola')}`;
        const mapInput = document.getElementById('googleMapsLink');
        if (mapInput) mapInput.value = fallbackLink;
        if (geoStatus) geoStatus.innerHTML = "<span style='color:orange;'>Link gerado via fallback paramétrico.</span>";
    }
});

// ==================== SALVAR OCORRÊNCIA COM IMAGEM EM BASE64 ====================
function salvarOcorrencia(event) {
    event.preventDefault();
    const nome = document.getElementById('nomeUsuario')?.value;
    const telefone = document.getElementById('telefoneUsuario')?.value;
    const municipio = document.getElementById('municipio')?.value;
    const bairro = document.getElementById('bairro')?.value;
    const categoria = document.getElementById('categoria')?.value;
    const prioridade = document.getElementById('prioridade')?.value;
    const descricao = document.getElementById('descricao')?.value;
    const fileInput = document.getElementById('imagemLocal');
    let mapLink = document.getElementById('googleMapsLink')?.value;
    if (!mapLink) mapLink = `https://www.google.com/maps?q=${encodeURIComponent(bairro + ', ' + municipio)}`;

    // Função para adicionar ocorrência ao array e salvar
    function adicionarOcorrencia(anexoUrl) {
        const novaOcorrencia = {
            id: Date.now(),
            nome, telefone, municipio, bairro, categoria, prioridade, descricao,
            status: 'pendente',
            equipa: 'Não Atribuída',
            anexoUrl: anexoUrl,
            mapLink: mapLink,
            data: new Date().toLocaleString()
        };
        ocorrencias.unshift(novaOcorrencia);
        salvarOcorrenciasLocalStorage();
        toggleModal(false);
        alert('Ocorrência registada com sucesso!');
        if (typeof atualizarPainelGeral === 'function') atualizarPainelGeral();
    }

    // Se não houver imagem, salva placeholder
    if (!fileInput || !fileInput.files.length) {
        adicionarOcorrencia('https://via.placeholder.com/300?text=Sem+imagem');
        return;
    }

    // Converte a imagem para Base64 e salva
    const reader = new FileReader();
    reader.onload = function(e) {
        adicionarOcorrencia(e.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
}

// ==================== PAINEL ADMIN ====================
const equipasDisponiveis = [
    "Equipa Alfa - Viana",
    "Brigada Saneamento 2",
    "Icolo Ambiental Equipa 1",
    "Icolo Ambiental Equipa 2",
    "Cazenga Limpa R1"
];

function dispararAlertaInternoEmpresa(ocorrencia) {
    const painelAlertas = document.getElementById('painelAlertas');
    const textoAlerta = document.getElementById('textoAlerta');
    if (!painelAlertas || !textoAlerta) return;
    painelAlertas.style.background = "#FFEBEE";
    painelAlertas.style.borderLeftColor = "#D32F2F";
    textoAlerta.innerHTML = `<strong>STATUS ATUALIZADO!</strong> Ocorrência em ${ocorrencia.municipio} passou para ${ocorrencia.status}. Equipa: ${ocorrencia.equipa}.`;
    setTimeout(() => {
        painelAlertas.style.background = "#FFF3E0";
        painelAlertas.style.borderLeftColor = "#FF9800";
        textoAlerta.innerHTML = "Nenhum alerta recente pendente. As empresas parceiras operam na normalidade geográfica configurada.";
    }, 5000);
}

function atualizarPainelGeral() {
    const filtroMun = document.getElementById('filtroMunicipio')?.value || 'todos';
    const filtroPrio = document.getElementById('filtroPrioridade')?.value || 'todos';
    const filtroCat = document.getElementById('filtroCategoria')?.value || 'todos';
    const cardsContainer = document.getElementById('containerCardsOcorrencias');
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';
    let resolvidos = 0;
    let filtradosCount = 0;

    ocorrencias.forEach(o => {
        const matchMun = filtroMun === 'todos' || o.municipio === filtroMun;
        const matchPrio = filtroPrio === 'todos' || o.prioridade === filtroPrio;
        const matchCat = filtroCat === 'todos' || o.categoria === filtroCat;
        if (matchMun && matchPrio && matchCat) {
            filtradosCount++;
            if (o.status === 'resolvido') resolvidos++;

            const card = document.createElement('div');
            card.className = `occurrence-card prio-${o.prioridade}`;
            card.innerHTML = `
                <div class="card-img-box">
                    <img src="${o.anexoUrl}" alt="Evidência">
                    <span class="card-status-badge ${o.status}">${o.status.toUpperCase()}</span>
                </div>
                <div class="card-body">
                    <div class="card-header-info">
                        <span class="card-category-tag">${o.categoria}</span>
                        <span class="card-prio-tag">${o.prioridade.toUpperCase()}</span>
                    </div>
                    <p class="card-desc">${o.descricao}</p>
                    <div class="card-meta-line">
                        <i class="fa-solid fa-location-dot"></i>
                        <a href="${o.mapLink}" target="_blank">${o.municipio} - ${o.bairro}</a>
                    </div>
                    <div class="card-meta-line">
                        <i class="fa-solid fa-user"></i> ${o.nome} (${o.telefone})
                    </div>
                    <div class="card-action-zone">
                        <div class="select-wrapper">
                            <label>Equipa:</label>
                            <select class="card-team-selector" onchange="mudarEquipaElemento(${o.id}, this.value)">
                                <option ${o.equipa === 'Não Atribuída' ? 'selected' : ''}>Não Atribuída</option>
                                ${equipasDisponiveis.map(e => `<option value="${e}" ${o.equipa === e ? 'selected' : ''}>${e}</option>`).join('')}
                            </select>
                        </div>
                        <div class="card-btn-holder">
                            ${o.status !== 'resolvido' 
                                ? `<button class="btn-card-action" onclick="avancarStatusElemento(${o.id})">Avançar</button>` 
                                : `<span class="success-check"><i class="fa-solid fa-check-circle"></i> Concluído</span>`}
                        </div>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        }
    });

    const totalEl = document.getElementById('totalPontos');
    const taxaEl = document.getElementById('taxaResolucao');
    if (totalEl) totalEl.innerText = `${filtradosCount} Ponto(s)`;
    const taxa = filtradosCount > 0 ? ((resolvidos / filtradosCount) * 100).toFixed(1) : 0;
    if (taxaEl) taxaEl.innerText = `${taxa}%`;
}

function filtrarOcorrencias() {
    atualizarPainelGeral();
}

function mudarEquipaElemento(id, novaEquipa) {
    const ocorr = ocorrencias.find(o => o.id == id);
    if (ocorr) {
        ocorr.equipa = novaEquipa;
        salvarOcorrenciasLocalStorage();
        atualizarPainelGeral();
    }
}

function avancarStatusElemento(id) {
    const ocorr = ocorrencias.find(o => o.id == id);
    if (!ocorr) return;
    if (ocorr.status === 'pendente') {
        ocorr.status = 'andamento';
        if (ocorr.equipa === 'Não Atribuída') ocorr.equipa = equipasDisponiveis[0];
    } else if (ocorr.status === 'andamento') {
        ocorr.status = 'resolvido';
    }
    salvarOcorrenciasLocalStorage();
    atualizarPainelGeral();
    dispararAlertaInternoEmpresa(ocorr);
}

// ==================== LOGIN / LOGOUT ====================
function logout() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'index.html';
}

// ==================== NAVBAR DINÂMICA (scroll + sidebar) ====================
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (header && window.scrollY > 50) header.classList.add('scrolled');
    else if (header) header.classList.remove('scrolled');
});

document.addEventListener('DOMContentLoaded', () => {
    // Sidebar mobile
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const closeBtn = document.getElementById('sidebarClose');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;

    if (toggleBtn && sidebar) {
        const openSidebar = () => {
            sidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            body.classList.add('sidebar-open');
        };
        const closeSidebar = () => {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            body.classList.remove('sidebar-open');
        };
        toggleBtn.addEventListener('click', openSidebar);
        if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
        if (overlay) overlay.addEventListener('click', closeSidebar);
        document.querySelectorAll('.sidebar-nav a, .btn-entrar-sidebar').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) closeSidebar();
            });
        });
    }

    // Inicializar painel admin se estiver na página correta
    if (document.getElementById('containerCardsOcorrencias')) {
        atualizarPainelGeral();
    }
});

// Tornar funções globais para os onclick no HTML
window.abrirReporte = abrirReporte;
window.toggleModal = toggleModal;
window.salvarOcorrencia = salvarOcorrencia;
window.avancarStatusElemento = avancarStatusElemento;
window.mudarEquipaElemento = mudarEquipaElemento;
window.filtrarOcorrencias = filtrarOcorrencias;
window.logout = logout;