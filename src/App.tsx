import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  X,
  Check,
  MessageSquare
} from "lucide-react";

interface MenuItem {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

interface ItemCarrito extends MenuItem {
  cantidad: number;
  notas?: string;
  categoria: Categoria;
}

type Categoria = "tortas" | "tacos" | "bebidas" | "extras";

interface MenuItems {
  tortas: MenuItem[];
  tacos: MenuItem[];
  bebidas: MenuItem[];
  extras: MenuItem[];
}

const categoriaEmojis: Record<Categoria, string> = {
  tortas: "🥖",
  tacos: "🌮",
  bebidas: "🥤",
  extras: "🍟",
};

const menuItems: MenuItems = {
  tortas: [
    {
      id: 1,
      nombre: "Torta de Jamón",
      descripcion:
        "Jamón de pierna, queso fresco, aguacate cremoso, jitomate jugoso y mayonesa casera",
      precio: 45,
    },
    {
      id: 2,
      nombre: "Torta de Milanesa",
      descripcion:
        "Milanesa de res recién empanizada, queso derretido, aguacate, frijoles refritos",
      precio: 55,
    },
    {
      id: 3,
      nombre: "Torta Hawaiana",
      descripcion:
        "Pierna ahumada, jamón premium, salchicha, queso gratinado y piña caramelizada",
      precio: 60,
    },
    {
      id: 4,
      nombre: "Torta Cubana",
      descripcion:
        "La reina de las tortas: pierna, jamón, milanesa, salchicha, huevo y queso fundido",
      precio: 65,
    },
  ],
  tacos: [
    {
      id: 5,
      nombre: "Tacos de Asada",
      descripcion:
        "3 tacos con carne asada al carbón, cebolla caramelizada, cilantro fresco",
      precio: 50,
    },
    {
      id: 6,
      nombre: "Tacos al Pastor",
      descripcion:
        "3 tacos al pastor con piña asada, cilantro, cebolla y nuestra salsa secreta",
      precio: 50,
    },
    {
      id: 7,
      nombre: "Tacos de Carnitas",
      descripcion:
        "3 tacos de carnitas estilo Michoacán, crujientes por fuera y suaves por dentro",
      precio: 50,
    },
    {
      id: 8,
      nombre: "Tacos Dorados",
      descripcion:
        "4 tacos dorados de papa con lechuga fresca, crema, queso añejo y salsa",
      precio: 45,
    },
  ],
  bebidas: [
    {
      id: 9,
      nombre: "Agua Fresca",
      descripcion: "Horchata cremosa, Jamaica refrescante o Limón con chía",
      precio: 20,
    },
    {
      id: 10,
      nombre: "Refresco",
      descripcion: "Coca-Cola, Sprite, Fanta o Mundet bien fríos",
      precio: 25,
    },
    {
      id: 11,
      nombre: "Agua Mineral",
      descripcion: "Topo Chico o Peñafiel mineralizadas",
      precio: 20,
    },
    {
      id: 12,
      nombre: "Jugo Natural",
      descripcion: "Naranja, zanahoria o mixto recién exprimido",
      precio: 30,
    },
  ],
  extras: [
    {
      id: 13,
      nombre: "Papas Fritas",
      descripcion: "Porción generosa de papas crujientes recién hechas",
      precio: 30,
    },
    {
      id: 14,
      nombre: "Guacamole Casero",
      descripcion: "Guacamole fresco con aguacate Michoacano y totopos",
      precio: 35,
    },
    {
      id: 15,
      nombre: "Quesadillas",
      descripcion: "3 quesadillas de queso Oaxaca con tortilla hecha a mano",
      precio: 40,
    },
    {
      id: 16,
      nombre: "Orden de Frijoles",
      descripcion: "Frijoles refritos con queso y totopos crujientes",
      precio: 25,
    },
  ],
};

export default function App() {
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>("tortas");
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState<boolean>(false);
  const [itemNotasId, setItemNotasId] = useState<number | null>(null);
  const [notasTemp, setNotasTemp] = useState<string>("");
  const [pedidoEnviado, setPedidoEnviado] = useState<boolean>(false);

  const filtrarItems = (items: MenuItem[]): MenuItem[] => {
    if (!busqueda) return items;
    return items.filter(
      (item) =>
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const agregarAlCarrito = (item: MenuItem, categoria: Categoria): void => {
    const itemExistente = carrito.find((i) => i.id === item.id);
    if (itemExistente) {
      setCarrito(
        carrito.map((i) =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i
        )
      );
    } else {
      setCarrito([...carrito, { ...item, cantidad: 1, categoria }]);
    }
  };

  const actualizarCantidad = (id: number, cambio: number): void => {
    setCarrito(
      carrito
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + cambio;
            return nuevaCantidad > 0
              ? { ...item, cantidad: nuevaCantidad }
              : item;
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id: number): void => {
    setCarrito(carrito.filter((item) => item.id !== id));
  };

  const agregarNotas = (id: number, notas: string): void => {
    setCarrito(
      carrito.map((item) => (item.id === id ? { ...item, notas } : item))
    );
    setItemNotasId(null);
    setNotasTemp("");
  };

  const calcularTotal = (): number => {
    return carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  };

  const enviarPedido = (): void => {
    setPedidoEnviado(true);
    setTimeout(() => {
      setCarrito([]);
      setMostrarCarrito(false);
      setPedidoEnviado(false);
    }, 2500);
  };

  const categorias: Categoria[] = ["tortas", "tacos", "bebidas", "extras"];
  const nombresCategoria: Record<Categoria, string> = {
    tortas: "Tortas",
    tacos: "Tacos",
    bebidas: "Bebidas",
    extras: "Extras",
  };

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header moderno con gradiente vibrante */}
      <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl p-2 sm:p-3 shadow-lg">
                  <span className="text-3xl sm:text-4xl">🥖</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                    La Calzadita
                  </h1>
                  <p className="text-xs sm:text-sm text-orange-100 font-medium">
                    Charapan, Michoacán
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarCarrito(true)}
              className="relative bg-white text-orange-600 p-3 sm:p-4 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* Info rápida moderna */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {/* Buscador moderno con animación */}
        <div className="mb-6 sm:mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-600 w-5 h-5 z-10 transition-all group-focus-within:text-red-600 group-focus-within:scale-110" />
            <input
              type="text"
              placeholder="¿Qué se te antoja hoy?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="relative w-full pl-12 pr-4 py-3 sm:py-4 rounded-3xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none transition-all bg-white shadow-lg text-base sm:text-lg placeholder-gray-400"
            />
          </div>
        </div>

        {/* Categorías modernas con iconos grandes */}
        <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all whitespace-nowrap text-base sm:text-lg shadow-lg ${
                categoriaActiva === cat
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105 shadow-2xl"
                  : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:scale-105 active:scale-95"
              }`}
            >
              <span className="text-2xl sm:text-3xl">
                {categoriaEmojis[cat]}
              </span>
              <span>{nombresCategoria[cat]}</span>
            </button>
          ))}
        </div>

        {/* Grid de items con iconos más grandes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filtrarItems(menuItems[categoriaActiva]).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-300 group relative overflow-hidden"
            >
              {/* Efecto de brillo al hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

              <div className="relative flex items-start gap-4 sm:gap-5">
                {/* Icono grande unificado por categoría */}
                <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-3 sm:p-4 group-hover:scale-110 transition-transform shadow-md">
                  <span className="text-5xl sm:text-6xl">
                    {categoriaEmojis[categoriaActiva]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {item.nombre}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {item.descripcion}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      ${item.precio}
                    </span>
                    <button
                      onClick={() => agregarAlCarrito(item, categoriaActiva)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:scale-110 active:scale-95 transition-transform shadow-lg flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtrarItems(menuItems[categoriaActiva]).length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🔍</div>
            <p className="text-gray-600 text-lg sm:text-xl font-semibold">
              No encontramos "{busqueda}"
            </p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Intenta buscando otra cosa deliciosa
            </p>
          </div>
        )}
      </main>

      {/* Modal del carrito mejorado con fondo transparente */}
      {mostrarCarrito && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="absolute inset-0 backdrop-blur-sm bg-white/30"
            onClick={() => setMostrarCarrito(false)}
          />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-bottom-4 duration-300 border-4 border-orange-200">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-4 sm:p-6 flex justify-between items-center sticky top-0 z-10 shadow-xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6" />
                  Tu Pedido
                </h2>
                <p className="text-xs sm:text-sm text-orange-100">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </p>
              </div>
              <button
                onClick={() => setMostrarCarrito(false)}
                className="bg-white text-orange-600 p-2 sm:p-2.5 rounded-xl hover:bg-orange-50 active:scale-95 transition-all shadow-lg"
              >
                <X
                  className="w-5 h-5 sm:w-6 sm:h-6 font-bold"
                  strokeWidth={3}
                />
              </button>
            </div>

            <div
              className="overflow-y-auto p-4 sm:p-6"
              style={{ maxHeight: "calc(95vh - 200px)" }}
            >
              {carrito.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="text-6xl sm:text-7xl mb-4">🛒</div>
                  <p className="text-gray-600 text-base sm:text-lg font-semibold">
                    Tu carrito está vacío
                  </p>
                  <p className="text-gray-400 mt-2 text-sm sm:text-base">
                    ¡Agrega algo delicioso!
                  </p>
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-transform shadow-lg"
                  >
                    Ver Menú
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {carrito.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-3 sm:p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <div className="bg-white rounded-xl p-2 shadow-sm">
                          <span className="text-2xl sm:text-3xl">
                            {categoriaEmojis[item.categoria]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                            {item.nombre}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            ${item.precio} c/u
                          </p>
                        </div>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          className="text-red-500 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg transition-colors active:scale-95"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-1.5 shadow-md border border-orange-200">
                          <button
                            onClick={() => actualizarCantidad(item.id, -1)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <span className="font-bold text-base sm:text-lg w-6 sm:w-8 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => actualizarCantidad(item.id, 1)}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:scale-110 active:scale-95 transition-all shadow-sm"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <span className="font-black text-lg sm:text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                          ${item.precio * item.cantidad}
                        </span>
                      </div>

                      {itemNotasId === item.id ? (
                        <div className="mt-3">
                          <textarea
                            value={notasTemp}
                            onChange={(e) => setNotasTemp(e.target.value)}
                            placeholder="Ej: Sin cebolla, extra de salsa, bien cocido..."
                            className="w-full p-2 sm:p-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 resize-none text-sm bg-white"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => agregarNotas(item.id, notasTemp)}
                              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-semibold hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
                            >
                              <Check className="w-4 h-4 inline mr-1" />
                              Guardar
                            </button>
                            <button
                              onClick={() => {
                                setItemNotasId(null);
                                setNotasTemp("");
                              }}
                              className="px-3 sm:px-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {item.notas ? (
                            <div className="bg-white p-2 sm:p-3 rounded-lg border-2 border-orange-200 shadow-sm">
                              <div className="flex items-start gap-1 sm:gap-2">
                                <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs sm:text-sm text-gray-700 flex-1">
                                  <span className="font-semibold">Notas:</span>{" "}
                                  {item.notas}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setItemNotasId(item.id);
                                  setNotasTemp(item.notas || "");
                                }}
                                className="text-orange-600 text-xs sm:text-sm font-semibold mt-1 hover:underline"
                              >
                                Editar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setItemNotasId(item.id)}
                              className="text-orange-600 text-xs sm:text-sm font-semibold hover:underline flex items-center gap-1"
                            >
                              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                              Agregar instrucciones
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-100 to-red-100 border-t-4 border-orange-300 sticky bottom-0">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-gray-700">
                    Total
                  </span>
                  <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ${calcularTotal()}
                  </span>
                </div>
                <button
                  onClick={enviarPedido}
                  disabled={pedidoEnviado}
                  className={`w-full py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 ${
                    pedidoEnviado
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white scale-105"
                      : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:scale-105 active:scale-95 hover:shadow-2xl"
                  }`}
                >
                  {pedidoEnviado ? (
                    <>
                      <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                      ¡Pedido Recibido!
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                      Enviar por WhatsApp
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-700 mt-2 font-medium">
                  Te contactaremos para confirmar
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer moderno */}
      <footer className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white mt-12 py-6 sm:py-8 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm sm:text-base mb-2 font-semibold">
            💳 Efectivo y tarjeta
          </p>
          <p className="text-xs sm:text-sm text-orange-100">
            📍 Charapan, Michoacán • 🕐 Lun-Dom 8am-8pm
          </p>
          <p className="text-xs text-orange-200 mt-3">
            Hecho con ❤️ en La Calzadita
          </p>
        </div>
      </footer>
    </div>
  );
}
