-- Cria o banco de dados se ele não existir e entra nele
CREATE DATABASE IF NOT EXISTS meupets;
USE meupets;

-- 1. Tabela de Usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    imagem VARCHAR(255)
);

-- 2. Tabela de Casas
CREATE TABLE casas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    imagem VARCHAR(255),
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES usuarios(id)
);

-- 3. Tabela de Pets
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50),
    raca VARCHAR(50),
    nascimento VARCHAR(20),
    imagem VARCHAR(255),
    casa_id INT,
    FOREIGN KEY (casa_id) REFERENCES casas(id)
);