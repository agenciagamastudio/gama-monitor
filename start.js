#!/usr/bin/env node

/**
 * Auto-port detection for GAMA Monitor + ttyd Terminal
 * Tenta porta 3015, depois 3016, 3017, 3018 se estiver ocupada
 * ttyd sempre usa porta 3020 (não detecta, fallback silent)
 */

const { execSync } = require('child_process');
const net = require('net');

console.log('🔍 Detectando porta disponível para GAMA Monitor...\n');

/**
 * Verifica se uma porta está livre
 */
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port, '127.0.0.1');
  });
}

/**
 * Encontra primeira porta livre a partir de startPort
 */
async function findFreePort(startPort = 3015) {
  let port = startPort;
  const maxPort = startPort + 10;

  while (port < maxPort) {
    const free = await isPortFree(port);
    if (free) {
      return port;
    }
    console.log(`⚠️  Porta ${port} está ocupada, tentando ${port + 1}...`);
    port++;
  }

  throw new Error(
    `Não foi encontrada porta livre entre ${startPort} e ${maxPort}`
  );
}

/**
 * Main
 */
async function main() {
  try {
    const port = await findFreePort(3015);

    console.log(`✅ Porta ${port} está disponível\n`);

    console.log('🚀 Iniciando GAMA Monitor na porta ' + port + '...\n');
    console.log(`📡 Acessível em:`);
    console.log(`   localhost: http://localhost:${port}`);
    console.log(`   rede local: http://192.168.X.X:${port}`);
    console.log(`   terminal:   http://localhost:${port}/terminal`);
    console.log(`   externo:    npm run tunnel`);
    console.log(`\n⌨️  Para usar o Terminal:`);
    console.log(`   Em outro terminal, rode: npm run terminal\n`);

    // Sobe Next.js (bloqueia o processo)
    // -H 0.0.0.0 permite acesso da rede local
    execSync(`npx next dev -H 0.0.0.0 -p ${port}`, {
      stdio: 'inherit',
      cwd: __dirname,
    });
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    process.exit(1);
  }
}

main();
