// ==================== CONFIGURAÇÃO DA API LOCAL ====================
const API_URL = 'http://localhost:3000/api/ocorrencias';

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

if (document.getElementById('btnCapturarGPS')) {
    document.getElementById('btnCapturarGPS').addEventListener('click', () => {
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
}

// ==================== SUBMISSÃO DO CIDADÃO PARA A API (POST) ====================
async function salvarOcorrencia(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao')?.value;
    const imagemLocalInput = document.getElementById('imagemLocal');
    const mapLinkValue = document.getElementById('googleMapsLink')?.value;
    const prioridade = document.getElementById('prioridade')?.value || 'media';
    
    const municipio = document.getElementById('municipio')?.value || '';
    const categoria = document.getElementById('categoria')?.value || '';
    const bairro = document.getElementById('bairro')?.value || '';
    const nomeUsuario = document.getElementById('nomeUsuario')?.value || '';
    const telefoneUsuario = document.getElementById('telefoneUsuario')?.value || '';
    
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
    formData.append('municipio', municipio);
    formData.append('categoria', categoria);
    formData.append('bairro', bairro);
    formData.append('nomeUsuario', nomeUsuario);
    formData.append('telefoneUsuario', telefoneUsuario);

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

// ==================== LEITURA E RENDERIZAÇÃO REAL ====================
async function atualizarPainelGeral() {
    const container = document.getElementById('containerCardsOcorrencias');
    if (!container) return;

    try {
        const resposta = await fetch(API_URL);
        const ocorrenciasAPI = await resposta.json();

        console.log("Dados carregados:", ocorrenciasAPI);
        window.todasOcorrencias = ocorrenciasAPI;
        renderizarCardsPainel(ocorrenciasAPI);
        atualizarContadoresPainel(ocorrenciasAPI);

    } catch (erro) {
        console.error("Erro na leitura da API:", erro);
        container.innerHTML = "<p style='padding:20px; color:var(--prio-alta);'>Erro ao carregar dados do servidor Node.js.</p>";
    }
}

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
        card.className = `mockup-card card-${item.status ? item.status.replace(/\s+/g, '').toLowerCase() : 'pendente'}`;
        
        const prioridadeFixa = item.prioridade || 'media';
        const labelPrioridade = prioridadeFixa.charAt(0).toUpperCase() + prioridadeFixa.slice(1);

        let midiaHTML = "";
        if (item.url_foto) {
            if (item.url_foto.includes('.mp4') || item.url_foto.includes('.mov')) {
                midiaHTML = `<video src="${item.url_foto}" controls class="card-image" style="object-fit: cover; max-height: 200px; width: 100%; border-radius: 8px;"></video>`;
            } else {
                midiaHTML = `<img src="${item.url_foto}" alt="Evidência" class="card-image" style="object-fit: cover; max-height: 200px; width: 100%; border-radius: 8px; ">`;
            }
        }

        const mapsLink = `https://www.google.com/maps?q=${item.latitude},${item.longitude}`;
        const municipioInfo = item.municipio ? `<span><i class="fa-solid fa-city"></i> ${item.municipio}</span>` : '';
        const categoriaInfo = item.categoria ? `<span><i class="fa-solid fa-trash"></i> ${item.categoria}</span>` : '';

        card.innerHTML = `
            <div class="card-header">
                <span class="status-badge status-${item.status ? item.status.replace(/\s+/g, '').toLowerCase() : 'pendente'}">${item.status || 'Pendente'}</span>
                <span class="priority-badge prio-${prioridadeFixa}">${labelPrioridade}</span>
            </div>
            
            <p class="card-desc">${item.descricao || 'Sem descrição'}</p>
            
            <div class="card-meta">
                ${municipioInfo}
                ${categoriaInfo}
                <span><i class="fa-solid fa-location-dot"></i> 
                    <a href="${mapsLink}" target="_blank" style="color: #1976D2; text-decoration: none;">
                        Ver no Mapa
                    </a>
                </span>
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

function atualizarContadoresPainel(lista) {
    const totalPontos = document.getElementById('totalPontos');
    const taxaResolucao = document.getElementById('taxaResolucao');

    if (totalPontos) totalPontos.innerText = lista.length + " Pontos";
    if (taxaResolucao) {
        const resolvidos = lista.filter(o => o.status === 'Resolvido').length;
        const percentual = lista.length > 0 ? Math.round((resolvidos / lista.length) * 100) : 0;
        taxaResolucao.innerText = percentual + "%";
    }
}

// ==================== FUNÇÃO DE FILTROS COMBINADOS ====================
function aplicarFiltros() {
    if (!window.todasOcorrencias) {
        console.log("Nenhuma ocorrência carregada");
        return;
    }
    
    const municipio = document.getElementById('filtroMunicipio')?.value || 'todos';
    const prioridade = document.getElementById('filtroPrioridade')?.value || 'todos';
    const categoria = document.getElementById('filtroCategoria')?.value || 'todos';
    
    console.log("Filtrando por:", { municipio, prioridade, categoria });
    
    let filtradas = [...window.todasOcorrencias];
    
    if (municipio !== 'todos') {
        filtradas = filtradas.filter(o => o.municipio === municipio);
    }
    if (prioridade !== 'todos') {
        filtradas = filtradas.filter(o => o.prioridade === prioridade);
    }
    if (categoria !== 'todos') {
        filtradas = filtradas.filter(o => o.categoria === categoria);
    }
    
    console.log(`Filtrou de ${window.todasOcorrencias.length} para ${filtradas.length} ocorrências`);
    
    if (filtradas.length === 0) {
        const container = document.getElementById('containerCardsOcorrencias');
        if (container) {
            container.innerHTML = "<p style='padding: 20px; text-align:center;'>Nenhuma ocorrência encontrada com os filtros selecionados.</p>";
        }
    } else {
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

// ==================== LOGOUT ====================
function logout() {
    localStorage.removeItem('admin_logado');
    window.location.href = 'login.html';
}

// ==================== INICIALIZAÇÃO PRINCIPAL ====================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formReporte');
    if (form) form.addEventListener('submit', salvarOcorrencia);

    if (document.getElementById('containerCardsOcorrencias')) {
        atualizarPainelGeral();
    }
});

// ==================== EXPORTAÇÃO GLOBAL ====================
window.abrirReporte = abrirReporte;
window.toggleModal = toggleModal;
window.aplicarFiltros = aplicarFiltros;
window.avancarStatusElemento = avancarStatusElemento;
window.mudarEquipaElemento = mudarEquipaElemento;
window.logout = logout;