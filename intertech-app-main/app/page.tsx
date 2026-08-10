'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type QueueOrderItem = {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
};

type QueueItem = {
  customerName: string;
  items: QueueOrderItem[];
  createdAt: string;
};

const storageKey = 'intertech-vendedor-queue';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function HomePage() {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState('Cliente Vendedor');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  
  // Carrinho de itens do pedido atual (Multi-produtos)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [status, setStatus] = useState('Carregando catálogo do banco de dados...');

  const decreaseQuantity = () => setSelectedQuantity((current) => Math.max(1, current - 1));
  const increaseQuantity = () => setSelectedQuantity((current) => current + 1);

  const loadCatalog = useCallback(async () => {
    try {
      const response = await fetch('/api/products');

      if (!response.ok) {
        throw new Error('Não foi possível carregar o catálogo do banco.');
      }

      const products = (await response.json()) as Product[];
      setCatalog(products);

      if (products.length > 0) {
        setSelectedProductId((currentId) => currentId || products[0].id);
        setStatus('Catálogo conectado e sincronizado com o banco de dados.');
      } else {
        setStatus('Nenhum produto cadastrado no banco.');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao conectar ao banco.');
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const syncQueue = useCallback(async (ordersToSync: QueueItem[] = queue) => {
    if (typeof window === 'undefined' || !window.navigator.onLine || ordersToSync.length === 0) {
      return;
    }

    setStatus('Sincronizando pedidos pendentes com o banco de dados...');

    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: ordersToSync }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? 'Falha na sincronização com o banco.');
      }

      setQueue([]);
      window.localStorage.setItem(storageKey, JSON.stringify([]));
      setStatus('Fila de pedidos sincronizada com sucesso no banco de dados SQLite.');
      await loadCatalog();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao sincronizar com o banco.');
    }
  }, [queue, loadCatalog]);

  // syncQueue muda de identidade toda vez que "queue" muda (ela depende de
  // "queue"). Guardamos a versão mais atual numa ref pra poder chamá-la lá
  // de baixo sem colocar "syncQueue" nas dependências do efeito de mount —
  // se colocássemos, o efeito rodaria de novo a cada mudança de fila, releria
  // a fila salva do localStorage, chamaria setQueue com um array novo (mesmo
  // que o conteúdo fosse igual) e isso disparava o próprio efeito de novo,
  // num loop infinito ("Maximum update depth exceeded").
  const syncQueueRef = useRef(syncQueue);
  useEffect(() => {
    syncQueueRef.current = syncQueue;
  }, [syncQueue]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsOnline(window.navigator.onLine);
    const savedQueue = window.localStorage.getItem(storageKey);

    if (savedQueue) {
      try {
        const parsed = JSON.parse(savedQueue) as QueueItem[];
        setQueue(parsed);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    const handleConnection = () => {
      const nextOnline = window.navigator.onLine;
      setIsOnline(nextOnline);
      if (nextOnline) {
        void syncQueueRef.current();
      }
    };

    window.addEventListener('online', handleConnection);
    window.addEventListener('offline', handleConnection);

    return () => {
      window.removeEventListener('online', handleConnection);
      window.removeEventListener('offline', handleConnection);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só deve rodar no mount
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(queue));
    }
  }, [queue]);

  const selectedProduct = useMemo(
    () => catalog.find((product) => product.id === selectedProductId) ?? catalog[0] ?? null,
    [catalog, selectedProductId],
  );

  // Adicionar produto selecionado ao carrinho
  const addToCart = () => {
    if (!selectedProduct) return;

    if (selectedProduct.stock < selectedQuantity) {
      setStatus(`Estoque insuficiente para "${selectedProduct.name}". Disponível: ${selectedProduct.stock}`);
      return;
    }

    setCart((currentCart) => {
      const existingIndex = currentCart.findIndex((item) => item.product.id === selectedProduct.id);
      if (existingIndex >= 0) {
        const updated = [...currentCart];
        const newQty = updated[existingIndex].quantity + selectedQuantity;
        if (newQty > selectedProduct.stock) {
          setStatus(`Atenção: A quantidade total no carrinho (${newQty}) excede o estoque (${selectedProduct.stock}).`);
        }
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(newQty, selectedProduct.stock),
        };
        return updated;
      }
      return [...currentCart, { product: selectedProduct, quantity: selectedQuantity }];
    });

    setStatus(`"${selectedProduct.name}" (x${selectedQuantity}) adicionado ao pedido.`);
    setSelectedQuantity(1);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.product.stock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.product.id !== productId));
  };

  // Cálculo total do pedido (soma de todos os itens do carrinho)
  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart],
  );

  // Quantidade total de itens no carrinho
  const totalItemCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart],
  );

  const submitOrder = async () => {
    // Se o carrinho estiver vazio, porém houver um produto selecionado, permite incluir na hora
    let itemsToSubmit = cart;
    if (itemsToSubmit.length === 0 && selectedProduct) {
      if (selectedProduct.stock < selectedQuantity) {
        setStatus(`Estoque insuficiente para "${selectedProduct.name}". Disponível: ${selectedProduct.stock}`);
        return;
      }
      itemsToSubmit = [{ product: selectedProduct, quantity: selectedQuantity }];
    }

    if (itemsToSubmit.length === 0) {
      setStatus('Adicione pelo menos um produto ao pedido antes de registrar.');
      return;
    }

    const payloadItems = itemsToSubmit.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const payload = {
      customerName,
      items: payloadItems,
    };

    try {
      if (!window.navigator.onLine) {
        const offlineItem: QueueItem = {
          customerName,
          items: itemsToSubmit.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            name: i.product.name,
            unitPrice: i.product.price,
          })),
          createdAt: new Date().toISOString(),
        };

        setQueue((currentQueue) => [...currentQueue, offlineItem]);
        setCart([]);
        setStatus(`Pedido com ${itemsToSubmit.length} produto(s) salvo offline. Sincronizará automaticamente com o banco.`);
        return;
      }

      setStatus(`Enviando pedido com ${itemsToSubmit.length} item(ns) para o banco SQLite...`);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? 'Não foi possível gravar o pedido.');
      }

      const responseData = (await response.json()) as { number?: string };
      setCart([]);
      setStatus(`Pedido ${responseData.number ?? ''} com ${itemsToSubmit.length} produto(s) registrado e estoque atualizado!`);
      await loadCatalog();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Erro ao processar o pedido no banco.');
    }
  };

  return (
    <main className="shell">
      <section className="app-frame">
        <header className="hero-card">
          <div className="hero-top">
            <div>
              <div className="brand-badge-container">
                <p className="eyebrow">Intertech System</p>
              </div>
              <h1>Vendedor Offline</h1>
            </div>
            <div className={`connection-pill ${isOnline ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              {isOnline ? 'Banco Conectado' : 'Modo Offline'}
            </div>
          </div>

          <p className="hero-description">
            Terminal oficial de vendas com suporte a <strong>múltiplos produtos por pedido</strong>, gravação transacional no banco de dados SQLite e sincronização offline.
          </p>

          <div className="quick-stats">
            <div className="stat-card">
              <span>Produtos no Pedido</span>
              <strong>{cart.length} produto(s) ({totalItemCount} un.)</strong>
            </div>
            <div className="stat-card">
              <span>Fila offline</span>
              <strong>{queue.length} pedido(s)</strong>
            </div>
            <div className="stat-card">
              <span>Total do Pedido</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          <div className="status-card">
            <div className="status-indicator-icon"></div>
            <div className="status-info">
              <span className="status-label">Status da Conexão / Banco</span>
              <strong>{status}</strong>
            </div>
          </div>
        </header>

        <section className="card">
          <div className="section-title-row">
            <h2>Novo Pedido (Multi-Produtos)</h2>
            <span className="badge">{selectedProduct?.sku ?? 'SKU'}</span>
          </div>

          <div className="summary-grid">
            <div className="summary-item">
              <span>Cliente</span>
              <strong>{customerName || 'Cliente'}</strong>
            </div>
            <div className="summary-item">
              <span>Total de Itens</span>
              <strong>{totalItemCount} unidade(s)</strong>
            </div>
            <div className="summary-item highlight">
              <span>Total do Pedido</span>
              <strong>{formatCurrency(cartTotal)}</strong>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Nome do Cliente</span>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
            </label>

            <label className="field">
              <span>Selecionar Produto</span>
              <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
                {catalog.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Estoque: {product.stock})
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Quantidade</span>
              <div className="quantity-control">
                <button type="button" className="ghost" onClick={decreaseQuantity} aria-label="Diminuir quantidade">
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={selectedQuantity}
                  onChange={(event) => setSelectedQuantity(Math.max(1, Number(event.target.value) || 1))}
                />
                <button type="button" className="ghost" onClick={increaseQuantity} aria-label="Aumentar quantidade">
                  +
                </button>
              </div>
            </label>
          </div>

          {selectedProduct ? (
            <div className="product-meta">
              <span>Categoria: <strong>{selectedProduct.category}</strong> · Preço: <strong>{formatCurrency(selectedProduct.price)}</strong></span>
              <div className="stock-meter">
                <button type="button" className="add-item-btn" onClick={addToCart} disabled={selectedProduct.stock === 0}>
                  + Adicionar ao Pedido
                </button>
              </div>
            </div>
          ) : null}

          {/* Carrinho de produtos selecionados para o cliente */}
          {cart.length > 0 && (
            <div className="cart-container">
              <span className="cart-title">Itens Adicionados ao Pedido ({cart.length})</span>
              <ul className="cart-list">
                {cart.map((item) => (
                  <li key={item.product.id} className="cart-item">
                    <div className="cart-item-info">
                      <strong>{item.product.name}</strong>
                      <span>
                        {formatCurrency(item.product.price)} x {item.quantity} = <strong>{formatCurrency(item.product.price * item.quantity)}</strong>
                      </span>
                    </div>
                    <div className="cart-item-actions">
                      <button
                        type="button"
                        className="ghost"
                        style={{ minHeight: '36px', padding: '4px 10px' }}
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                      >
                        −
                      </button>
                      <strong style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</strong>
                      <button
                        type="button"
                        className="ghost"
                        style={{ minHeight: '36px', padding: '4px 10px' }}
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn-danger-icon"
                        onClick={() => removeFromCart(item.product.id)}
                        title="Remover produto"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="button-stack">
            <button
              type="button"
              onClick={submitOrder}
              disabled={cart.length === 0 && (!selectedProduct || selectedProduct.stock === 0)}
            >
               Finalizar & Registrar Pedido no Banco
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => void syncQueue()}
              disabled={!isOnline || queue.length === 0}
            >
               Sincronizar Fila Offline
            </button>
          </div>
        </section>

        <section className="card">
          <div className="section-title-row">
            <h2>Fila Pendente Offline</h2>
            <span className="badge">{queue.length} pedido(s)</span>
          </div>

          {queue.length === 0 ? (
            <p className="empty-state">Nenhum pedido pendente na fila local.</p>
          ) : (
            <ul className="queue-list">
              {queue.map((item, idx) => (
                <li key={`${item.createdAt}-${idx}`}>
                  <div>
                    <strong>{item.customerName}</strong>
                    <span>
                      {item.items && item.items.length > 0
                        ? item.items.map((i) => `${i.name ?? 'Produto'} (x${i.quantity})`).join(', ')
                        : '1 item'}{' '}
                      · {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <span className="badge">Pendente Sync</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
