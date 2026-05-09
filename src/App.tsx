/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, MouseEvent } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  Plus, 
  CakeSlice, 
  Layers, 
  ChevronRight, 
  Trash2, 
  ArrowLeft,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { auth, db, signInAnonymously, handleFirestoreError, OperationType } from './lib/firebase';
import { Product, Step } from './types';
import DessertDetail from './components/DessertDetail';
import DessertForm from './components/DessertForm';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(true);
        try {
          await signInAnonymously();
        } catch (e) {
          console.error("Auto login failed", e);
          setLoading(false);
        }
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return unsubscribe;
  }, [user]);

  const handleCreateProduct = async (name: string, description: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'products'), {
        name,
        description,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const handleDeleteProduct = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir este doce?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-sans">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CakeSlice size={40} className="text-text-accent" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-main font-sans selection:bg-text-accent selection:text-white">
      <header className="sticky top-0 z-20 bg-bg-primary border-b-2 border-border-soft px-10 py-6">
        <div className="max-w-5xl mx-auto flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-accent mb-1 block">Produção Ativa</span>
            <div className="flex items-center gap-3">
              <CakeSlice size={28} className="text-text-dark" />
              <h1 className="text-4xl font-serif font-black tracking-tight text-text-dark">Fichas Técnicas</h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-right">
              <span className="text-[10px] uppercase font-bold text-text-accent block">ID de Produção</span>
              <span className="text-[10px] font-mono opacity-40">{user.uid.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-10">
        <AnimatePresence mode="wait">
          {selectedProduct ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-2 text-text-accent mb-10 hover:translate-x-[-4px] transition-transform uppercase text-xs font-bold tracking-widest"
              >
                <ArrowLeft size={16} />
                <span className="border-b border-text-accent/30">Voltar ao Catálogo</span>
              </button>
              <DessertDetail product={selectedProduct} />
            </motion.div>
          ) : isAdding ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-baseline justify-between mb-10 border-b-2 border-border-soft pb-4">
                <h2 className="text-4xl font-serif font-black uppercase tracking-tight">Novo Protocolo</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="text-xs uppercase tracking-widest font-bold text-text-accent border-b border-text-accent hover:text-text-dark hover:border-text-dark transition-all"
                >
                  Cancelar
                </button>
              </div>
              <DessertForm onSubmit={handleCreateProduct} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-end justify-between mb-12">
                <div>
                  <h2 className="text-[12px] uppercase tracking-[0.3em] font-bold text-text-accent mb-2">Suas Receitas</h2>
                  <p className="text-lg font-serif italic text-text-accent/80">Gestão técnica de camadas e insumos.</p>
                </div>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-text-dark text-white px-8 py-3 text-xs uppercase tracking-widest font-bold hover:bg-black transition-all shadow-[4px_4px_0px_#D9C5B2] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Criar ficha
                </button>
              </div>

              {products.length === 0 ? (
                <div className="bg-white border-2 border-border-soft p-16 text-center">
                  <Layers size={48} className="text-text-accent/20 mx-auto mb-6" />
                  <p className="text-text-accent uppercase tracking-widest text-sm font-bold">Nenhum registro encontrado</p>
                  <p className="text-xs mt-2 font-serif italic">Inicie seu catálogo técnico clicando no botão criar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      layoutId={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white border-2 border-border-soft p-8 hover:border-text-dark transition-all cursor-pointer flex flex-col h-full relative"
                    >
                      <div className="flex-1">
                        <span className="text-[10px] uppercase font-bold text-text-accent mb-2 block tracking-[0.2em]">Item #{product.id.slice(0, 4)}</span>
                        <h3 className="text-2xl font-serif font-black mb-3 group-hover:text-text-dark transition-colors line-clamp-2 leading-tight uppercase tracking-tight">{product.name}</h3>
                        <p className="text-xs text-text-accent/80 line-clamp-3 mb-8 font-medium leading-relaxed italic">
                          {product.description || 'Sem descrição técnica.'}
                        </p>
                      </div>
                      <div className="pt-6 border-t border-border-soft/50 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-text-accent/60">
                          REG: {product.createdAt?.toDate().toLocaleDateString('pt-BR')}
                        </span>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={(e) => handleDeleteProduct(e, product.id)}
                            className="text-text-accent/40 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={18} className="text-text-accent group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                      {/* Decorative corner */}
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent group-hover:border-text-dark transition-all duration-300" />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
