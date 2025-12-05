import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Define o caminho para o diretório onde o banco de dados será armazenado
// process.cwd() retorna o diretório de trabalho atual do projeto
const dbDir = path.join(process.cwd(), 'database');

// Garante que o diretório 'database' exista. Se não, ele é criado.
// Isso é importante para evitar erros ao tentar criar o arquivo do banco de dados
// em um diretório que não existe.
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Define o caminho completo para o arquivo do banco de dados
const dbPath = path.join(dbDir, 'database.db');

// Cria uma nova instância do banco de dados.
// O 'better-sqlite3' cria o arquivo se ele não existir.
const db = new Database(dbPath);

// ---- INICIALIZAÇÃO DAS TABELAS ----
// Este bloco de código garante que as tabelas existam sempre que o app for iniciado.
try {
  // Tabela de Usuários
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      photoUrl TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Tabela de Clientes
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      cpf TEXT,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);
  
  console.log('Tabelas de usuários e clientes inicializadas com sucesso.');

} catch (error) {
  // Se houver qualquer erro durante a criação da tabela (ex: problema de permissão),
  // ele será logado no console.
  console.error('Falha ao criar as tabelas:', error);
}

// Exporta a instância do banco de dados para ser usada em outras partes do aplicativo,
// como nas API routes e Server Actions.
export default db;
