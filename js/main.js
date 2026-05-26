// ==================== CONFIGURAÇÃO DA API LOCAL ====================
const API_URL = 'http://localhost:3000/api/ocorrencias';

// ==================== MODAL DE REPORTE (INDEX.HTML) ====================
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

document.getElementById('btnCapturarGPS')?.addEventListener('click', () => {
    const geoStatus = document.getElementById('geoStatus');
    if (!geoStatus) return;
    geoStatus.innerHTML = "A solicitar autorização de GPS...";
    
    if (!navigator.geolocation) {
        geoStatus.innerHTML = "<span style='color:var(--danger);'><i class='fa-solid fa-circle-xmark'></i> GPS não suportado.</span>";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            const mapLinkInput = document.getElementById('googleMapsLink');
            if (mapLinkInput) mapLinkInput.value = `https://maps.google.com/?q=${lat},${lng}`;
            geoStatus.innerHTML = `<span style='color:var(--success);'><i class='fa-solid fa-circle-check'></i> Localização capturada!</span>`;
        },
        (error) => {
            geoStatus.innerHTML = "<span style='color:var(--warning);'><i class='fa-solid fa-triangle-exclamation'></i> Erro ao obter GPS.</span>";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
});

// ==================== SUBMISSÃO DO CIDADÃO PARA A API (POST) ====================
async function salvarOcorrencia(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao')?.value;
    const imagemLocalInput = document.getElementById('imagemLocal');
    const mapLinkValue = document.getElementById('googleMapsLink')?.value;
    const prioridade = document.getElementById('prioridade')?.value || 'media';
    
    let latitude = "-8.8368"; 
    let longitude = "13.2343";

    if (mapLinkValue && mapLinkValue.includes('q=')) {
        const coords = mapLinkValue.split('q=')[1].split(',');
        latitude = coords[0];
        longitude = coords[1];
    }

    const formData = new FormData();
    formData.append('usuarioId', 'cidadao_luanda');
    formData.append('descricao', descricao);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('prioridade', prioridade); 

    if (imagemLocalInput && imagemLocalInput.files.length > 0) {
        formData.append('midia', imagemLocalInput.files[0]);
    } else {
        alert("Por favor, selecione uma evidência física.");
        return;
    }

    try {
        const btnSalvar = document.querySelector('.btn-salvar');
        if (btnSalvar) {
            btnSalvar.disabled = true;
            btnSalvar.innerText = "A enviar para a Nuvem...";
        }

        const resposta = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (resposta.ok) {
            alert("Ocorrência enviada para o Firebase com sucesso!");
            toggleModal(false);
            if (document.getElementById('containerCardsOcorrencias')) {
                atualizarPainelGeral();
            } else {
                window.location.reload();
            }
        } else {
            const err = await resposta.json();
            alert("Erro do servidor: " + err.error);
        }
    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar ao Back-end.");
    } finally {
        const btnSalvar = document.querySelector('.btn-salvar');
        if (btnSalvar) {
            btnSalvar.disabled = false;
            btnSalvar.innerText = "Submeter Ocorrência";
        }
    }
}

// ==================== LEITURA E RENDERIZAÇÃO REAL DO REPORTADM ====================
async function atualizarPainelGeral() {
    const container = document.getElementById('containerCardsOcorrencias');
    if (!container) return;

    try {
        const resposta = await fetch(API_URL);
        const ocorrenciasAPI = await resposta.json();

        // Armazena no escopo global para uso nos filtros
        window.todasOcorrencias = ocorrenciasAPI;

        renderizarCardsPainel(ocorrenciasAPI);
        atualizarContadoresPainel(ocorrenciasAPI);

    } catch (erro) {
        console.error("Erro na leitura da API:", erro);
        container.innerHTML = "<p style='padding:20px; color:var(--prio-alta);'>Erro ao carregar dados do servidor Node.js.</p>";
    }
}

// INJEÇÃO QUE REPRODUZ 100% O DESIGN ORIGINAL DOS TEUS COLEGAS
function renderizarCardsPainel(lista) {
    const container = document.getElementById('containerCardsOcorrencias');
    if (!container) return;
    container.innerHTML = "";

    if (lista.length === 0) {
        container.innerHTML = "<p style='padding: 20px; color: var(--text-muted); text-align:center; width:100%;'>Nenhuma ocorrência encontrada.</p>";
        return;
    }

    lista.forEach(item => {
        const card = document.createElement('div');
        // Mantém a classe dinâmica original que muda a cor da borda esquerda baseado no status
        card.className = `mockup-card card-${item.status.replace(/\s+/g, '').toLowerCase()}`;
        
        // Define a label e a classe CSS correta para a prioridade (Alta, Media, Baixa)
        const prioridadeFixa = item.prioridade || 'media';
        const labelPrioridade = prioridadeFixa.charAt(0).toUpperCase() + prioridadeFixa.slice(1);

        // Renderização de mídia inteligente (Vídeo ou Imagem vinda do Firebase Storage)
        let midiaHTML = "";
        if (item.url_foto) {
            if (item.url_foto.includes('.mp4') || item.url_foto.includes('.mov')) {
                midiaHTML = `<video src="${item.url_foto}" controls class="card-image" style="object-fit: cover; max-height: 200px; width: 100%; border-radius: 8px;"></video>`;
            } else {
                midiaHTML = `<img src="${item.url_foto}" alt="Evidência" class="card-image" style="object-fit: cover; max-height: 200px; width: 100%; border-radius: 8px; ">`;
            }
        }

        // MONTAGEM DO HTML IDENTICO AO ORIGINAL (ANTES DO BUG)
        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge status-${item.status.replace(/\s+/g, '').toLowerCase()}">${item.status}</span>
                <span class="priority-badge prio-${prioridadeFixa}">${labelPrioridade}</span>
            </div>
            
            <p class="card-desc">${item.descricao}</p>
            
            <div class="card-meta">
                <span><i class="fa-solid fa-location-dot"></i> Lat: ${item.latitude} | Lng: ${item.longitude}</span>
                <span><i class="fa-solid fa-calendar-days"></i> ${item.data_criacao ? new Date(item.data_criacao).toLocaleDateString('pt-AO') : 'Recente'}</span>
            </div>

            ${midiaHTML}

            <div class="card-actions">
                <div class="team-select-box">
                    <select id="select-equipe-${item.id}">
                        <option value="Brigada A - Maianga" ${item.equipa === 'Brigada A - Maianga' ? 'selected' : ''}>Brigada A - Maianga</option>
                        <option value="Brigada B - Samba" ${item.equipa === 'Brigada B - Samba' ? 'selected' : ''}>Brigada B - Samba</option>
                        <option value="Brigada C - Rangel" ${item.equipa === 'Brigada C - Rangel' ? 'selected' : ''}>Brigada C - Rangel</option>
                        <option value="Equipa de Choque" ${item.equipa === 'Equipa de Choque' ? 'selected' : ''}>Equipa de Choque</option>
                    </select>
                    <button class="btn-action btn-team" onclick="mudarEquipaElemento('${item.id}')">
                        <i class="fa-solid fa-truck-field"></i> Mudar Equipa
                    </button>
                </div>
                
                ${item.status !== 'Resolvido' ? `
                    <button class="btn-action btn-status" onclick="avancarStatusElemento('${item.id}', '${item.status}')">
                        <i class="fa-solid fa-check"></i> Avançar Estado
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// ==================== CONTADORES ORIGINAIS DO TOPO ====================
function atualizarContadoresPainel(lista) {
    const countPendentes = document.getElementById('countPendentes');
    const countAndamento = document.getElementById('countAndamento');
    const countResolvidos = document.getElementById('countResolvidos');
    const countTotal = document.getElementById('countTotal');

    if (countPendentes) countPendentes.innerText = lista.filter(o => o.status === 'Pendente').length;
    if (countAndamento) countAndamento.innerText = lista.filter(o => o.status === 'Em Andamento').length;
    if (countResolvidos) countResolvidos.innerText = lista.filter(o => o.status === 'Resolvido').length;
    if (countTotal) countTotal.innerText = lista.length;
}

// ==================== FILTROS DE STATUS ORIGINAIS ====================
function filtrarOcorrencias(statusFiltro) {
    if (!window.todasOcorrencias) return;

    // Atualiza a classe ativa nos botões originais
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    if (statusFiltro === 'todos') {
        renderizarCardsPainel(window.todasOcorrencias);
    } else {
        const filtradas = window.todasOcorrencias.filter(o => o.status.toLowerCase() === statusFiltro.toLowerCase());
        renderizarCardsPainel(filtradas);
    }
}

// ==================== ATUALIZAÇÕES EM TEMPO REAL NA API (PATCH) ====================
async function avancarStatusElemento(id, statusAtual) {
    let novoStatus = "Pendente";
    if (statusAtual === "Pendente") novoStatus = "Em Andamento";
    else if (statusAtual === "Em Andamento") novoStatus = "Resolvido";

    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ novoStatus })
        });

        if (resposta.ok) {
            atualizarPainelGeral();
        }
    } catch (err) {
        console.error(err);
    }
}

async function mudarEquipaElemento(id) {
    const select = document.getElementById(`select-equipe-${id}`);
    const novaEquipa = select ? select.value : '';

    try {
        // Envia a brigada selecionada para salvar direto no documento do Firestore
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ equipa: novaEquipa })
        });

        if (resposta.ok) {
            alert(`Sucesso: Ocorrência atribuída à ${novaEquipa}!`);
            atualizarPainelGeral();
        }
    } catch (err) {
        console.error(err);
    }
}

// ==================== LOGOUT E INICIALIZAÇÃO ====================
function logout() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formReporte');
    if (form) form.addEventListener('submit', salvarOcorrencia);

    if (document.getElementById('containerCardsOcorrencias')) {
        atualizarPainelGeral();
    }
});

// Vinculação global para os cliques do HTML funcionarem perfeitamente
window.abrirReporte = abrirReporte;
window.toggleModal = toggleModal;
window.filtrarOcorrencias = filtrarOcorrencias;
window.avancarStatusElemento = avancarStatusElemento;
window.mudarEquipaElemento = mudarEquipaElemento;
window.logout = logout;




// ==================== NOVAS FUNCIONALIDADES (SEM CONFLITO) ====================
// 1. SIDEBAR MOBILE
document.addEventListener('DOMContentLoaded', () => {
    const sidebarEl = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const closeBtn = document.getElementById('sidebarCloseBtn');

    if (sidebarEl && toggleBtn && closeBtn && overlay) {
        function openSidebar() {
            sidebarEl.classList.add('open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeSidebar() {
            sidebarEl.classList.remove('open');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        toggleBtn.addEventListener('click', openSidebar);
        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);
    }
});

// 2. CARROSSEL DE EMPRESAS (usando Swiper)
if (document.querySelector('.empresas-swiper') && typeof Swiper !== 'undefined') {
    new Swiper('.empresas-swiper', {
        loop: true,
        autoplay: { delay: 3000, disableOnInteraction: false }, // automático
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: {
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
        }
    });
}

// 3. MAPA INTERATIVO (página mapa.html)
if (document.getElementById('mapaLeaflet') && typeof L !== 'undefined') {
    let map = L.map('mapaLeaflet').setView([-8.8383, 13.2344], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> & CartoDB'
    }).addTo(map);

    // Dados de exemplo (pode vir da sua API depois)
    const ocorrenciasMapa = [
        { lat: -8.8383, lng: 13.2344, titulo: 'Lixo no Cazenga', prioridade: 'alta', descricao: 'Acúmulo de lixo doméstico.' },
        { lat: -8.8283, lng: 13.2444, titulo: 'Entulho na Av. 21 Janeiro', prioridade: 'media', descricao: 'Restos de construção.' },
        { lat: -8.8483, lng: 13.2244, titulo: 'Viana - Zango', prioridade: 'baixa', descricao: 'Ponto de lixo inicial.' }
    ];

    function adicionarMarcadores(filtroPrioridade = 'todas') {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) map.removeLayer(layer);
        });
        ocorrenciasMapa.forEach(occ => {
            if (filtroPrioridade !== 'todas' && occ.prioridade !== filtroPrioridade) return;
            L.marker([occ.lat, occ.lng])
                .bindPopup(`<b>${occ.titulo}</b><br>Prioridade: ${occ.prioridade}<br>${occ.descricao}`)
                .addTo(map);
        });
    }
    adicionarMarcadores();

    const btnAtualizar = document.getElementById('btnAtualizarMapa');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            const prioridade = document.getElementById('filtroPrioridade')?.value || 'todas';
            adicionarMarcadores(prioridade);
        });
    }
}