import { useState, useEffect, FormEvent } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { Plus, Trash2, Layers, MoveUp, MoveDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Product, Step } from '../types';
import VisualStack from './VisualStack';

interface DessertDetailProps {
  product: Product;
}

const LAYER_COLORS = [
  { name: 'Chocolate', hex: '#3C2A21' },
  { name: 'Creme Branco', hex: '#FFF8E1' },
  { name: 'Morango', hex: '#FF5252' },
  { name: 'Caramelo', hex: '#D4A373' },
  { name: 'Biscuits', hex: '#E6CCB2' },
  { name: 'Frutas Verdes', hex: '#AED581' },
  { name: 'Ninho', hex: '#FAFAFA' },
  { name: 'Doce de Leite', hex: '#B87333' },
];

export default function DessertDetail({ product }: DessertDetailProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [newStepName, setNewStepName] = useState('');
  const [newStepIngredient, setNewStepIngredient] = useState('');
  const [selectedColor, setSelectedColor] = useState(LAYER_COLORS[0].hex);
  const [isAddingStep, setIsAddingStep] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, `products/${product.id}/steps`),
      orderBy('order', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Step[];
      setSteps(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `products/${product.id}/steps`);
    });

    return unsubscribe;
  }, [product.id]);

  const handleAddStep = async (e: FormEvent) => {
    e.preventDefault();
    if (!newStepName.trim()) return;

    try {
      await addDoc(collection(db, `products/${product.id}/steps`), {
        name: newStepName,
        ingredient: newStepIngredient,
        color: selectedColor,
        order: steps.length,
      });
      setNewStepName('');
      setNewStepIngredient('');
      setIsAddingStep(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${product.id}/steps`);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      await deleteDoc(doc(db, `products/${product.id}/steps`, stepId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${product.id}/steps/${stepId}`);
    }
  };

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;

    const currentStep = steps[index];
    const otherStep = steps[newIndex];

    try {
      await updateDoc(doc(db, `products/${product.id}/steps`, currentStep.id), { order: newIndex });
      await updateDoc(doc(db, `products/${product.id}/steps`, otherStep.id), { order: index });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${product.id}/steps`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch min-h-[600px]">
      {/* Left: Visual Stack */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-accent mb-6 flex items-center gap-4">
          <span className="w-12 h-[2px] bg-border-soft"></span> 
          <span>Representação Visual</span>
        </div>
        
        <div className="flex-1 bg-white border-2 border-border-soft p-10 relative flex flex-col justify-end shadow-[8px_8px_0px_#D9C5B2]">
          <VisualStack steps={steps} />
          
          {/* Scale labels */}
          <div className="absolute left-3 top-10 bottom-10 flex flex-col justify-between text-[10px] font-mono text-border-soft pointer-events-none">
            <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-white border-2 border-border-soft">
          <h2 className="text-3xl font-serif font-black uppercase tracking-tight text-text-dark mb-2">{product.name}</h2>
          <p className="text-sm text-text-accent font-medium italic leading-relaxed">
            {product.description || 'Especificação técnica não preenchida.'}
          </p>
        </div>
      </div>

      {/* Right: Steps Instruction */}
      <div className="lg:col-span-7 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-accent flex items-center gap-4">
            <span className="w-12 h-[2px] bg-border-soft"></span> 
            <span>Passo a Passo Técnico</span>
          </div>
          <button
            onClick={() => setIsAddingStep(true)}
            className="bg-text-dark text-white px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-black transition-all"
          >
            Adicionar Camada
          </button>
        </div>

        <div className="flex-1 space-y-4">
          <AnimatePresence mode="popLayout">
            {isAddingStep && (
              <motion.form
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleAddStep}
                className="p-8 bg-white border-2 border-text-dark space-y-6 mb-10 shadow-[6px_6px_0px_#D9C5B2]"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-text-accent mb-2">Camada</label>
                    <input
                      type="text"
                      required
                      value={newStepName}
                      onChange={(e) => setNewStepName(e.target.value)}
                      placeholder="Nome técnico"
                      className="w-full px-4 py-3 border-2 border-border-soft focus:border-text-dark outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-text-accent mb-2">Insumo</label>
                    <input
                      type="text"
                      value={newStepIngredient}
                      onChange={(e) => setNewStepIngredient(e.target.value)}
                      placeholder="Ingrediente principal"
                      className="w-full px-4 py-3 border-2 border-border-soft focus:border-text-dark outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-text-accent mb-4">Referência Cromática</label>
                  <div className="flex flex-wrap gap-3">
                    {LAYER_COLORS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-10 h-10 border-2 transition-all ${selectedColor === c.hex ? 'border-text-dark scale-110 shadow-md' : 'border-border-soft'}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 bg-text-dark text-white py-4 text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors">
                    Salvar Protocolo
                  </button>
                  <button type="button" onClick={() => setIsAddingStep(false)} className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-text-accent border-2 border-border-soft hover:bg-bg-primary transition-colors">
                    Cancelar
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            {steps.length === 0 && !isAddingStep && (
              <div className="bg-white border-2 border-border-soft p-12 text-center">
                <p className="text-text-accent font-serif italic mb-4">Aguardando entrada de dados técnicos para montagem.</p>
                <div className="w-16 h-[1px] bg-border-soft mx-auto" />
              </div>
            )}
            
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                layout
                className="flex items-start gap-8 p-6 bg-white border border-border-soft hover:border-text-accent transition-all group relative overflow-hidden"
              >
                <span className="text-5xl font-serif font-black text-border-soft/40 group-hover:text-text-accent/20 transition-colors leading-[0.8]">
                  {String(steps.length - index).padStart(2, '0')}
                </span>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-text-dark mb-1">{step.name}</h4>
                  <p className="text-xs text-text-accent font-medium italic">
                    {step.ingredient || 'Ingrediente não especificado.'}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 self-center">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMoveStep(index, 'up')} disabled={index === 0} className="p-1 hover:bg-bg-primary border border-border-soft disabled:opacity-20"><MoveUp size={14} /></button>
                    <button onClick={() => handleMoveStep(index, 'down')} disabled={index === steps.length - 1} className="p-1 hover:bg-bg-primary border border-border-soft disabled:opacity-20"><MoveDown size={14} /></button>
                    <button onClick={() => handleDeleteStep(step.id)} className="p-1 hover:bg-red-50 border border-border-soft text-red-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="w-12 h-6 border border-border-soft shadow-inner" style={{ backgroundColor: step.color || '#FFF' }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
