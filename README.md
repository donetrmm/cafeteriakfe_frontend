# KFE - Sistema de Cafetería

Sistema de punto de venta (POS) para cafeterías desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características

- **Setup Inicial**: Configuración del primer administrador
- **Autenticación**: Login con JWT y roles/permisos
- **Punto de Venta (POS)**: Carrito de compras y procesamiento de ventas
- **Dashboard**: Métricas y reportes de ventas
- **Gestión de Usuarios**: CRUD de usuarios con roles

## 📋 Requisitos

- Node.js 18+
- Backend API corriendo en `http://localhost:3000`

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev
```

## 📦 Tecnologías

- **React 18** + TypeScript
- **Vite** para bundling
- **Tailwind CSS** para estilos
- **Redux Toolkit** para estado global
- **React Router DOM** para navegación
- **Axios** para HTTP
- **Zod** para validación
- **React Hook Form** para formularios
- **Recharts** para gráficas
- **Lucide React** para iconos

## 🏗️ Arquitectura

```
src/
├── components/       # Componentes reutilizables
│   └── layout/       # Layout (Sidebar, AppLayout)
├── core/
│   └── domain/       # Interfaces y tipos
├── infrastructure/
│   ├── api/          # Cliente HTTP (Axios)
│   └── store/        # Redux (slices, hooks)
├── lib/              # Utilidades
├── pages/            # Páginas de la aplicación
└── index.css         # Estilos globales
```

## 🎨 Paleta de Colores

- **Primary**: `#8B5A2B` (café)
- **Primary Dark**: `#5D3A1A` (café oscuro)
- **Accent**: `#C67A52` (terracota)
- **Background**: `#FAF8F4` (crema)
- **Surface**: `#FFFFFF` (blanco)

## 📝 Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
npm run lint     # Ejecutar ESLint
```
