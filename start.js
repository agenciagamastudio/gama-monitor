const { execSync } = require('child_process')
const net = require('net')

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close()
      resolve(true)
    })
    server.listen(port)
  })
}

async function start() {
  let port = 3015
  while (!(await isPortFree(port))) {
    console.log(`⚠️  Porta ${port} ocupada, tentando ${port + 1}...`)
    port++
  }
  console.log(`✅ Monitor iniciando na porta ${port}`)
  execSync(`npx next dev -p ${port}`, { stdio: 'inherit' })
}

start()
