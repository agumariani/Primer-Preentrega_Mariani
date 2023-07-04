import UserManager from './managers/UserManager.js';
const express = require('express');
const manager = new UserManager('./files/Usuarios.json');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Middleware para parsear el body como JSON
app.use(express.json());

// Rutas para el manejo de productos
const productsRouter = express.Router();

productsRouter.get('/', (req, res) => {
    // Leer el archivo "productos.json"
    const productsData = fs.readFileSync('productos.json', 'utf8');
    const products = JSON.parse(productsData);

    // Aplicar la limitación si se proporciona el parámetro "limit"
    const limit = req.query.limit;
    if (limit) {
        const limitedProducts = products.slice(0, limit);
        return res.json(limitedProducts);
    }

    // Enviar todos los productos
    res.json(products);
});

productsRouter.get('/:pid', (req, res) => {
    // Leer el archivo "productos.json"
    const productsData = fs.readFileSync('productos.json', 'utf8');
    const products = JSON.parse(productsData);

    const pid = req.params.pid;

    // Buscar el producto por id
    const product = products.find((p) => p.id === pid);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Enviar el producto encontrado
    res.json(product);
});

productsRouter.post('/', (req, res) => {
    // Leer el archivo "productos.json"
    const productsData = fs.readFileSync('productos.json', 'utf8');
    const products = JSON.parse(productsData);

    const { title, description, code, price, stock, category, thumbnails } = req.body;

    // Generar un nuevo ID
    const newId = generateUniqueId();

    // Crear el nuevo producto
    const newProduct = {
        id: newId,
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails,
    };

    // Agregar el nuevo producto al arreglo de productos
    products.push(newProduct);

    // Escribir los productos actualizados en el archivo "productos.json"
    fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));

    // Enviar el nuevo producto creado
    res.json(newProduct);
});

productsRouter.put('/:pid', (req, res) => {
    // Leer el archivo "productos.json"
    const productsData = fs.readFileSync('productos.json', 'utf8');
    const products = JSON.parse(productsData);

    const pid = req.params.pid;
    const productIndex = products.findIndex((p) => p.id === pid);

    // Verificar si el producto existe
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener el producto existente
    const existingProduct = products[productIndex];

    // Actualizar el producto con los campos enviados desde body
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    const updatedProduct = {
        ...existingProduct,
        title: title || existingProduct.title,
        description: description || existingProduct.description,
        code: code || existingProduct.code,
        price: price || existingProduct.price,
        stock: stock || existingProduct.stock,
        category: category || existingProduct.category,
        thumbnails: thumbnails || existingProduct.thumbnails,
    };

    // Reemplazar el producto existente con el producto actualizado
    products[productIndex] = updatedProduct;

    // Escribir los productos actualizados en el archivo "productos.json"
    fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));

    // Enviar el producto actualizado
    res.json(updatedProduct);
});

productsRouter.delete('/:pid', (req, res) => {
    // Leer el archivo "productos.json"
    const productsData = fs.readFileSync('productos.json', 'utf8');
    const products = JSON.parse(productsData);

    const pid = req.params.pid;
    const productIndex = products.findIndex((p) => p.id === pid);

    // Verificar si el producto existe
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Eliminar el producto del arreglo de productos
    const deletedProduct = products.splice(productIndex, 1)[0];

    // Escribir los productos actualizados en el archivo "productos.json"
    fs.writeFileSync('productos.json', JSON.stringify(products, null, 2));

    // Enviar el producto eliminado
    res.json(deletedProduct);
});

// Rutas para el manejo de carritos
const cartsRouter = express.Router();

cartsRouter.post('/', (req, res) => {
    // Leer el archivo "carrito.json"
    const cartData = fs.readFileSync('carrito.json', 'utf8');
    const cart = JSON.parse(cartData);

    // Generar un nuevo ID
    const newId = generateUniqueId();

    // Crear el nuevo carrito
    const newCart = {
        id: newId,
        products: [],
    };

    // Agregar el nuevo carrito al archivo "carrito.json"
    fs.writeFileSync('carrito.json', JSON.stringify(newCart, null, 2));

    // Enviar el nuevo carrito creado
    res.json(newCart);
});

cartsRouter.get('/:cid', (req, res) => {
    // Leer el archivo "carrito.json"
    const cartData = fs.readFileSync('carrito.json', 'utf8');
    const cart = JSON.parse(cartData);

    const cid = req.params.cid;

    // Verificar si el carrito existe
    if (cart.id !== cid) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Enviar los productos del carrito
    res.json(cart.products);
});

cartsRouter.post('/:cid/product/:pid', (req, res) => {
    // Leer el archivo "carrito.json"
    const cartData = fs.readFileSync('carrito.json', 'utf8');
    const cart = JSON.parse(cartData);

    const cid = req.params.cid;
    const pid = req.params.pid;

    // Verificar si el carrito existe
    if (cart.id !== cid) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Verificar si el producto ya existe en el carrito
    const existingProduct = cart.products.find((p) => p.product === pid);

    if (existingProduct) {
        // Incrementar la cantidad del producto existente
        existingProduct.quantity++;
    } else {
        // Agregar el nuevo producto al carrito
        cart.products.push({
            product: pid,
            quantity: 1,
        });
    }

    // Escribir el carrito actualizado en el archivo "carrito.json"
    fs.writeFileSync('carrito.json', JSON.stringify(cart, null, 2));

    // Enviar el carrito actualizado
    res.json(cart);
});

// Montar los routers en las rutas correspondientes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Función para generar un ID único
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${ PORT }`);
});
