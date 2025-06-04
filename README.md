# Artep POS - Sistema de Punto de Venta

**Versión:** 3.0.0  
**Autor:** dlucianop31  
**Licencia:** Proyecto desarrollado como freelance.

---

## 📋 Descripción

**Artep POS** es una aplicación de escritorio para la gestión de un taller de cerámica. Está diseñada para controlar de forma eficiente las ventas, el inventario y la producción artesanal. La herramienta permite llevar el registro de pedidos personalizados, administrar el stock tanto de productos terminados como de bizcochos (piezas sin decorar), y coordinar la producción a través de un panel estilo Kanban con fases automatizadas.  

---

## 🚀 Características

### 1. Punto de Venta
- Venta directa desde inventario.
- Registro de pedidos personalizados con categoría, tamaño, modelo, decoración y color.
- Gestión de datos opcionales como cliente, fecha de entrega, carrito, forma y método de pago.
- Control de stock comprometido y actualización automática tras la entrega del pedido.

### 2. Panel de Producción
- Representación estilo Kanban con **3 estados**: `pendiente`, `en proceso` y `terminado`.
- Las órdenes se generan automáticamente según su origen (venta, inventario o reposición).
- Al pasar una orden a **terminado**, el sistema actualiza automáticamente el stock y **elimina la orden**.
- Compatible con productos finales y bizcochos.

### 3. Inventario de Bizcochos
- CRUD completo: crear, leer, actualizar y eliminar piezas sin decoración.
- Al consultar una pieza, si hay órdenes en proceso asociadas, se indica.
- Permite crear órdenes de producción si no hay ninguna en proceso para el bizcocho.

### 4. Inventario de Productos Decorados
- CRUD similar al de bizcochos, enfocado en productos terminados.
- No genera órdenes automáticamente, pero permite revisar si existen bizcochos relacionados.
- Útil para producción bajo demanda.

### 5. Historial de Ventas
- Registro detallado de todas las ventas.
- Permite reimprimir tickets o notas de venta.
- Al marcar una venta como entregada, el sistema descuenta el stock comprometido, evitando "stock fantasma".

---

## 🛠️ Tecnologías utilizadas

- **Electron** (v33.2.1): Plataforma de ejecución como app de escritorio.
- **Node.js**: Backend y lógica de negocio.
- **SQLite3** (v5.1.7): Base de datos local y liviana.
- **HTML, CSS y JavaScript**: Interfaz gráfica y scripts del sistema.

---

## 🏗️ Instalación y ejecución

### Prerrequisitos

Este proyecto se empaqueta con el siguiente comando personalizado:

```bash
npm run rebuild && electron-packager . ArtepPOS --platform=win32 --arch=x64 --out=release --overwrite --prune=true