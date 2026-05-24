        // ==================== CONFIGURAÇÃO DO FIREBASE ====================
        // IMPORTANTE: Insere aqui as credenciais do teu projeto.
        // Podes encontrá-las na engrenagem (Configurações do Projeto) no Console do Firebase.
        const firebaseConfig = {
            apiKey: "AIzaSyA3RsyyWzJ4oQy_9hd-bz4kQYbyEVc6qnU", 
            authDomain: "sos-lixo.firebaseapp.com",
            projectId: "sos-lixo",
            storageBucket: "sos-lixo.firebasestorage.app"
        };

        // Inicializa o Firebase no Front-end
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();

        // ==================== CONTROLO DE AUTENTICAÇÃO REAL ====================
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('usuario').value.trim();
            const senha = document.getElementById('senha').value;
            const erroMsg = document.getElementById('erroMsg');
            const btnEntrar = document.getElementById('btnEntrar');
            
            erroMsg.innerText = ''; 
            
            try {
                // Bloqueia o botão temporariamente para dar feedback visual de carregamento
                btnEntrar.disabled = true;
                btnEntrar.innerText = "A autenticar...";

                // Faz a validação segura na infraestrutura da Google Cloud
                const resultado = await auth.signInWithEmailAndPassword(email, senha);
                
                // Se o Firebase aceitar, guarda o estado da sessão localmente
                localStorage.setItem('admin_logado', 'true');
                localStorage.setItem('admin_email', resultado.user.email);
                
                // Redireciona para o Painel Administrativo que consome a tua API
                window.location.href = 'ReportAdm.html';

            } catch (error) {
                console.error("Erro na autenticação:", error);
                
                // Mensagens amigáveis em português para a banca de avaliação
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    erroMsg.innerText = 'E-mail ou senha incorretos.';
                } else if (error.code === 'auth/too-many-requests') {
                    erroMsg.innerText = 'Acesso bloqueado temporariamente por excesso de tentativas.';
                } else {
                    erroMsg.innerText = 'Erro ao conectar ao serviço de autenticação.';
                }
            } finally {
                // Desbloqueia o botão caso ocorra um erro para o utilizador tentar novamente
                if (localStorage.getItem('admin_logado') !== 'true') {
                    btnEntrar.disabled = false;
                    btnEntrar.innerText = "Entrar no Painel";
                }
            }
        });


        // ==================== RECUPERAÇÃO DE PASSWORD AUTOMATIZADA ====================
        document.getElementById('btnRecuperar').addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('usuario').value.trim();
            erroMsg.innerText = '';
            infoMsg.innerText = '';

            // Validação preliminar: exige o e-mail preenchido para disparar a recuperação
            if (!email) {
                erroMsg.innerText = 'Por favor, introduza o seu e-mail no campo acima antes de clicar em recuperar.';
                document.getElementById('usuario').focus();
                return;
            }

            try {
                infoMsg.innerText = 'A processar o pedido na nuvem...';
                
                // Dispara o e-mail oficial da infraestrutura Google Cloud
                await auth.sendPasswordResetEmail(email);
                
                infoMsg.style.color = "var(--success, #22c55e)";
                infoMsg.innerText = 'E-mail de recuperação enviado! Verifique a sua caixa de entrada ou spam.';
            } catch (error) {
                console.error("Erro na recuperação:", error);
                infoMsg.innerText = '';
                
                if (error.code === 'auth/user-not-found') {
                    erroMsg.innerText = 'Este e-mail administrativo não está registado no sistema.';
                } else if (error.code === 'auth/invalid-email') {
                    erroMsg.innerText = 'O formato do e-mail introduzido é inválido.';
                } else {
                    erroMsg.innerText = 'Erro ao solicitar recuperação. Tente novamente mais tarde.';
                }
            }
        });