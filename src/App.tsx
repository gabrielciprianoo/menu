import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  X,
  Check,
  MessageSquare,
  Phone,
  User,
  ChevronDown,
  Edit2,
  Flame,
  Truck,
  ChefHat,
  UtensilsCrossed,
  ChevronUp,
  Copy,
  type LucideIcon,
} from "lucide-react";

// Types
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface UnitNotes {
  [unitIndex: number]: string;
}

interface CartItem extends MenuItem {
  uniqueId: string;
  quantity: number;
  unitNotes: UnitNotes;
  category: Category;
}

interface PhoneNumber {
  id: number;
  alias: string;
  number: string;
}

interface ConfirmationStep {
  icon: LucideIcon;
  text: string;
  emoji: string;
  color: string;
}

type Category = "tortas" | "tacos" | "bebidas" | "extras";

interface MenuItems {
  tortas: MenuItem[];
  tacos: MenuItem[];
  bebidas: MenuItem[];
  extras: MenuItem[];
}

interface PhoneManagerProps {
  phones: PhoneNumber[];
  setPhones: React.Dispatch<React.SetStateAction<PhoneNumber[]>>;
  selectedPhone: PhoneNumber | null;
  setSelectedPhone: React.Dispatch<React.SetStateAction<PhoneNumber | null>>;
}

interface ConfirmationAnimationProps {
  onComplete: () => void;
}

interface UnitNotesEditorProps {
  item: CartItem;
  onUpdateNotes: (uniqueId: string, unitNotes: UnitNotes) => void;
}

// Constants
const CATEGORY_EMOJIS: Record<Category, string> = {
  tortas: "🥖",
  tacos: "🌮",
  bebidas: "🥤",
  extras: "🍟",
};

const MENU_ITEMS: MenuItems = {
  tortas: [
    { id: 1, name: "Torta de Jamón", description: "Jamón de pierna, queso fresco, aguacate cremoso, jitomate jugoso y mayonesa casera", price: 45 },
    { id: 2, name: "Torta de Milanesa", description: "Milanesa de res recién empanizada, queso derretido, aguacate, frijoles refritos", price: 55 },
    { id: 3, name: "Torta Hawaiana", description: "Pierna ahumada, jamón premium, salchicha, queso gratinado y piña caramelizada", price: 60 },
    { id: 4, name: "Torta Cubana", description: "La reina de las tortas: pierna, jamón, milanesa, salchicha, huevo y queso fundido", price: 65 },
  ],
  tacos: [
    { id: 5, name: "Tacos de Asada", description: "3 tacos con carne asada al carbón, cebolla caramelizada, cilantro fresco", price: 50 },
    { id: 6, name: "Tacos al Pastor", description: "3 tacos al pastor con piña asada, cilantro, cebolla y nuestra salsa secreta", price: 50 },
    { id: 7, name: "Tacos de Carnitas", description: "3 tacos de carnitas estilo Michoacán, crujientes por fuera y suaves por dentro", price: 50 },
    { id: 8, name: "Tacos Dorados", description: "4 tacos dorados de papa con lechuga fresca, crema, queso añejo y salsa", price: 45 },
  ],
  bebidas: [
    { id: 9, name: "Agua Fresca", description: "Horchata cremosa, Jamaica refrescante o Limón con chía", price: 20 },
    { id: 10, name: "Refresco", description: "Coca-Cola, Sprite, Fanta o Mundet bien fríos", price: 25 },
    { id: 11, name: "Agua Mineral", description: "Topo Chico o Peñafiel mineralizadas", price: 20 },
    { id: 12, name: "Jugo Natural", description: "Naranja, zanahoria o mixto recién exprimido", price: 30 },
  ],
  extras: [
    { id: 13, name: "Papas Fritas", description: "Porción generosa de papas crujientes recién hechas", price: 30 },
    { id: 14, name: "Guacamole Casero", description: "Guacamole fresco con aguacate Michoacano y totopos", price: 35 },
    { id: 15, name: "Quesadillas", description: "3 quesadillas de queso Oaxaca con tortilla hecha a mano", price: 40 },
    { id: 16, name: "Orden de Frijoles", description: "Frijoles refritos con queso y totopos crujientes", price: 25 },
  ],
};

const CATEGORIES: Category[] = ["tortas", "tacos", "bebidas", "extras"];
const CATEGORY_NAMES: Record<Category, string> = { tortas: "Tortas", tacos: "Tacos", bebidas: "Bebidas", extras: "Extras" };

// Helper functions
const getStoredPhones = (): PhoneNumber[] => {
  try {
    const stored = localStorage.getItem("customer_phones");
    return stored ? (JSON.parse(stored) as PhoneNumber[]) : [];
  } catch { return []; }
};

const getStoredSelectedPhone = (): PhoneNumber | null => {
  try {
    const stored = localStorage.getItem("selected_phone");
    return stored ? (JSON.parse(stored) as PhoneNumber) : null;
  } catch { return null; }
};

// Unit Notes Editor Component
function UnitNotesEditor({ item, onUpdateNotes }: UnitNotesEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);

  const hasAnyNotes = Object.values(item.unitNotes).some((note) => note.trim());
  const notesCount = Object.values(item.unitNotes).filter((note) => note.trim()).length;

  const handleSaveNote = (unitIndex: number) => {
    const newNotes = { ...item.unitNotes };
    if (applyToAll) {
      for (let i = 0; i < item.quantity; i++) newNotes[i] = tempNote;
    } else {
      newNotes[unitIndex] = tempNote;
    }
    onUpdateNotes(item.uniqueId, newNotes);
    setEditingUnit(null);
    setTempNote("");
    setApplyToAll(false);
  };

  const handleCopyToAll = (note: string) => {
    const newNotes: UnitNotes = {};
    for (let i = 0; i < item.quantity; i++) newNotes[i] = note;
    onUpdateNotes(item.uniqueId, newNotes);
  };

  const startEditing = (unitIndex: number) => {
    setEditingUnit(unitIndex);
    setTempNote(item.unitNotes[unitIndex] || "");
    setApplyToAll(false);
  };

  if (item.quantity === 1) {
    if (editingUnit === 0) {
      return (
        <div className="mt-2 space-y-2">
          <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="Ej: Sin cebolla, extra salsa..." className="w-full p-2 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 resize-none text-sm bg-white" rows={2} autoFocus />
          <div className="flex gap-2">
            <button onClick={() => handleSaveNote(0)} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"><Check className="w-3 h-3" />Guardar</button>
            <button onClick={() => { setEditingUnit(null); setTempNote(""); }} className="px-3 bg-gray-200 text-gray-700 py-1.5 rounded-lg font-semibold text-xs">Cancelar</button>
          </div>
        </div>
      );
    }
    return (
      <div className="mt-1">
        {item.unitNotes[0] ? (
          <button onClick={() => startEditing(0)} className="w-full text-left bg-orange-100 p-2 rounded-lg border border-orange-200 hover:bg-orange-200 transition-colors">
            <div className="flex items-start gap-1.5">
              <MessageSquare className="w-3 h-3 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 flex-1 line-clamp-2">{item.unitNotes[0]}</p>
              <Edit2 className="w-3 h-3 text-orange-500 flex-shrink-0" />
            </div>
          </button>
        ) : (
          <button onClick={() => startEditing(0)} className="text-orange-600 text-xs font-semibold hover:underline flex items-center gap-1 py-1">
            <MessageSquare className="w-3 h-3" />+ Instrucciones
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button onClick={() => setIsExpanded(!isExpanded)} className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${hasAnyNotes ? "bg-orange-100 border border-orange-200" : "bg-gray-50 border border-gray-200 hover:bg-gray-100"}`}>
        <div className="flex items-center gap-2">
          <MessageSquare className={`w-4 h-4 ${hasAnyNotes ? "text-orange-600" : "text-gray-500"}`} />
          <span className={`text-xs font-semibold ${hasAnyNotes ? "text-orange-700" : "text-gray-600"}`}>
            {hasAnyNotes ? `${notesCount} de ${item.quantity} con instrucciones` : `Instrucciones (${item.quantity} unidades)`}
          </span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2 border-l-2 border-orange-200">
          {Array.from({ length: item.quantity }).map((_, index) => (
            <div key={index}>
              {editingUnit === index ? (
                <div className="bg-white rounded-lg p-2 border-2 border-orange-300 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <span className="bg-orange-200 text-orange-700 px-2 py-0.5 rounded-full">#{index + 1}</span>
                    <span>{item.name}</span>
                  </div>
                  <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="Ej: Sin cebolla, extra salsa..." className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 resize-none text-sm" rows={2} autoFocus />
                  {item.quantity > 1 && (
                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                      Aplicar a todas las unidades
                    </label>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveNote(index)} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1"><Check className="w-3 h-3" />Guardar</button>
                    <button onClick={() => { setEditingUnit(null); setTempNote(""); setApplyToAll(false); }} className="px-3 bg-gray-200 text-gray-700 py-1.5 rounded-lg font-semibold text-xs">Cancelar</button>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center gap-2 p-2 rounded-lg ${item.unitNotes[index] ? "bg-orange-50 border border-orange-200" : "bg-gray-50 border border-gray-100"}`}>
                  <span className="bg-orange-200 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">#{index + 1}</span>
                  {item.unitNotes[index] ? (
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <p className="text-xs text-gray-700 truncate flex-1">{item.unitNotes[index]}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        {item.quantity > 1 && <button onClick={() => handleCopyToAll(item.unitNotes[index])} className="p-1 text-blue-500 hover:bg-blue-100 rounded" title="Copiar a todas"><Copy className="w-3 h-3" /></button>}
                        <button onClick={() => startEditing(index)} className="p-1 text-orange-500 hover:bg-orange-100 rounded"><Edit2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => startEditing(index)} className="text-gray-500 text-xs hover:text-orange-600">+ Agregar instrucción</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Confirmation Animation Component
function ConfirmationAnimation({ onComplete }: ConfirmationAnimationProps) {
  const [step, setStep] = useState<number>(0);
  const steps: ConfirmationStep[] = [
    { icon: ShoppingCart, text: "Recibiendo tu pedido...", emoji: "📦", color: "from-blue-500 to-cyan-500" },
    { icon: UtensilsCrossed, text: "Preparando ingredientes...", emoji: "🥬🍅🧅", color: "from-green-500 to-emerald-500" },
    { icon: Flame, text: "Poniendo el sazón...", emoji: "🌶️✨", color: "from-orange-500 to-red-500" },
    { icon: ChefHat, text: "Cocinando con amor...", emoji: "👨‍🍳❤️", color: "from-pink-500 to-rose-500" },
    { icon: Truck, text: "¡Preparando tu entrega!", emoji: "🛵💨", color: "from-purple-500 to-violet-500" },
    { icon: Check, text: "¡Pedido confirmado!", emoji: "🎉", color: "from-green-500 to-green-600" },
  ];

  const stableOnComplete = useCallback(onComplete, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < steps.length - 1) setStep((s) => s + 1);
      else stableOnComplete();
    }, step < steps.length - 1 ? 1200 : 2000);
    return () => clearTimeout(timer);
  }, [step, steps.length, stableOnComplete]);

  const currentStep = steps[step];
  const CurrentIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className={`relative w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-2xl`}>
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentStep.color} animate-ping opacity-30`}></div>
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${currentStep.color} animate-pulse opacity-50`}></div>
          <div className="relative z-10 text-white">
            {step === steps.length - 1 ? <div className="animate-bounce"><Check className="w-16 h-16 sm:w-20 sm:h-20" strokeWidth={3} /></div> : <div className="animate-pulse"><CurrentIcon className="w-14 h-14 sm:w-16 sm:h-16" /></div>}
          </div>
        </div>
        <div className="text-5xl sm:text-6xl mb-4 animate-bounce">{currentStep.emoji}</div>
        <h3 className={`text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r ${currentStep.color} bg-clip-text text-transparent`}>{currentStep.text}</h3>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${currentStep.color} transition-all duration-500 ease-out rounded-full`} style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="flex justify-center gap-2">
          {steps.map((s, index) => <div key={index} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index <= step ? `bg-gradient-to-r ${s.color} scale-110` : "bg-gray-300"}`} />)}
        </div>
        {step === steps.length - 1 && <p className="text-gray-600 mt-4 text-sm sm:text-base">Te contactaremos pronto por WhatsApp 📱</p>}
      </div>
    </div>
  );
}

// Phone Manager Component
function PhoneManager({ phones, setPhones, selectedPhone, setSelectedPhone }: PhoneManagerProps) {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [newAlias, setNewAlias] = useState<string>("");
  const [newNumber, setNewNumber] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState<boolean>(false);

  const savePhone = (): void => {
    if (!newNumber.trim()) return;
    const alias = newAlias.trim() || `Teléfono ${phones.length + 1}`;
    const number = newNumber.replace(/\D/g, "");

    if (editingId) {
      const updated = phones.map((p) => p.id === editingId ? { ...p, alias, number } : p);
      setPhones(updated);
      localStorage.setItem("customer_phones", JSON.stringify(updated));
      if (selectedPhone?.id === editingId) {
        const updatedSelected = { ...selectedPhone, alias, number };
        setSelectedPhone(updatedSelected);
        localStorage.setItem("selected_phone", JSON.stringify(updatedSelected));
      }
    } else {
      const newPhone: PhoneNumber = { id: Date.now(), alias, number };
      const updated = [...phones, newPhone];
      setPhones(updated);
      localStorage.setItem("customer_phones", JSON.stringify(updated));
      if (!selectedPhone) {
        setSelectedPhone(newPhone);
        localStorage.setItem("selected_phone", JSON.stringify(newPhone));
      }
    }
    setNewAlias(""); setNewNumber(""); setShowForm(false); setEditingId(null);
  };

  const deletePhone = (id: number): void => {
    const updated = phones.filter((p) => p.id !== id);
    setPhones(updated);
    localStorage.setItem("customer_phones", JSON.stringify(updated));
    if (selectedPhone?.id === id) {
      const newSelected = updated[0] || null;
      setSelectedPhone(newSelected);
      localStorage.setItem("selected_phone", JSON.stringify(newSelected));
    }
  };

  const selectPhone = (phone: PhoneNumber): void => {
    setSelectedPhone(phone);
    localStorage.setItem("selected_phone", JSON.stringify(phone));
    setShowSelector(false);
  };

  const editPhone = (phone: PhoneNumber): void => {
    setNewAlias(phone.alias); setNewNumber(phone.number); setEditingId(phone.id); setShowForm(true);
  };

  const formatNumber = (number: string): string => number.length === 10 ? `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}` : number;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-4 border-2 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl"><Phone className="w-5 h-5 text-white" /></div>
        <h3 className="font-bold text-gray-800">Número de contacto</h3>
      </div>

      {phones.length === 0 && !showForm ? (
        <div className="text-center py-4">
          <p className="text-gray-600 text-sm mb-3">Agrega un número para que te contactemos</p>
          <button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-transform shadow-md flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />Agregar teléfono
          </button>
        </div>
      ) : (
        <>
          {phones.length > 0 && !showForm && (
            <div className="relative mb-3">
              <button onClick={() => setShowSelector(!showSelector)} className="w-full bg-white rounded-xl p-3 border-2 border-blue-300 flex items-center justify-between hover:border-blue-400 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-400 to-green-500 p-2 rounded-lg"><User className="w-4 h-4 text-white" /></div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800 text-sm">{selectedPhone?.alias || "Seleccionar"}</p>
                    <p className="text-gray-600 text-xs">{selectedPhone ? formatNumber(selectedPhone.number) : "---"}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showSelector ? "rotate-180" : ""}`} />
              </button>
              {showSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 border-blue-200 z-20 overflow-hidden">
                  {phones.map((phone) => (
                    <div key={phone.id} className={`flex items-center justify-between p-3 hover:bg-blue-50 transition-colors ${selectedPhone?.id === phone.id ? "bg-blue-100" : ""}`}>
                      <button onClick={() => selectPhone(phone)} className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${selectedPhone?.id === phone.id ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gray-200"}`}>
                          <User className={`w-4 h-4 ${selectedPhone?.id === phone.id ? "text-white" : "text-gray-600"}`} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">{phone.alias}</p>
                          <p className="text-gray-600 text-xs">{formatNumber(phone.number)}</p>
                        </div>
                        {selectedPhone?.id === phone.id && <Check className="w-5 h-5 text-green-500 ml-2" />}
                      </button>
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); editPhone(phone); }} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); deletePhone(phone.id); }} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setShowSelector(false); setShowForm(true); }} className="w-full p-3 text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-2 border-t border-blue-100">
                    <Plus className="w-4 h-4" />Agregar otro número
                  </button>
                </div>
              )}
            </div>
          )}
          {showForm && (
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Alias (opcional)</label>
                <input type="text" placeholder="Ej: Casa, Trabajo, Mamá..." value={newAlias} onChange={(e) => setNewAlias(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Número de teléfono *</label>
                <input type="tel" placeholder="10 dígitos" value={newNumber} onChange={(e) => setNewNumber(e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={savePhone} disabled={!newNumber.trim() || newNumber.length < 10} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2.5 rounded-xl font-semibold hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 text-sm shadow-md">{editingId ? "Actualizar" : "Guardar"}</button>
                <button onClick={() => { setShowForm(false); setNewAlias(""); setNewNumber(""); setEditingId(null); }} className="px-4 bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold hover:bg-gray-300 text-sm">Cancelar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Main Component
export default function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<Category>("tortas");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [phones, setPhones] = useState<PhoneNumber[]>(getStoredPhones);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(getStoredSelectedPhone);

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    if (!searchQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const generateUniqueId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToCart = (item: MenuItem, category: Category): void => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map((cartItem) => cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1, unitNotes: { ...cartItem.unitNotes, [cartItem.quantity]: "" } } : cartItem));
    } else {
      setCart([...cart, { ...item, uniqueId: generateUniqueId(), quantity: 1, unitNotes: { 0: "" }, category }]);
    }
  };

  const updateQuantity = (uniqueId: string, change: number): void => {
    setCart(cart.map((item) => {
      if (item.uniqueId === uniqueId) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        const newUnitNotes: UnitNotes = {};
        for (let i = 0; i < newQuantity; i++) newUnitNotes[i] = item.unitNotes[i] || "";
        return { ...item, quantity: newQuantity, unitNotes: newUnitNotes };
      }
      return item;
    }).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (uniqueId: string): void => setCart(cart.filter((item) => item.uniqueId !== uniqueId));
  const updateUnitNotes = (uniqueId: string, unitNotes: UnitNotes): void => setCart(cart.map((item) => item.uniqueId === uniqueId ? { ...item, unitNotes } : item));
  const calculateTotal = (): number => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const submitOrder = (): void => { if (selectedPhone) setShowConfirmation(true); };
  const finalizeOrder = useCallback((): void => { setShowConfirmation(false); setCart([]); setShowCart(false); }, []);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {showConfirmation && <ConfirmationAnimation onComplete={finalizeOrder} />}

      <header className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl p-2 sm:p-3 shadow-lg"><span className="text-3xl sm:text-4xl">🥖</span></div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight">La Calzadita</h1>
                  <p className="text-xs sm:text-sm text-orange-100 font-medium">Charapan, Michoacán</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowCart(true)} className="relative bg-white text-orange-600 p-3 sm:p-4 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg animate-bounce">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-600 w-5 h-5 z-10" />
            <input type="text" placeholder="¿Qué se te antoja hoy?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="relative w-full pl-12 pr-4 py-3 sm:py-4 rounded-3xl border-2 border-orange-200 focus:border-orange-500 focus:outline-none bg-white shadow-lg text-base sm:text-lg placeholder-gray-400" />
          </div>
        </div>

        <div className="mb-6 sm:mb-8 -mx-3 sm:-mx-6 px-3 sm:px-6">
          <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 pt-2 px-1">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all whitespace-nowrap text-base sm:text-lg shadow-lg flex-shrink-0 ${activeCategory === cat ? "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105 shadow-2xl" : "bg-white text-gray-700 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:scale-105 active:scale-95"}`}>
                <span className="text-2xl sm:text-3xl">{CATEGORY_EMOJIS[cat]}</span>
                <span>{CATEGORY_NAMES[cat]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filterItems(MENU_ITEMS[activeCategory]).map((item) => (
            <div key={item.id} className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-orange-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative flex items-start gap-4 sm:gap-5">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-3 sm:p-4 group-hover:scale-110 transition-transform shadow-md">
                  <span className="text-5xl sm:text-6xl">{CATEGORY_EMOJIS[activeCategory]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">{item.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">${item.price}</span>
                    <button onClick={() => addToCart(item, activeCategory)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold hover:scale-110 active:scale-95 transition-transform shadow-lg flex items-center gap-2 text-sm sm:text-base">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" /><span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filterItems(MENU_ITEMS[activeCategory]).length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🔍</div>
            <p className="text-gray-600 text-lg sm:text-xl font-semibold">No encontramos "{searchQuery}"</p>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Intenta buscando otra cosa deliciosa</p>
          </div>
        )}
      </main>

      {showCart && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30" onClick={() => setShowCart(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl border-4 border-orange-200">
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white p-4 sm:p-6 flex justify-between items-center rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2"><ShoppingCart className="w-6 h-6" />Tu Pedido</h2>
                <p className="text-xs sm:text-sm text-orange-100">{totalItems} {totalItems === 1 ? "producto" : "productos"}</p>
              </div>
              <button onClick={() => setShowCart(false)} className="bg-white text-orange-600 p-2 sm:p-2.5 rounded-xl hover:bg-orange-50 active:scale-95 shadow-lg">
                <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain">
              {cart.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="text-6xl sm:text-7xl mb-4">🛒</div>
                  <p className="text-gray-600 text-base sm:text-lg font-semibold">Tu carrito está vacío</p>
                  <p className="text-gray-400 mt-2 text-sm sm:text-base">¡Agrega algo delicioso!</p>
                  <button onClick={() => setShowCart(false)} className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 shadow-lg">Ver Menú</button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4 pb-6">
                  <PhoneManager phones={phones} setPhones={setPhones} selectedPhone={selectedPhone} setSelectedPhone={setSelectedPhone} />
                  {cart.map((item) => (
                    <div key={item.uniqueId} className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-3 sm:p-4 border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        <div className="bg-white rounded-xl p-2 shadow-sm"><span className="text-2xl sm:text-3xl">{CATEGORY_EMOJIS[item.category]}</span></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base">{item.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600">${item.price} c/u</p>
                        </div>
                        <button onClick={() => removeFromCart(item.uniqueId)} className="text-red-500 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg active:scale-95"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 sm:gap-3 bg-white rounded-xl p-1.5 shadow-md border border-orange-200">
                          <button onClick={() => updateQuantity(item.uniqueId, -1)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:scale-110 active:scale-95 shadow-sm"><Minus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                          <span className="font-bold text-base sm:text-lg w-6 sm:w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.uniqueId, 1)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-1.5 sm:p-2 rounded-lg hover:scale-110 active:scale-95 shadow-sm"><Plus className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                        </div>
                        <span className="font-black text-lg sm:text-xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">${item.price * item.quantity}</span>
                      </div>
                      <UnitNotesEditor item={item} onUpdateNotes={updateUnitNotes} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-100 to-red-100 border-t-4 border-orange-300 flex-shrink-0">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-gray-700">Total</span>
                  <span className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">${calculateTotal()}</span>
                </div>
                {!selectedPhone && (
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-yellow-800 text-sm font-medium">Agrega un número de contacto para continuar</p>
                  </div>
                )}
                <button onClick={submitOrder} disabled={!selectedPhone} className={`w-full py-3 sm:py-4 rounded-2xl font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-2 sm:gap-3 ${!selectedPhone ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:scale-105 active:scale-95 hover:shadow-2xl"}`}>
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />Enviar por WhatsApp
                </button>
                <p className="text-xs text-center text-gray-700 mt-2 font-medium">Te contactaremos al {selectedPhone ? selectedPhone.number : "número seleccionado"}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white mt-12 py-6 sm:py-8 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm sm:text-base mb-2 font-semibold">💳 Efectivo y tarjeta</p>
          <p className="text-xs sm:text-sm text-orange-100">📍 Charapan, Michoacán • 🕐 Lun-Dom 8am-8pm</p>
          <p className="text-xs text-orange-200 mt-3">Hecho con ❤️ en La Calzadita</p>
        </div>
      </footer>
    </div>
  );
}