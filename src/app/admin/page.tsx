'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Sparkles,
  ClipboardList,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Printer,
  Check,
  X,
  FileImage,
  DollarSign,
  TrendingUp,
  Settings,
  Layers,
  Edit3,
  Save,
  Palette,
  Maximize2,
  Shield,
  HelpCircle,
  Download,
  Clock,
  MapPin,
  Mail,
  Phone,
  User,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  LayoutGrid,
  Sliders,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Ruler,
} from 'lucide-react';
import { CLIPART_CATEGORIES } from '@/data/cliparts';
import {
  AdminOrder,
  OrderStatus,
  ProductDefinition,
  SurfaceDefinition,
  ProductColor,
  CanvasElement,
} from '@/types/configurator';
import { useArtworks } from '@/lib/artworksStore';
import { useProductsStore } from '@/lib/productsStore';
import {
  exportSurfaceProductionAsset,
  exportA3GangSheet,
  downloadBlob,
} from '@/lib/productionExporter';
import { generateCalibrationSheetBlob } from '@/lib/calibrationExporter';
import {
  packDecalsOnA3,
  A3DecalItem,
  A3SheetConfig,
  A3_WIDTH_MM,
  A3_HEIGHT_MM,
  A3_WIDTH_PX_300DPI,
  A3_HEIGHT_PX_300DPI,
} from '@/lib/a3SheetBuilder';

interface A3QueueEntry {
  id: string;
  orderNumber: string;
  productName: string;
  customerName: string;
  surfaceId: string;
  surfaceName: string;
  realWidthMm: number;
  realHeightMm: number;
  widthMm: number;
  heightMm: number;
  elements: CanvasElement[];
  surfaceDef: SurfaceDefinition;
  previewUrl?: string;
  quantity: number;
}


const STATUS_LABELS: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  novo: { label: 'Novo', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  aguardando_pagamento: { label: 'Aguardando Pagamento', bg: 'bg-amber-50', text: 'text-amber-700' },
  pago: { label: 'Pago', bg: 'bg-blue-50', text: 'text-blue-700' },
  arte_aprovada: { label: 'Arte Aprovada', bg: 'bg-teal-50', text: 'text-teal-700' },
  em_producao: { label: 'Em Produção', bg: 'bg-purple-50', text: 'text-purple-700' },
  pronto: { label: 'Pronto', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  entregue: { label: 'Entregue', bg: 'bg-stone-100', text: 'text-stone-700' },
  cancelado: { label: 'Cancelado', bg: 'bg-rose-50', text: 'text-rose-700' },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'artworks'>('orders');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);

  // Filtros Operacionais de Pedidos
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [orderPeriod, setOrderPeriod] = useState<'hoje' | '7d' | '30d' | 'todos'>('todos');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');
  const [orderDetailTab, setOrderDetailTab] = useState<'producao' | 'cliente' | 'timeline'>('producao');
  const [statusNoteInput, setStatusNoteInput] = useState<string>('');
  const [isExportingSurface, setIsExportingSurface] = useState<string | null>(null);

  // Autenticação Real do Painel Admin
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminPasscodeInput, setAdminPasscodeInput] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Status de Infraestrutura Real (Supabase & Storage)
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [storageStatus, setStorageStatus] = useState<'operational' | 'unavailable' | 'checking'>('checking');

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.database?.status === 'connected' ? 'connected' : 'disconnected');
        setStorageStatus(data.storage?.status === 'operational' ? 'operational' : 'unavailable');
      } else {
        setDbStatus('disconnected');
        setStorageStatus('unavailable');
      }
    } catch {
      setDbStatus('disconnected');
      setStorageStatus('unavailable');
    }
  }, []);

  // Busca pedidos da API
  const fetchOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const q = new URLSearchParams();
      if (orderSearch.trim()) q.set('search', orderSearch.trim());
      if (orderPeriod !== 'todos') q.set('period', orderPeriod);
      if (orderStatusFilter !== 'todos') q.set('status', orderStatusFilter);

      const res = await fetch(`/api/orders?${q.toString()}`);
      if (res.status === 401) {
        setIsAdminAuthenticated(false);
        setOrders([]);
        setSelectedOrder(null);
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setIsAdminAuthenticated(true);
        setOrders(data.orders);
        if (data.orders.length > 0) {
          setSelectedOrder((current) => {
            if (!current) return data.orders[0];
            const updated = data.orders.find((o: AdminOrder) => o.id === current.id);
            return updated || data.orders[0];
          });
        } else {
          setSelectedOrder(null);
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar pedidos da API:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [orderSearch, orderPeriod, orderStatusFilter]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAdminLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscodeInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true);
        setAdminPasscodeInput('');
        await Promise.all([fetchOrders(), fetchHealth()]);
      } else {
        setAdminLoginError(data.error || 'Senha de acesso incorreta.');
      }
    } catch {
      setAdminLoginError('Falha de conexão com o servidor.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch {}
    setIsAdminAuthenticated(false);
    setOrders([]);
    setSelectedOrder(null);
  };

  useEffect(() => {
    fetchOrders();
    fetchHealth();
  }, [fetchOrders, fetchHealth]);

  // Atualização de Status com Registro de Linha do Tempo
  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, customNote?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: customNote || statusNoteInput || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        setSelectedOrder(data.order);
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setStatusNoteInput('');
      }
    } catch (e) {
      console.error('Erro ao atualizar status do pedido:', e);
      alert('Falha ao atualizar status do pedido.');
    }
  };

  // Exportação de Arte de Produção em 300 DPI
  const handleExportSurface = async (surfaceDef: SurfaceDefinition, elements: CanvasElement[]) => {
    if (!selectedOrder) return;
    setIsExportingSurface(surfaceDef.id);
    try {
      const result = await exportSurfaceProductionAsset(
        surfaceDef,
        elements,
        selectedOrder.orderNumber
      );
      downloadBlob(result.blob, result.fileName);
    } catch (err) {
      console.error('Erro na exportação 300 DPI:', err);
      alert('Não foi possível gerar a arte de produção.');
    } finally {
      setIsExportingSurface(null);
    }
  };

  // =========================================================================
  // A3 PARA GRÁFICA TERCEIRIZADA — otimização de custo por folha
  // =========================================================================
  const [isA3ModalOpen, setIsA3ModalOpen] = useState<boolean>(false);
  const [a3Queue, setA3Queue] = useState<A3QueueEntry[]>([]);
  const [a3Config, setA3Config] = useState<A3SheetConfig>({
    orientation: 'portrait',
    marginMm: 3,
    spacingMm: 3,
    showCutMarks: false,
    showLabels: false,
  });
  const [a3SelectedSheet, setA3SelectedSheet] = useState<number>(0);
  const [isExportingA3, setIsExportingA3] = useState<boolean>(false);

  const flatA3Items = React.useMemo(() => {
    const flatItems: Omit<A3DecalItem, 'xMm' | 'yMm' | 'sheetIndex'>[] = [];
    a3Queue.forEach((entry) => {
      for (let q = 0; q < entry.quantity; q++) {
        flatItems.push({
          id: `${entry.id}-${q}`,
          orderNumber: entry.orderNumber,
          surfaceId: entry.surfaceId,
          surfaceName: entry.surfaceName,
          realWidthMm: entry.realWidthMm,
          realHeightMm: entry.realHeightMm,
          widthMm: entry.widthMm,
          heightMm: entry.heightMm,
          elements: entry.elements,
          surfaceDef: entry.surfaceDef,
          previewUrl: entry.previewUrl,
        });
      }
    });
    return flatItems;
  }, [a3Queue]);

  // MaxRects reaproveita os vazios entre artes de tamanhos diferentes.
  const packingResult = React.useMemo(
    () => packDecalsOnA3(flatA3Items, a3Config),
    [flatA3Items, a3Config]
  );

  // Compara retrato e paisagem e recomenda a opção que usa menos folhas.
  const orientationRecommendation = React.useMemo(() => {
    if (flatA3Items.length === 0) return a3Config.orientation;

    const portrait = packDecalsOnA3(flatA3Items, { ...a3Config, orientation: 'portrait' });
    const landscape = packDecalsOnA3(flatA3Items, { ...a3Config, orientation: 'landscape' });

    if (portrait.totalSheets !== landscape.totalSheets) {
      return portrait.totalSheets < landscape.totalSheets ? 'portrait' : 'landscape';
    }

    return portrait.utilizationPercentage >= landscape.utilizationPercentage
      ? 'portrait'
      : 'landscape';
  }, [flatA3Items, a3Config.marginMm, a3Config.spacingMm, a3Config.showCutMarks, a3Config.showLabels]);

  // Garante que o índice da folha seja válido ao mudar número total de folhas
  useEffect(() => {
    if (a3SelectedSheet >= packingResult.totalSheets) {
      setA3SelectedSheet(Math.max(0, packingResult.totalSheets - 1));
    }
  }, [packingResult.totalSheets, a3SelectedSheet]);

  // Adiciona todas as superfícies com arte de um pedido à fila A3
  const handleAddOrderToA3 = (order: AdminOrder, autoOpen = false) => {
    const surfacesDefs =
      order.productSnapshot?.surfaces ||
      products.find((p) => p.id === order.item.productId)?.surfaces ||
      [];

    const newEntries: A3QueueEntry[] = [];

    for (const sDef of surfacesDefs) {
      const sCustom = order.item.surfaces[sDef.id];
      const elements = sCustom?.elements || [];
      if (elements.length === 0) continue;

      const pArea = sDef.printableArea;
      const printW = Math.round((pArea.width / sDef.canvasWidth) * sDef.realWidthMm);
      const printH = Math.round((pArea.height / sDef.canvasHeight) * sDef.realHeightMm);

      newEntries.push({
        id: `${order.id}-${sDef.id}`,
        orderNumber: order.orderNumber,
        productName: order.item.productName,
        customerName: order.customer.name,
        surfaceId: sDef.id,
        surfaceName: sDef.name,
        realWidthMm: sDef.realWidthMm,
        realHeightMm: sDef.realHeightMm,
        widthMm: printW > 0 ? printW : sDef.realWidthMm,
        heightMm: printH > 0 ? printH : sDef.realHeightMm,
        elements,
        surfaceDef: sDef,
        previewUrl: sCustom?.previewUrl,
        quantity: order.item.quantity || 1,
      });
    }

    if (newEntries.length === 0) {
      alert('Este pedido não possui artes personalizadas configuradas nas superfícies.');
      return;
    }

    setA3Queue((prev) => {
      const updated = [...prev];
      for (const entry of newEntries) {
        const existingIdx = updated.findIndex((item) => item.id === entry.id);
        if (existingIdx >= 0) {
          updated[existingIdx].quantity += entry.quantity;
        } else {
          updated.push(entry);
        }
      }
      return updated;
    });

    if (autoOpen) {
      setIsA3ModalOpen(true);
    }
  };

  // Adiciona uma única superfície à fila A3
  const handleAddSingleSurfaceToA3 = (
    order: AdminOrder,
    sDef: SurfaceDefinition,
    elements: CanvasElement[]
  ) => {
    if (elements.length === 0) return;
    const sCustom = order.item.surfaces[sDef.id];
    const pArea = sDef.printableArea;
    const printW = Math.round((pArea.width / sDef.canvasWidth) * sDef.realWidthMm);
    const printH = Math.round((pArea.height / sDef.canvasHeight) * sDef.realHeightMm);

    const entryId = `${order.id}-${sDef.id}`;
    setA3Queue((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === entryId);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx].quantity += order.item.quantity || 1;
        return copy;
      }
      return [
        ...prev,
        {
          id: entryId,
          orderNumber: order.orderNumber,
          productName: order.item.productName,
          customerName: order.customer.name,
          surfaceId: sDef.id,
          surfaceName: sDef.name,
          realWidthMm: sDef.realWidthMm,
          realHeightMm: sDef.realHeightMm,
          widthMm: printW > 0 ? printW : sDef.realWidthMm,
          heightMm: printH > 0 ? printH : sDef.realHeightMm,
          elements,
          surfaceDef: sDef,
          previewUrl: sCustom?.previewUrl,
          quantity: order.item.quantity || 1,
        },
      ];
    });
  };

  // Ajusta quantidade de um item na fila A3
  const handleUpdateQueueQuantity = (id: string, delta: number) => {
    setA3Queue((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as A3QueueEntry[]
    );
  };

  // Remove um item da fila A3
  const handleRemoveFromQueue = (id: string) => {
    setA3Queue((prev) => prev.filter((item) => item.id !== id));
  };

  // Exportar Folha A3 atual em 300 DPI nativo
  const handleExportCurrentA3Sheet = async () => {
    const sheetItems = packingResult.placedItems.filter(
      (item) => item.sheetIndex === a3SelectedSheet
    );

    if (sheetItems.length === 0) {
      alert('Esta folha A3 não possui adesivos posicionados.');
      return;
    }

    setIsExportingA3(true);
    try {
      const result = await exportA3GangSheet(sheetItems, a3Config, a3SelectedSheet + 1);
      downloadBlob(result.blob, result.fileName);
    } catch (err) {
      console.error('Erro ao gerar folha A3 em 300 DPI:', err);
      alert('Ocorreu um erro ao gerar a folha A3 em alta resolução.');
    } finally {
      setIsExportingA3(false);
    }
  };

  // Gerador de Folha de Calibração DTF UV (Escala 1:1 • 300 DPI)
  const [isGeneratingCalibration, setIsGeneratingCalibration] = useState<boolean>(false);
  const handleGenerateCalibrationSheet = async () => {
    setIsGeneratingCalibration(true);
    try {
      const { blob, fileName } = await generateCalibrationSheetBlob();
      downloadBlob(blob, fileName);
    } catch (err) {
      console.error('Erro ao gerar folha de calibração:', err);
      alert('Não foi possível gerar a folha de calibração.');
    } finally {
      setIsGeneratingCalibration(false);
    }
  };

  // Dynamic Artworks store
  const {
    artworks,
    addArtwork,
    toggleArtworkStatus,
    deleteArtwork,
    resetToDefaults: resetArtworksToDefaults,
    totalCount: totalArtworksCount,
    activeCount: activeArtworksCount,
  } = useArtworks();

  // Dynamic Products & Surfaces Store
  const {
    products,
    updateProduct,
    toggleProductActive,
    addProduct,
    deleteProduct,
    addSurface,
    updateSurface,
    deleteSurface,
    addColor,
    removeColor,
    resetToDefaults: resetProductsToDefaults,
  } = useProductsStore();

  // Selected product in Products Tab
  const [selectedProductId, setSelectedProductId] = useState<string>('caneca-ceramica-325ml');
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  // Inline product editing form states
  const [editProductName, setEditProductName] = useState(selectedProduct?.name || '');
  const [editProductCategory, setEditProductCategory] = useState(selectedProduct?.category || '');
  const [editBasePrice, setEditBasePrice] = useState(selectedProduct?.basePrice || 29.9);
  const [editSurfacePrice, setEditSurfacePrice] = useState(selectedProduct?.surfaceAdditionalPrice || 5.0);
  const [editPackagingPrice, setEditPackagingPrice] = useState(selectedProduct?.packagingPrice || 9.9);
  const [editDescription, setEditDescription] = useState(selectedProduct?.description || '');
  const [isSavedAlertVisible, setIsSavedAlertVisible] = useState(false);

  // Synchronize edit fields when selected product changes
  React.useEffect(() => {
    if (selectedProduct) {
      setEditProductName(selectedProduct.name);
      setEditProductCategory(selectedProduct.category);
      setEditBasePrice(selectedProduct.basePrice);
      setEditSurfacePrice(selectedProduct.surfaceAdditionalPrice);
      setEditPackagingPrice(selectedProduct.packagingPrice);
      setEditDescription(selectedProduct.description);
    }
  }, [selectedProductId, selectedProduct]);

  // Save product details
  const handleSaveProductDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    updateProduct(selectedProduct.id, {
      name: editProductName,
      category: editProductCategory,
      basePrice: Number(editBasePrice),
      surfaceAdditionalPrice: Number(editSurfacePrice),
      packagingPrice: Number(editPackagingPrice),
      description: editDescription,
    });

    setIsSavedAlertVisible(true);
    setTimeout(() => setIsSavedAlertVisible(false), 2500);
  };

  // Surface Modal states
  const [isSurfaceModalOpen, setIsSurfaceModalOpen] = useState(false);
  const [editingSurface, setEditingSurface] = useState<SurfaceDefinition | null>(null);
  const [surfaceName, setSurfaceName] = useState('');
  const [surfaceDesc, setSurfaceDesc] = useState('');
  const [surfaceRealWidthMm, setSurfaceRealWidthMm] = useState(80);
  const [surfaceRealHeightMm, setSurfaceRealHeightMm] = useState(95);
  const [surfaceCanvasWidth, setSurfaceCanvasWidth] = useState(320);
  const [surfaceCanvasHeight, setSurfaceCanvasHeight] = useState(380);
  const [surfacePrintableX, setSurfacePrintableX] = useState(20);
  const [surfacePrintableY, setSurfacePrintableY] = useState(25);
  const [surfacePrintableWidth, setSurfacePrintableWidth] = useState(280);
  const [surfacePrintableHeight, setSurfacePrintableHeight] = useState(330);
  const [surfaceIsCircle, setSurfaceIsCircle] = useState(false);

  const handleOpenNewSurfaceModal = () => {
    setEditingSurface(null);
    setSurfaceName('Nova Superfície');
    setSurfaceDesc('Área de personalização adicional para DTF UV');
    setSurfaceRealWidthMm(80);
    setSurfaceRealHeightMm(80);
    setSurfaceCanvasWidth(320);
    setSurfaceCanvasHeight(320);
    setSurfacePrintableX(20);
    setSurfacePrintableY(20);
    setSurfacePrintableWidth(280);
    setSurfacePrintableHeight(280);
    setSurfaceIsCircle(false);
    setIsSurfaceModalOpen(true);
  };

  const handleOpenEditSurfaceModal = (s: SurfaceDefinition) => {
    setEditingSurface(s);
    setSurfaceName(s.name);
    setSurfaceDesc(s.description);
    setSurfaceRealWidthMm(s.realWidthMm);
    setSurfaceRealHeightMm(s.realHeightMm);
    setSurfaceCanvasWidth(s.canvasWidth);
    setSurfaceCanvasHeight(s.canvasHeight);
    setSurfacePrintableX(s.printableArea.x);
    setSurfacePrintableY(s.printableArea.y);
    setSurfacePrintableWidth(s.printableArea.width);
    setSurfacePrintableHeight(s.printableArea.height);
    setSurfaceIsCircle(Boolean(s.printableArea.isCircle));
    setIsSurfaceModalOpen(true);
  };

  const handleSaveSurface = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const surfaceData: SurfaceDefinition = {
      id: editingSurface ? editingSurface.id : `surf-${Date.now().toString(36)}`,
      name: surfaceName.trim(),
      description: surfaceDesc.trim(),
      canvasWidth: Number(surfaceCanvasWidth),
      canvasHeight: Number(surfaceCanvasHeight),
      realWidthMm: Number(surfaceRealWidthMm),
      realHeightMm: Number(surfaceRealHeightMm),
      printableArea: {
        x: Number(surfacePrintableX),
        y: Number(surfacePrintableY),
        width: Number(surfacePrintableWidth),
        height: Number(surfacePrintableHeight),
        isCircle: surfaceIsCircle,
        borderRadius: surfaceIsCircle ? Number(surfacePrintableWidth) / 2 : 6,
      },
    };

    if (editingSurface) {
      updateSurface(selectedProduct.id, editingSurface.id, surfaceData);
    } else {
      addSurface(selectedProduct.id, surfaceData);
    }

    setIsSurfaceModalOpen(false);
  };

  // Color Modal states
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#D97706');

  const handleAddColorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !newColorName.trim()) return;

    const newColor: ProductColor = {
      id: `color-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      mockupHex: newColorHex,
      textColor: '#FFFFFF',
    };

    addColor(selectedProduct.id, newColor);
    setIsColorModalOpen(false);
    setNewColorName('');
  };

  // New Product Modal states
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Cerâmica');
  const [newProdBasePrice, setNewProdBasePrice] = useState(39.9);
  const [newProdShortDesc, setNewProdShortDesc] = useState('');

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    const created = addProduct({
      name: newProdName.trim(),
      slug: newProdName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      shortDescription: newProdShortDesc.trim() || 'Personalize com fotos, nomes e artes exclusivas.',
      description: newProdShortDesc.trim(),
      category: newProdCategory,
      basePrice: Number(newProdBasePrice),
      surfaceAdditionalPrice: 5.0,
      packagingPrice: 9.9,
      defaultColor: 'white',
      availableColors: [
        {
          id: 'white',
          name: 'Branca',
          hex: '#FFFFFF',
          mockupHex: '#F8FAFC',
          textColor: '#1E293B',
        },
      ],
      isActive: true,
      surfaces: [
        {
          id: 'front',
          name: 'Área Principal',
          description: 'Superfície frontal de personalização',
          canvasWidth: 320,
          canvasHeight: 340,
          realWidthMm: 80,
          realHeightMm: 85,
          printableArea: {
            x: 20,
            y: 20,
            width: 280,
            height: 300,
            borderRadius: 6,
          },
        },
      ],
    });

    setSelectedProductId(created.id);
    setIsNewProductModalOpen(false);
    setNewProdName('');
    setNewProdShortDesc('');
  };

  // Artworks Filtering state
  const [artworkCategoryFilter, setArtworkCategoryFilter] = useState<string>('Todos');
  const [artworkStatusFilter, setArtworkStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [artworkSearchQuery, setArtworkSearchQuery] = useState<string>('');

  // Upload Modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [newArtTitle, setNewArtTitle] = useState<string>('');
  const [newArtCategory, setNewArtCategory] = useState<string>('Amor');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');
  const [newArtIsActive, setNewArtIsActive] = useState<boolean>(true);
  const [newArtFilePreview, setNewArtFilePreview] = useState<string | null>(null);
  const [newArtFileType, setNewArtFileType] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validFormats = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!validFormats.includes(file.type) && !file.name.endsWith('.svg')) {
      setUploadError('Formato inválido. Por favor envie arquivos em SVG, PNG, JPG ou WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Arquivo muito pesado. O limite máximo é 5MB.');
      return;
    }

    setNewArtFileType(file.type || 'image/svg+xml');

    if (!newArtTitle) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setNewArtTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewArtFilePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit new artwork
  const handleCreateArtwork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArtFilePreview) {
      setUploadError('Por favor selecione um arquivo de imagem ou vetor SVG.');
      return;
    }
    if (!newArtTitle.trim()) {
      setUploadError('Por favor preencha o nome da arte.');
      return;
    }

    const finalCategory =
      newArtCategory === 'Outra' && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : newArtCategory;

    addArtwork({
      title: newArtTitle.trim(),
      category: finalCategory,
      svgDataUri: newArtFilePreview,
      isActive: newArtIsActive,
      fileType: newArtFileType,
    });

    setIsUploadModalOpen(false);
    setNewArtTitle('');
    setNewArtFilePreview(null);
    setNewArtIsActive(true);
    setCustomCategoryInput('');
    setUploadError(null);
  };

  // Filter artworks
  const filteredArtworks = artworks.filter((item) => {
    const matchCategory =
      artworkCategoryFilter === 'Todos' || item.category === artworkCategoryFilter;
    const matchStatus =
      artworkStatusFilter === 'all'
        ? true
        : artworkStatusFilter === 'active'
        ? item.isActive
        : !item.isActive;
    const matchSearch =
      item.title.toLowerCase().includes(artworkSearchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(artworkSearchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-800 flex flex-col">
      {/* 1. TOP ADMIN BAR */}
      <header className="bg-[#1C1917] text-white px-4 sm:px-8 py-4 border-b border-stone-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="Voltar à Loja"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#C25E48] text-sm tracking-wider uppercase font-serif">
                Montuá
              </span>
              <span className="text-stone-600">|</span>
              <h1 className="font-bold text-white text-base">Painel de Gestão</h1>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Controle de pedidos, engenharia de produção DTF UV e catálogo de artes
            </p>
          </div>
        </div>

        {/* Actions & Tab Switcher */}
        <div className="flex items-center gap-3">
          {/* Indicadores Reais de Infraestrutura Supabase & Storage */}
          <div className="hidden xl:flex items-center gap-2.5 text-xs bg-stone-900/90 px-3 py-1.5 rounded-xl border border-stone-800 shadow-inner">
            <div className="flex items-center gap-1.5" title={dbStatus === 'connected' ? 'PostgreSQL Supabase conectado e operacional' : 'Banco de dados não conectado'}>
              <span className="text-stone-400 font-medium">Banco:</span>
              {dbStatus === 'connected' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  🟢 Supabase conectado
                </span>
              ) : dbStatus === 'checking' ? (
                <span className="text-stone-400">Verificando...</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  🔴 Banco não conectado
                </span>
              )}
            </div>
            <span className="text-stone-700">|</span>
            <div className="flex items-center gap-1.5" title={storageStatus === 'operational' ? 'Buckets do Supabase Storage ativos' : 'Storage indisponível'}>
              <span className="text-stone-400 font-medium">Storage:</span>
              {storageStatus === 'operational' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  🟢 Operacional
                </span>
              ) : storageStatus === 'checking' ? (
                <span className="text-stone-400">Verificando...</span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  🔴 Indisponível
                </span>
              )}
            </div>
          </div>

          {/* Teste opcional de escala para conferência com a gráfica */}
          <button
            type="button"
            disabled={isGeneratingCalibration}
            onClick={handleGenerateCalibrationSheet}
            className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all cursor-pointer"
            title="Gerar teste opcional de escala 1:1 para conferência com a gráfica"
          >
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">{isGeneratingCalibration ? 'Gerando...' : 'Teste de escala'}</span>
          </button>

          {/* Botão de Abertura do Montador de Folha A3 */}
          <button
            type="button"
            onClick={() => setIsA3ModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-[#C25E48] hover:bg-[#a94f3b] text-white shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            title="Montar arquivo A3 otimizado para envio à gráfica"
          >
            <LayoutGrid className="w-4 h-4 text-white" />
            <span className="hidden md:inline">A3 para Gráfica</span>
            <span className="md:hidden">Folha A3</span>
            {a3Queue.length > 0 && (
              <span className="bg-white text-[#C25E48] text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5">
                {a3Queue.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-stone-800/90 p-1 rounded-2xl border border-stone-700">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'products' ? 'bg-[#C25E48] text-white shadow-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
            <Package className="w-4 h-4" />
            <span>Produtos & Superfícies ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'artworks' ? 'bg-[#C25E48] text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Gestão de Artes ({totalArtworksCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'orders' ? 'bg-[#C25E48] text-white shadow-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pedidos ({orders.length})</span>
          </button>

          {/* Botão de Logout */}
          <button
            type="button"
            onClick={handleAdminLogout}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="Encerrar sessão administrativa"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>

      {/* BLOQUEIO DE SEGURANÇA: LOGIN ADMINISTRATIVO SE NÃO AUTENTICADO */}
      {!isAdminAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6 my-auto">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-stone-200 shadow-xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-stone-900 font-serif">Acesso Administrativo</h2>
              <p className="text-xs text-stone-500 mt-1">
                Área restrita de gestão de pedidos, engenharia e produção DTF UV.
              </p>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Senha de Acesso Operacional
                </label>
                <input
                  type="password"
                  value={adminPasscodeInput}
                  onChange={(e) => setAdminPasscodeInput(e.target.value)}
                  placeholder="Digite a senha administrativa..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#C25E48] text-sm"
                  required
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Dica de acesso: <code>admin123</code>
                </span>
              </div>
              {adminLoginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                  {adminLoginError}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 bg-[#C25E48] hover:bg-[#a94f3b] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Verificando credencial...' : 'Acessar Painel de Produção'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* 2. EXECUTIVE METRIC CARDS */}
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {activeTab === 'orders' ? (
          <>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Pedidos Hoje
                </span>
                <span className="text-xl font-black text-stone-900">
                  {orders.filter((o) => Date.now() - new Date(o.createdAt).getTime() <= 86400000).length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Aguardando Pagamento
                </span>
                <span className="text-xl font-black text-amber-700">
                  {orders.filter((o) => o.status === 'aguardando_pagamento' || o.status === 'novo').length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Em Produção
                </span>
                <span className="text-xl font-black text-purple-700">
                  {orders.filter((o) => o.status === 'em_producao').length}
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Prontos
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {orders.filter((o) => o.status === 'pronto').length}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Produtos Ativos na Loja
                </span>
                <span className="text-xl font-black text-stone-900">
                  {products.filter((p) => p.isActive).length}{' '}
                  <span className="text-xs text-stone-400 font-normal">/ {products.length}</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Superfícies de Caneca
                </span>
                <span className="text-xl font-black text-stone-900">
                  {products.find((p) => p.slug === 'caneca')?.surfaces.length || 4} áreas
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Artes DTF UV Ativas
                </span>
                <span className="text-xl font-black text-stone-900">
                  {activeArtworksCount}{' '}
                  <span className="text-xs text-stone-400 font-normal">/ {totalArtworksCount}</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block">
                  Faturamento Previsto
                </span>
                <span className="text-xl font-black text-stone-900">
                  R${' '}
                  {orders
                    .reduce((acc, o) => acc + o.item.totalPrice, 0)
                    .toFixed(2)
                    .replace('.', ',')}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ================================================================ */}
        {/* TAB: PRODUTOS E ENGENHARIA DE SUPERFÍCIES (COMPLETO)             */}
        {/* ================================================================ */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Top Bar for Products */}
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C25E48]" />
                  Catálogo & Engenharia de Produtos e Superfícies
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure preços, cores, áreas imprimíveis e cadastre novas superfícies independentes para qualquer produto físico.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={resetProductsToDefaults}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Restaurar catálogo original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(true)}
                  className="px-5 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Produto</span>
                </button>
              </div>
            </div>

            {/* Master-Detail Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: LISTA DE PRODUTOS */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Produtos ({products.length})
                  </span>
                  <span className="text-[11px] text-stone-400">Clique para gerenciar</span>
                </div>

                <div className="space-y-2">
                  {products.map((p) => {
                    const isSelected = p.id === selectedProductId;

                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#C25E48] bg-[#FAF8F5] shadow-xs ring-1 ring-[#C25E48]/20'
                            : 'border-stone-200/80 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-stone-900 text-sm">{p.name}</span>

                          {/* Quick Toggle Status */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductActive(p.id);
                            }}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                              p.isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                            title="Clique para alternar entre Ativo e Em breve"
                          >
                            {p.isActive ? 'Ativo na Loja' : 'Em breve'}
                          </button>
                        </div>

                        <div className="text-xs text-stone-500 flex justify-between">
                          <span>{p.category}</span>
                          <span className="font-bold text-stone-900">
                            R$ {p.basePrice.toFixed(2).replace('.', ',')}
                          </span>
                        </div>

                        <div className="text-[11px] text-stone-400 mt-1 flex justify-between pt-1 border-t border-stone-100">
                          <span>{p.surfaces.length} superfícies</span>
                          <span>{p.availableColors.length} cores</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT COLUMN: DETALHES COMPLETOS DO PRODUTO SELECIONADO */}
              {selectedProduct && (
                <div className="lg:col-span-8 space-y-6">
                  {/* PAINEL 1: DADOS COMERCIAIS & PREÇOS */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C25E48] tracking-wider block">
                          Edição Comercial
                        </span>
                        <h3 className="text-lg font-black text-stone-900 font-serif">
                          {selectedProduct.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSavedAlertVisible && (
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                            <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            selectedProduct.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedProduct.isActive ? 'Disponível no Site' : 'Marcado como Em breve'}
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleSaveProductDetails} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Nome do Produto
                          </label>
                          <input
                            type="text"
                            value={editProductName}
                            onChange={(e) => setEditProductName(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Categoria
                          </label>
                          <input
                            type="text"
                            value={editProductCategory}
                            onChange={(e) => setEditProductCategory(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                            required
                          />
                        </div>
                      </div>

                      {/* Prices Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200">
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Preço Base (R$)
                          </label>
                          <input
                            type="number"
                            step="0.10"
                            value={editBasePrice}
                            onChange={(e) => setEditBasePrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                            required
                          />
                          <span className="text-[10px] text-stone-400">Inclui 1 superfície</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Superfície Adicional (R$)
                          </label>
                          <input
                            type="number"
                            step="0.10"
                            value={editSurfacePrice}
                            onChange={(e) => setEditSurfacePrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                            required
                          />
                          <span className="text-[10px] text-stone-400">Cobrado a partir da 2ª</span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Embalagem Especial (R$)
                          </label>
                          <input
                            type="number"
                            step="0.10"
                            value={editPackagingPrice}
                            onChange={(e) => setEditPackagingPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                            required
                          />
                          <span className="text-[10px] text-stone-400">Caixa com laço</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Descrição do Produto
                        </label>
                        <textarea
                          rows={2}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Salvar Preços e Dados</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* PAINEL 2: GESTÃO DE SUPERFÍCIES DTF UV */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#C25E48]" />
                          <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                            Superfícies de Personalização ({selectedProduct.surfaces.length})
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Cada superfície possui dimensões reais em mm, área do canvas e limites seguros de impressão DTF UV.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenNewSurfaceModal}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Superfície</span>
                      </button>
                    </div>

                    {/* Surfaces Cards List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {selectedProduct.surfaces.map((s) => (
                        <div
                          key={s.id}
                          className="p-4 rounded-2xl border border-stone-200 bg-[#FAF8F5] space-y-2.5 relative group hover:border-[#C25E48]/30 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-sm">{s.name}</span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditSurfaceModal(s)}
                                className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-white rounded-lg transition-colors"
                                title="Editar medidas da superfície"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {selectedProduct.surfaces.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => deleteSurface(selectedProduct.id, s.id)}
                                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                                  title="Remover superfície"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-stone-500">{s.description}</p>

                          <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-xl border border-stone-100">
                            <div>
                              <span className="text-stone-400 block font-semibold">Tamanho Real (Peça)</span>
                              <span className="font-bold text-stone-800">
                                {s.realWidthMm} x {s.realHeightMm} mm
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-400 block font-semibold">Área Imprimível</span>
                              <span className="font-bold text-[#C25E48]">
                                {s.printableArea.width} x {s.printableArea.height} px{' '}
                                {s.printableArea.isCircle && '(Circular)'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PAINEL 3: CORES DO PRODUTO */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[#C25E48]" />
                          <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                            Cores Disponíveis ({selectedProduct.availableColors.length})
                          </h4>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Cores físicas disponíveis no estoque para seleção pelo cliente.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsColorModalOpen(true)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Cor</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {selectedProduct.availableColors.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 bg-[#FAF8F5] text-xs font-semibold"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-stone-300"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                          {selectedProduct.availableColors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColor(selectedProduct.id, c.id)}
                              className="text-stone-400 hover:text-rose-600 ml-1"
                              title="Remover cor"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB: GESTÃO DE ARTES                                             */}
        {/* ================================================================ */}
        {activeTab === 'artworks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif">
                  Biblioteca de Artes e Vetores DTF UV
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Adicione artes através de arquivos (SVG, PNG, WEBP) e controle quais ficam disponíveis para os clientes no configurador.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={resetArtworksToDefaults}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Restaurar artes originais do sistema"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrões</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-5 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Nova Arte (Upload)</span>
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={artworkSearchQuery}
                  onChange={(e) => setArtworkSearchQuery(e.target.value)}
                  placeholder="Pesquisar artes..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setArtworkStatusFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      artworkStatusFilter === 'all'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Todas ({totalArtworksCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArtworkStatusFilter('active')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      artworkStatusFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-500 hover:text-emerald-700'
                    }`}
                  >
                    Ativas ({activeArtworksCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setArtworkStatusFilter('inactive')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      artworkStatusFilter === 'inactive'
                        ? 'bg-stone-700 text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Desativadas ({totalArtworksCount - activeArtworksCount})
                  </button>
                </div>

                <select
                  value={artworkCategoryFilter}
                  onChange={(e) => setArtworkCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-white text-stone-700 focus:outline-none focus:border-[#C25E48]"
                >
                  <option value="Todos">Todas as Categorias</option>
                  {CLIPART_CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Artworks Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredArtworks.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                    item.isActive
                      ? 'border-stone-200 hover:border-[#C25E48]/40 shadow-xs'
                      : 'border-stone-200 bg-stone-50/70 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {item.isActive ? 'Ativo' : 'Desativado'}
                      </span>

                      <button
                        type="button"
                        onClick={() => deleteArtwork(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Excluir arte da biblioteca"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="aspect-square rounded-xl bg-[#FAF8F5] border border-stone-100 flex items-center justify-center p-3 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.svgDataUri}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    <h3 className="font-bold text-stone-900 text-xs truncate" title={item.title}>
                      {item.title}
                    </h3>
                    <span className="text-[10px] text-stone-400 font-medium block truncate">
                      {item.category}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-stone-100 mt-3">
                    <button
                      type="button"
                      onClick={() => toggleArtworkStatus(item.id)}
                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        item.isActive
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-stone-500" />
                          <span>Desativar</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ativar Arte</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* TAB: PEDIDOS & FICHA DE PRODUÇÃO (OPERACIONAL COMPLETO)           */}
        {/* ================================================================ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* 1. BARRA DE FILTROS E BUSCA OPERACIONAL */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Buscar por PED-XXXX, nome ou telefone..."
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-semibold focus:outline-none focus:border-[#C25E48]"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="novo">Novo</option>
                  <option value="aguardando_pagamento">Aguardando Pagamento</option>
                  <option value="pago">Pago</option>
                  <option value="arte_aprovada">Arte Aprovada</option>
                  <option value="em_producao">Em Produção</option>
                  <option value="pronto">Pronto</option>
                  <option value="entregue">Entregue</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              {/* Filtro por Período */}
              <div className="flex items-center gap-1.5 self-start md:self-auto bg-stone-100 p-1 rounded-xl">
                {(['hoje', '7d', '30d', 'todos'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setOrderPeriod(period)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      orderPeriod === period
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {period === 'hoje'
                      ? 'Hoje'
                      : period === '7d'
                      ? '7 dias'
                      : period === '30d'
                      ? '30 dias'
                      : 'Todos'}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={fetchOrders}
                  className="p-1.5 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
                  title="Atualizar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* 2. GRID PRINCIPAL: LISTA + DETALHES DE PRODUÇÃO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Coluna Esquerda: Lista de Pedidos */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h2 className="font-bold text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-[#C25E48]" />
                    Pedidos Cadastrados
                  </h2>
                  <span className="text-xs text-stone-400 font-bold">{orders.length} pedidos</span>
                </div>

                <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs">
                      Nenhum pedido encontrado para os filtros selecionados.
                    </div>
                  ) : (
                    orders.map((o) => {
                      const isSelected = selectedOrder?.id === o.id;
                      const st = STATUS_LABELS[o.status] || {
                        label: o.status,
                        bg: 'bg-stone-100',
                        text: 'text-stone-700',
                      };
                      const orderTime = new Date(o.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const orderDate = new Date(o.createdAt).toLocaleDateString('pt-BR');

                      return (
                        <div
                          key={o.id}
                          onClick={() => setSelectedOrder(o)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#C25E48] bg-[#FAF8F5] shadow-xs ring-1 ring-[#C25E48]/20'
                              : 'border-stone-200/80 bg-white hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-stone-900 text-sm font-mono tracking-wide">
                              {o.orderNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}
                            >
                              {st.label}
                            </span>
                          </div>

                          <div className="text-xs text-stone-700 font-medium flex justify-between">
                            <span>{o.customer.name}</span>
                            <span className="font-bold text-stone-900">
                              R$ {o.item.totalPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-400 mt-1 flex justify-between items-center">
                            <span>
                              {o.item.productName} • {o.item.color.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              {orderDate} {orderTime}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Coluna Direita: Ficha de Produção & Detalhes */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-5">
                {selectedOrder ? (
                  <>
                    {/* Header do Pedido Selecionado */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-stone-900 text-xl font-serif">
                            Pedido {selectedOrder.orderNumber}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              STATUS_LABELS[selectedOrder.status]?.bg || 'bg-stone-100'
                            } ${STATUS_LABELS[selectedOrder.status]?.text || 'text-stone-700'}`}
                          >
                            {STATUS_LABELS[selectedOrder.status]?.label || selectedOrder.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Cliente: <strong>{selectedOrder.customer.name}</strong> •{' '}
                          {selectedOrder.customer.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddOrderToA3(selectedOrder, true)}
                          className="px-3.5 py-2 rounded-xl bg-[#C25E48] hover:bg-[#a94f3b] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-[0.98]"
                          title="Montar Folha A3 de Impressão DTF UV com os adesivos deste pedido"
                        >
                          <LayoutGrid className="w-4 h-4 text-white" />
                          <span>Montar Folha A3</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Imprimir Ficha de Corte A4"
                        >
                          <Printer className="w-4 h-4 text-[#C25E48]" />
                          <span>Imprimir Ficha</span>
                        </button>

                        <button
                          type="button"
                          disabled={isGeneratingCalibration}
                          onClick={handleGenerateCalibrationSheet}
                          className="px-3 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Gerar teste opcional de escala 1:1 para conferência com a gráfica"
                        >
                          <Ruler className="w-4 h-4 text-amber-600" />
                          <span>Calibração</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tabs do Pedido */}
                    <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
                      <button
                        type="button"
                        onClick={() => setOrderDetailTab('producao')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          orderDetailTab === 'producao'
                            ? 'bg-[#C25E48] text-white shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Produção DTF UV
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderDetailTab('cliente')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          orderDetailTab === 'cliente'
                            ? 'bg-[#C25E48] text-white shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Cliente & Entrega
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderDetailTab('timeline')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          orderDetailTab === 'timeline'
                            ? 'bg-[#C25E48] text-white shadow-xs'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        Histórico & Status ({selectedOrder.statusHistory?.length || 1})
                      </button>
                    </div>

                    {/* CONTEÚDO TAB: PRODUÇÃO DTF UV */}
                    {orderDetailTab === 'producao' && (
                      <div className="space-y-5">
                        {/* Resumo Rápido */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 text-xs">
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Produto
                            </span>
                            <span className="font-bold text-stone-800">
                              {selectedOrder.item.productName}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Cor
                            </span>
                            <span className="font-bold text-stone-800">
                              {selectedOrder.item.color.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Quantidade
                            </span>
                            <span className="font-bold text-stone-800">
                              {selectedOrder.item.quantity} un.
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px] uppercase font-bold">
                              Embalagem
                            </span>
                            <span className="font-bold text-stone-800">
                              {selectedOrder.item.includePackaging
                                ? 'Caixa Especial Presente'
                                : 'Padrão'}
                            </span>
                          </div>
                        </div>

                        {/* Detalhamento das Superfícies & Download 300 DPI */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                              Artes por Superfície (Escala Real em mm)
                            </h4>
                            <span className="text-[11px] text-stone-400">
                              Exportação em 300 DPI com fundo transparente
                            </span>
                          </div>

                          <div className="space-y-4">
                            {(
                              selectedOrder.productSnapshot?.surfaces || selectedProduct.surfaces
                            ).map((sDef) => {
                              const sCustom = selectedOrder.item.surfaces[sDef.id];
                              const elements = sCustom?.elements || [];
                              const hasArt = elements.length > 0;
                              const pArea = sDef.printableArea;
                              const printW = Math.round(
                                (pArea.width / sDef.canvasWidth) * sDef.realWidthMm
                              );
                              const printH = Math.round(
                                (pArea.height / sDef.canvasHeight) * sDef.realHeightMm
                              );

                              return (
                                <div
                                  key={sDef.id}
                                  className={`p-4 rounded-2xl border transition-all ${
                                    hasArt
                                      ? 'border-[#C25E48]/30 bg-white shadow-xs'
                                      : 'border-stone-200 bg-stone-50/60 opacity-60'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-stone-900 text-sm">
                                          Superfície: {sDef.name}
                                        </span>
                                        <span
                                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            hasArt
                                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                              : 'bg-stone-100 text-stone-500'
                                          }`}
                                        >
                                          {hasArt ? `${elements.length} elemento(s)` : 'Sem arte'}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-stone-500 mt-0.5">
                                        Área Física: {sDef.realWidthMm} × {sDef.realHeightMm} mm • Área Imprimível DTF UV: {printW} × {printH} mm
                                      </p>
                                    </div>

                                    {hasArt && (
                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleAddSingleSurfaceToA3(selectedOrder, sDef, elements)}
                                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                          title="Adicionar esta arte à fila de impressão da Folha A3"
                                        >
                                          <Plus className="w-3.5 h-3.5 text-[#C25E48]" />
                                          <span>+ Fila A3 ({selectedOrder.item.quantity} un)</span>
                                        </button>

                                        <button
                                          type="button"
                                          disabled={isExportingSurface === sDef.id}
                                          onClick={() => handleExportSurface(sDef, elements)}
                                          className="px-3 py-1.5 bg-[#C25E48] hover:bg-[#a94f3b] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                                        >
                                          <Download className="w-3.5 h-3.5" />
                                          <span>
                                            {isExportingSurface === sDef.id
                                              ? 'Renderizando...'
                                              : 'Baixar Arte (300 DPI)'}
                                          </span>
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {/* Preview e Métricas Físicas dos Elementos */}
                                  {hasArt ? (
                                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                      {sCustom?.previewUrl && (
                                        <div className="sm:col-span-3 aspect-[4/5] rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center p-1">
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={sCustom.previewUrl}
                                            alt={sDef.name}
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                      )}

                                      <div className={`${sCustom?.previewUrl ? 'sm:col-span-9' : 'sm:col-span-12'} space-y-1.5`}>
                                        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                                          Posições Físicas para Aplicação:
                                        </span>
                                        <div className="grid grid-cols-1 gap-1.5 text-xs text-stone-700">
                                          {elements.map((el, i) => {
                                            const metric = sCustom?.metrics?.[el.id];
                                            const elW = metric?.widthMm || Math.round((el.width / sDef.canvasWidth) * sDef.realWidthMm);
                                            const elH = metric?.heightMm || Math.round((el.height / sDef.canvasHeight) * sDef.realHeightMm);
                                            const elX = metric?.xMm || Math.round((el.x / sDef.canvasWidth) * sDef.realWidthMm);
                                            const elY = metric?.yMm || Math.round((el.y / sDef.canvasHeight) * sDef.realHeightMm);

                                            return (
                                              <div
                                                key={el.id || i}
                                                className="p-2 rounded-xl bg-[#FAF8F5] border border-stone-200/80 flex items-center justify-between"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                                                    #{i + 1}
                                                  </span>
                                                  <span className="font-semibold text-stone-800 capitalize">
                                                    {el.type === 'text'
                                                      ? `Texto: "${(el as any).text || ''}"`
                                                      : el.type === 'image'
                                                      ? 'Foto / Imagem'
                                                      : 'Ilustração'}
                                                  </span>
                                                </div>

                                                <div className="text-[11px] text-stone-600 space-x-2 font-mono">
                                                  <span>
                                                    Tam: <strong>{elW}×{elH}mm</strong>
                                                  </span>
                                                  <span>
                                                    Pos: <strong>X:{elX} Y:{elY}mm</strong>
                                                  </span>
                                                  <span>
                                                    Rot: <strong>{Math.round(el.rotation || 0)}°</strong>
                                                  </span>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="pt-2 text-xs text-stone-400 italic">
                                      Nenhum elemento adicionado pelo cliente nesta face.
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO TAB: CLIENTE & ENTREGA */}
                    {orderDetailTab === 'cliente' && (
                      <div className="space-y-4">
                        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-stone-200 space-y-3">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Dados de Contato e Entrega
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-stone-400" />
                              <span>
                                Nome: <strong>{selectedOrder.customer.name}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-stone-400" />
                              <span>
                                WhatsApp:{' '}
                                <a
                                  href={`https://wa.me/55${selectedOrder.customer.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 font-bold hover:underline"
                                >
                                  {selectedOrder.customer.phone}
                                </a>
                              </span>
                            </div>
                            {selectedOrder.customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-stone-400" />
                                <span>
                                  E-mail: <strong>{selectedOrder.customer.email}</strong>
                                </span>
                              </div>
                            )}
                            {selectedOrder.customer.cep && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-stone-400" />
                                <span>
                                  CEP: <strong>{selectedOrder.customer.cep}</strong>
                                </span>
                              </div>
                            )}
                          </div>

                          {selectedOrder.customer.address && (
                            <div className="pt-2 border-t border-stone-200 text-xs">
                              <span className="text-stone-500 font-medium">Endereço de Entrega:</span>
                              <p className="font-semibold text-stone-800 mt-0.5">
                                {selectedOrder.customer.address}
                              </p>
                            </div>
                          )}

                          {selectedOrder.customer.notes && (
                            <div className="pt-2 border-t border-stone-200 text-xs">
                              <span className="text-stone-500 font-medium">Observações do Cliente:</span>
                              <p className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 mt-1 italic">
                                &ldquo;{selectedOrder.customer.notes}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Detalhamento Financeiro Seguro */}
                        <div className="bg-white p-5 rounded-2xl border border-stone-200 space-y-2 text-xs">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                            Composição de Preço (Recalculado no Servidor)
                          </h4>
                          <div className="flex justify-between text-stone-600">
                            <span>Preço Base do Produto ({selectedOrder.item.productName}):</span>
                            <span>R$ {selectedOrder.item.basePrice.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex justify-between text-stone-600">
                            <span>Superfícies Adicionais:</span>
                            <span>
                              + R$ {selectedOrder.item.additionalSurfacesPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          {selectedOrder.item.includePackaging && (
                            <div className="flex justify-between text-stone-600">
                              <span>Embalagem Presente Especial:</span>
                              <span>
                                + R$ {selectedOrder.item.packagingPrice.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-stone-600 font-semibold pt-1 border-t border-stone-100">
                            <span>Valor Unitário:</span>
                            <span>R$ {selectedOrder.item.unitPrice.toFixed(2).replace('.', ',')}</span>
                          </div>
                          <div className="flex justify-between text-base font-black text-stone-900 pt-2 border-t border-stone-200">
                            <span>Total Geral ({selectedOrder.item.quantity} un.):</span>
                            <span className="text-[#C25E48]">
                              R$ {selectedOrder.item.totalPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CONTEÚDO TAB: HISTÓRICO & STATUS */}
                    {orderDetailTab === 'timeline' && (
                      <div className="space-y-5">
                        {/* Seletor de Novo Status */}
                        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone-200 space-y-3">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Atualizar Status do Pedido
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                Próximo Status
                              </label>
                              <select
                                value={selectedOrder.status}
                                onChange={(e) =>
                                  handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)
                                }
                                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#C25E48]"
                              >
                                <option value="novo">Novo</option>
                                <option value="aguardando_pagamento">Aguardando Pagamento</option>
                                <option value="pago">Pago</option>
                                <option value="arte_aprovada">Arte Aprovada</option>
                                <option value="em_producao">Em Produção</option>
                                <option value="pronto">Pronto</option>
                                <option value="entregue">Entregue</option>
                                <option value="cancelado">Cancelado</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                                Anotação Interna (opcional)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={statusNoteInput}
                                  onChange={(e) => setStatusNoteInput(e.target.value)}
                                  placeholder="Ex: Pagamento Pix recebido no WhatsApp..."
                                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#C25E48]"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateStatus(
                                      selectedOrder.id,
                                      selectedOrder.status,
                                      statusNoteInput
                                    )
                                  }
                                  className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                                >
                                  Gravar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Linha do Tempo Visual */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Linha do Tempo de Alterações
                          </h4>
                          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                            {(selectedOrder.statusHistory || []).map((log, idx) => {
                              const logTime = new Date(log.createdAt).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              });
                              const logDate = new Date(log.createdAt).toLocaleDateString('pt-BR');
                              const toSt = STATUS_LABELS[log.toStatus] || {
                                label: log.toStatus,
                                bg: 'bg-stone-100',
                                text: 'text-stone-700',
                              };

                              return (
                                <div key={log.id || idx} className="relative">
                                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#C25E48] border-2 border-white shadow-xs" />
                                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs">
                                    <div className="flex items-center justify-between">
                                      <span
                                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${toSt.bg} ${toSt.text}`}
                                      >
                                        {toSt.label}
                                      </span>
                                      <span className="text-[10px] text-stone-400">
                                        {logDate} às {logTime}
                                      </span>
                                    </div>
                                    {log.notes && (
                                      <p className="text-stone-600 mt-1.5 font-medium">{log.notes}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16 text-stone-400 text-xs">
                    Selecione um pedido na lista ao lado para inspecionar e produzir.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      </>
      )}

      {/* ================================================================ */}
      {/* MODAL: CADASTRAR / EDITAR SUPERFÍCIE                             */}
      {/* ================================================================ */}
      {isSurfaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    {editingSurface ? 'Editar Superfície' : 'Cadastrar Nova Superfície'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Defina medidas reais em mm e limites da área imprimível DTF UV
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSurfaceModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSurface} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Superfície
                </label>
                <input
                  type="text"
                  value={surfaceName}
                  onChange={(e) => setSurfaceName(e.target.value)}
                  placeholder="Ex: Frente, Verso, Alça, Lateral Direita, Tampa..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição da Superfície
                </label>
                <input
                  type="text"
                  value={surfaceDesc}
                  onChange={(e) => setSurfaceDesc(e.target.value)}
                  placeholder="Ex: Área frontal principal para fotos e dedicatórias"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                />
              </div>

              {/* Real Dimensions in mm */}
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block">
                  Dimensões Reais da Peça Físico (Milímetros)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">Largura Real (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={surfaceRealWidthMm}
                      onChange={(e) => setSurfaceRealWidthMm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-500 mb-0.5">Altura Real (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={surfaceRealHeightMm}
                      onChange={(e) => setSurfaceRealHeightMm(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Printable Area Dimensions */}
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800">
                    Área Imprimível DTF UV (Pixels de Impressão)
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={surfaceIsCircle}
                      onChange={(e) => setSurfaceIsCircle(e.target.checked)}
                      className="accent-[#C25E48] rounded"
                    />
                    <span>Formato Circular</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-stone-500 block mb-0.5">Largura da Área (px)</label>
                    <input
                      type="number"
                      value={surfacePrintableWidth}
                      onChange={(e) => setSurfacePrintableWidth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-0.5">Altura da Área (px)</label>
                    <input
                      type="number"
                      value={surfacePrintableHeight}
                      onChange={(e) => setSurfacePrintableHeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-0.5">Deslocamento X (px)</label>
                    <input
                      type="number"
                      value={surfacePrintableX}
                      onChange={(e) => setSurfacePrintableX(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-500 block mb-0.5">Deslocamento Y (px)</label>
                    <input
                      type="number"
                      value={surfacePrintableY}
                      onChange={(e) => setSurfacePrintableY(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSurfaceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  {editingSurface ? 'Salvar Alterações' : 'Cadastrar Superfície'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: NOVO PRODUTO                                              */}
      {/* ================================================================ */}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    Cadastrar Novo Produto
                  </h3>
                  <p className="text-xs text-stone-400">
                    Insira novo item no catálogo de presentes personalizáveis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProductModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="Ex: Copo Térmico 473ml, Prato Raso de Porcelana, Caixa MDF..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white"
                  >
                    <option value="Cerâmica">Cerâmica</option>
                    <option value="Inox & Térmicos">Inox & Térmicos</option>
                    <option value="Inox & Alumínio">Inox & Alumínio</option>
                    <option value="Madeira & Embalagens">Madeira & Embalagens</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Vidro & Cristal">Vidro & Cristal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Preço Base (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={newProdBasePrice}
                    onChange={(e) => setNewProdBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold border border-stone-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={newProdShortDesc}
                  onChange={(e) => setNewProdShortDesc(e.target.value)}
                  placeholder="Descrição dos diferenciais e materiais do produto..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Criar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: ADICIONAR COR AO PRODUTO                                  */}
      {/* ================================================================ */}
      {isColorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-[#FAF8F5]">
              <h3 className="font-bold text-stone-900 text-sm font-serif">Nova Cor de Produto</h3>
              <button
                type="button"
                onClick={() => setIsColorModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddColorSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Cor
                </label>
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Ex: Verde Musgo, Dourado Metálico, Terracota..."
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Selecione a Tonalidade (HEX)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-10 h-10 rounded-xl border-0 cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-mono uppercase border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsColorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C25E48] text-white font-bold text-xs rounded-xl"
                >
                  Adicionar Cor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: CADASTRAR NOVA ARTE COM UPLOAD DE ARQUIVO                 */}
      {/* ================================================================ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-stone-100 bg-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base font-serif">
                    Cadastrar Nova Arte por Arquivo
                  </h3>
                  <p className="text-xs text-stone-400">
                    Envie arquivo SVG ou imagem com fundo transparente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArtwork} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Arquivo da Arte (SVG, PNG, WEBP, JPG)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-[#C25E48] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAF8F5] flex flex-col items-center justify-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/svg+xml,image/png,image/jpeg,image/jpg,image/webp,.svg"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {newArtFilePreview ? (
                    <div className="space-y-2">
                      <div className="w-20 h-20 mx-auto rounded-xl bg-white border border-stone-200 flex items-center justify-center p-2 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={newArtFilePreview}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 block">
                        Arquivo carregado com sucesso! (Clique para trocar)
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#C25E48]/10 text-[#C25E48] flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-stone-800">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Ideal: vetor SVG ou PNG com transparência (máx 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome da Arte / Título
                </label>
                <input
                  type="text"
                  value={newArtTitle}
                  onChange={(e) => setNewArtTitle(e.target.value)}
                  placeholder="Ex: Monograma Dourado com Ramos"
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C25E48]/20 focus:border-[#C25E48]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Categoria
                </label>
                <select
                  value={newArtCategory}
                  onChange={(e) => setNewArtCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#C25E48]"
                >
                  {CLIPART_CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Outra">+ Nova Categoria...</option>
                </select>

                {newArtCategory === 'Outra' && (
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    placeholder="Digite o nome da nova categoria..."
                    className="w-full mt-2 px-3 py-2 text-xs border border-stone-200 rounded-xl focus:outline-none focus:border-[#C25E48]"
                    required
                  />
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Disponibilizar na Loja (Ativo / Desativado)
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {newArtIsActive
                      ? 'Visível imediatamente para clientes no configurador'
                      : 'Oculto na loja (ficará arquivado no painel admin)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setNewArtIsActive(!newArtIsActive)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                    newArtIsActive ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform flex items-center justify-center text-[10px] font-black ${
                      newArtIsActive ? 'translate-x-6 text-emerald-600' : 'translate-x-0 text-stone-400'
                    }`}
                  >
                    {newArtIsActive ? '✓' : '✕'}
                  </div>
                </button>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {uploadError}
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C25E48] hover:bg-[#A94A36] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                >
                  Salvar e Disponibilizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL: MONTADOR DE FOLHA A3 DTF UV (300 DPI)                     */}
      {/* ================================================================ */}
      {isA3ModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-[#FAF8F5] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C25E48] text-white flex items-center justify-center shadow-xs">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-stone-900 text-base sm:text-lg font-serif">
                      Montador A3 para Gráfica
                    </h3>
                    <span className="text-[10px] font-bold bg-[#C25E48]/10 text-[#C25E48] px-2 py-0.5 rounded-full border border-[#C25E48]/20">
                      A3 • 300 PPI
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    Formato A3 ({a3Config.orientation === 'portrait' ? '297 × 420' : '420 × 297'} mm • {a3Config.orientation === 'portrait' ? '3508 × 4961' : '4961 × 3508'} px) • arquivo transparente em escala 1:1 para envio à gráfica
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsA3ModalOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F7F5F0]">
              {/* COLUNA ESQUERDA: VISUALIZADOR DA FOLHA A3 */}
              <div className="lg:col-span-7 flex flex-col gap-3">
                {/* Visualizer Header Bar */}
                <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  {/* Paginação de Folhas */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={a3SelectedSheet <= 0}
                      onClick={() => setA3SelectedSheet((s) => Math.max(0, s - 1))}
                      className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Folha anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-stone-800">
                      Folha {packingResult.totalSheets > 0 ? a3SelectedSheet + 1 : 0} de {packingResult.totalSheets}
                    </span>
                    <button
                      type="button"
                      disabled={a3SelectedSheet >= packingResult.totalSheets - 1}
                      onClick={() => setA3SelectedSheet((s) => Math.min(packingResult.totalSheets - 1, s + 1))}
                      className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title="Próxima folha"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Aproveitamento do Filme */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-500 font-medium">Aproveitamento total:</span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        packingResult.utilizationPercentage >= 70
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : packingResult.utilizationPercentage >= 35
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-stone-100 text-stone-600 border border-stone-300'
                      }`}
                    >
                      {packingResult.utilizationPercentage}% utilizado
                    </span>
                  </div>
                </div>

                {/* Container do Canvas A3 com Proporção Real */}
                <div className="bg-stone-800/90 p-4 sm:p-6 rounded-3xl border border-stone-700 shadow-inner flex items-center justify-center min-h-[480px]">
                  <div
                    className={`relative bg-white shadow-2xl rounded-sm transition-all duration-300 select-none overflow-hidden ${
                      a3Config.orientation === 'portrait'
                        ? 'w-full max-w-[380px] aspect-[297/420]'
                        : 'w-full max-w-[500px] aspect-[420/297]'
                    }`}
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                      `,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    {/* Borda da Margem de Segurança (5mm padrão) */}
                    <div
                      className="absolute border border-dashed border-rose-300 pointer-events-none z-10"
                      style={{
                        top: `${(a3Config.marginMm / packingResult.sheetHeightMm) * 100}%`,
                        bottom: `${(a3Config.marginMm / packingResult.sheetHeightMm) * 100}%`,
                        left: `${(a3Config.marginMm / packingResult.sheetWidthMm) * 100}%`,
                        right: `${(a3Config.marginMm / packingResult.sheetWidthMm) * 100}%`,
                      }}
                    >
                      <span className="absolute top-1 left-1 text-[8px] font-mono text-rose-500 bg-white/80 px-1 rounded">
                        Margem {a3Config.marginMm}mm
                      </span>
                    </div>

                    {/* Adesivos Posicionados na Folha Selecionada */}
                    {packingResult.placedItems
                      .filter((item) => item.sheetIndex === a3SelectedSheet)
                      .map((item, idx) => {
                        const leftPct = (item.xMm / packingResult.sheetWidthMm) * 100;
                        const topPct = (item.yMm / packingResult.sheetHeightMm) * 100;
                        const widthPct = (item.widthMm / packingResult.sheetWidthMm) * 100;
                        const heightPct = (item.heightMm / packingResult.sheetHeightMm) * 100;

                        return (
                          <div
                            key={item.id || idx}
                            className="absolute border border-stone-400/60 bg-white/40 hover:bg-white/70 transition-all hover:border-[#C25E48] hover:z-20 group"
                            style={{
                              left: `${leftPct}%`,
                              top: `${topPct}%`,
                              width: `${widthPct}%`,
                              height: `${heightPct}%`,
                            }}
                          >
                            {/* Cruzetas de Corte Sutis (Cantos) */}
                            {a3Config.showCutMarks && (
                              <>
                                <span className="absolute -top-1 -left-1 text-[9px] leading-none text-stone-500 font-mono select-none pointer-events-none">
                                  +
                                </span>
                                <span className="absolute -top-1 -right-1 text-[9px] leading-none text-stone-500 font-mono select-none pointer-events-none">
                                  +
                                </span>
                                <span className="absolute -bottom-1 -left-1 text-[9px] leading-none text-stone-500 font-mono select-none pointer-events-none">
                                  +
                                </span>
                                <span className="absolute -bottom-1 -right-1 text-[9px] leading-none text-stone-500 font-mono select-none pointer-events-none">
                                  +
                                </span>
                              </>
                            )}

                            {/* Conteúdo Visual / Preview */}
                            <div className="w-full h-full p-0.5 flex flex-col items-center justify-center overflow-hidden">
                              {item.previewUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.previewUrl}
                                  alt={item.surfaceName}
                                  className="w-full h-full object-contain filter drop-shadow-xs"
                                />
                              ) : (
                                <div className="text-center p-1">
                                  <Sparkles className="w-3.5 h-3.5 mx-auto text-[#C25E48]" />
                                  <span className="text-[7px] text-stone-600 block truncate">
                                    {item.surfaceName}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Etiqueta Discreta de Produção */}
                            {a3Config.showLabels && (
                              <div className="absolute bottom-0.5 left-0.5 right-0.5 bg-black/75 backdrop-blur-xs text-white rounded px-1 py-0.5 text-[7px] font-mono flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                                <span className="truncate">{item.orderNumber}</span>
                                <span className="shrink-0">{item.widthMm}×{item.heightMm}mm</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {/* Estado Vazio no Canvas */}
                    {packingResult.placedItems.filter((i) => i.sheetIndex === a3SelectedSheet).length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-stone-400">
                        <LayoutGrid className="w-10 h-10 mb-2 stroke-1 text-stone-300" />
                        <span className="text-xs font-bold text-stone-500">Folha A3 Vazia</span>
                        <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">
                          Adicione adesivos dos pedidos na fila lateral para montar a chapa de impressão.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rodapé do Visualizador */}
                <div className="text-[11px] text-stone-500 flex items-center justify-between px-2">
                  <span>
                    Margem: <strong>{a3Config.marginMm}mm</strong> • Espaçamento: <strong>{a3Config.spacingMm}mm</strong>
                  </span>
                  <span>
                    Adesivos nesta folha:{' '}
                    <strong>
                      {packingResult.placedItems.filter((i) => i.sheetIndex === a3SelectedSheet).length}
                    </strong>
                  </span>
                </div>
              </div>

              {/* COLUNA DIREITA: CONFIGURAÇÕES & FILA DE ADESIVOS */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {/* 1. Configurações da Folha */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#C25E48]" />
                    Parâmetros de Impressão DTF UV
                  </h4>

                  {/* Orientação */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1.5">
                      Orientação da Folha A3
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setA3Config((c) => ({ ...c, orientation: 'portrait' }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          a3Config.orientation === 'portrait'
                            ? 'bg-[#C25E48] text-white border-[#C25E48] shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Retrato (297 × 420 mm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setA3Config((c) => ({ ...c, orientation: 'landscape' }))}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          a3Config.orientation === 'landscape'
                            ? 'bg-[#C25E48] text-white border-[#C25E48] shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Paisagem (420 × 297 mm)
                      </button>
                    </div>
                  </div>

                  {/* Margem e Espaçamento */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Margem externa
                      </label>
                      <select
                        value={a3Config.marginMm}
                        onChange={(e) =>
                          setA3Config((c) => ({ ...c, marginMm: Number(e.target.value) }))
                        }
                        className="w-full text-xs font-semibold p-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-[#C25E48]"
                      >
                        <option value={3}>3 mm (Mínima)</option>
                        <option value={5}>5 mm (Padrão)</option>
                        <option value={8}>8 mm</option>
                        <option value={10}>10 mm (Segura)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Espaço de Corte
                      </label>
                      <select
                        value={a3Config.spacingMm}
                        onChange={(e) =>
                          setA3Config((c) => ({ ...c, spacingMm: Number(e.target.value) }))
                        }
                        className="w-full text-xs font-semibold p-2 rounded-xl border border-stone-200 bg-stone-50 focus:outline-none focus:border-[#C25E48]"
                      >
                        <option value={3}>3 mm</option>
                        <option value={5}>5 mm (Padrão)</option>
                        <option value={8}>8 mm</option>
                        <option value={10}>10 mm</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles: Cut Marks e Labels */}
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    <label className="flex items-center justify-between text-xs text-stone-700 cursor-pointer">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Scissors className="w-3.5 h-3.5 text-stone-400" />
                        Cruzetas de Corte nos Cantos
                      </span>
                      <input
                        type="checkbox"
                        checked={a3Config.showCutMarks}
                        onChange={(e) =>
                          setA3Config((c) => ({ ...c, showCutMarks: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#C25E48] rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs text-stone-700 cursor-pointer">
                      <span className="flex items-center gap-1.5 font-medium">
                        <FileImage className="w-3.5 h-3.5 text-stone-400" />
                        Identificação do Pedido / Medidas
                      </span>
                      <input
                        type="checkbox"
                        checked={a3Config.showLabels}
                        onChange={(e) =>
                          setA3Config((c) => ({ ...c, showLabels: e.target.checked }))
                        }
                        className="w-4 h-4 accent-[#C25E48] rounded cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* 2. Fila de Adesivos DTF UV */}
                <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex-1 flex flex-col min-h-[220px]">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div>
                      <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Fila de Impressão ({a3Queue.reduce((acc, i) => acc + i.quantity, 0)} itens)
                      </h4>
                      <span className="text-[10px] text-stone-400">
                        {a3Queue.length} tipo(s) de arte agrupado(s)
                      </span>
                    </div>

                    {a3Queue.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setA3Queue([])}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar Fila
                      </button>
                    )}
                  </div>

                  {/* Lista de Itens na Fila */}
                  <div className="flex-1 overflow-y-auto max-h-[200px] divide-y divide-stone-100 py-1">
                    {a3Queue.length === 0 ? (
                      <div className="py-8 text-center text-stone-400 space-y-1">
                        <p className="text-xs">Nenhum adesivo na fila de impressão.</p>
                        <p className="text-[11px] text-stone-500">
                          Selecione um pedido na aba de Pedidos e clique em <strong>&ldquo;Montar Folha A3&rdquo;</strong> ou adicione superfícies com <strong>&ldquo;+ Fila A3&rdquo;</strong>.
                        </p>
                      </div>
                    ) : (
                      a3Queue.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.previewUrl && (
                              <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 p-0.5 shrink-0 flex items-center justify-center">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.previewUrl}
                                  alt={item.surfaceName}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-stone-900 block truncate">
                                {item.orderNumber} • {item.surfaceName}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono block">
                                {item.widthMm} × {item.heightMm} mm ({item.customerName})
                              </span>
                            </div>
                          </div>

                          {/* Quantidade e Remover */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50">
                              <button
                                type="button"
                                onClick={() => handleUpdateQueueQuantity(item.id, -1)}
                                className="px-2 py-1 text-stone-600 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                                title="Diminuir"
                              >
                                -
                              </button>
                              <span className="px-2.5 py-1 text-xs font-black text-stone-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQueueQuantity(item.id, 1)}
                                className="px-2 py-1 text-stone-600 hover:bg-stone-200 text-xs font-bold cursor-pointer"
                                title="Aumentar"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveFromQueue(item.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Remover da fila"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Ação Principal de Exportação */}
                <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium">Resolução de Saída:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {a3Config.orientation === 'portrait' ? '3508 × 4961' : '4961 × 3508'} px (300 DPI)
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Arquivo PNG A3 transparente, em escala 1:1. Confirme com a gráfica se ela exige margem, marcas de corte ou outro formato antes do envio.
                  </p>

                  <button
                    type="button"
                    disabled={isExportingA3 || packingResult.placedItems.length === 0}
                    onClick={handleExportCurrentA3Sheet}
                    className="w-full py-3.5 bg-gradient-to-r from-[#C25E48] to-[#9c3924] hover:from-[#d16a53] hover:to-[#a9432e] text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isExportingA3 ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Renderizando Folha A3 (300 DPI)...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>
                          Baixar A3 para Gráfica #{a3SelectedSheet + 1}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
