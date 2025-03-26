// Carica la disponibilità al caricamento della pagina
document.addEventListener('DOMContentLoaded', caricaDisponibilita);

async function caricaDisponibilita() {
    const postiCountElement = document.getElementById('postiCount');
    postiCountElement.textContent = 'Caricamento in corso...';
    
    try {
        const response = await fetch('https://tpsit-progetto-default-rtdb.europe-west1.firebasedatabase.app/parcheggi.json');
        const data = await response.json();
        
        if (!data) {
            postiCountElement.textContent = 'Nessun dato disponibile';
            return;
        }
        
        let postiLiberi = 0;
        let postiTotali = 0;
        
        for (const posto in data) {
            postiTotali++;
            if (data[posto].stato === 'libero' && !data[posto].prenotato) {
                postiLiberi++;
            }
        }
        
        postiCountElement.textContent = `${postiLiberi} posti liberi su ${postiTotali} totali`;
        
    } catch (error) {
        postiCountElement.textContent = 'Errore durante il caricamento';
        console.error('Errore:', error);
    }
}

async function prenotaParcheggio() {
    const nome = document.getElementById('nome').value.trim();
    const cognome = document.getElementById('cognome').value.trim();
    const messaggio = document.getElementById('messaggio');

    if (!nome || !cognome) {
        messaggio.textContent = 'Inserisci nome e cognome.';
        messaggio.className = 'message error';
        return;
    }

    // Generazione codice casuale basato su nome e cognome
    const codice = generaCodice(nome, cognome);

    try {
        // Leggere i parcheggi disponibili
        const response = await fetch('https://tpsit-progetto-default-rtdb.europe-west1.firebasedatabase.app/parcheggi.json');
        const data = await response.json();

        // Trovare un posto libero
        let postoLibero = null;
        for (const posto in data) {
            if (data[posto].stato === 'libero' && !data[posto].prenotato) {
                postoLibero = posto;
                break;
            }
        }

        if (!postoLibero) {
            messaggio.textContent = 'Nessun posto disponibile.';
            messaggio.className = 'message error';
            return;
        }

        // Aggiornare il posto trovato con prenotazione e codice
        const url = `https://tpsit-progetto-default-rtdb.europe-west1.firebasedatabase.app/parcheggi/${postoLibero}.json`;

        await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                stato: 'libero',
                prenotato: true,
                codice: codice
            })
        });

        messaggio.textContent = `Posto: ${postoLibero} | Codice: ${codice}`;
        messaggio.className = 'message success';
        
        // Aggiornare la disponibilità dopo la prenotazione
        caricaDisponibilita();
        
    } catch (error) {
        messaggio.textContent = 'Errore di connessione con il database.';
        messaggio.className = 'message error';
        console.error('Errore:', error);
    }
}

// Funzione per generare codice casuale
function generaCodice(nome, cognome) {
    const lettere = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const caratteriCasuali = Array.from({ length: 3 }, () =>
        lettere.charAt(Math.floor(Math.random() * lettere.length))
    ).join('');
    return nome[0].toUpperCase() + cognome[0].toUpperCase() + caratteriCasuali;
}
