"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import {
  PackageSearch, Save, RefreshCw, Trash2, DollarSign,
  Plus, X, Package, Printer
} from "lucide-react";

type ProductVariant = {
  hex: string;
  images: string[];
  sizes_stock: Record<string, number>;
};

type Product = {
  id: string;
  name: string;
  price: number;
  wholesale_price: number;
  category_id: string;
  variants: ProductVariant[];
  stock_count: number;
  sizes: string[];
};

type Category = {
  id: string;
  name: string;
};

type FlattenedRow = {
  productId: string;
  productName: string;
  price: number;
  wholesalePrice: number;
  variantHex: string;
  size: string;
  quantity: number;
};

// ── Add Stock Modal ─────────────────────────────────────────────────────────
function AddStockModal({
  products,
  onClose,
  onSuccess,
}: {
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const supabase = createClient();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [wholesalePrice, setWholesalePrice] = useState(0);
  const [saving, setSaving] = useState(false);

  const availableColors = selectedProduct?.variants?.map(v => v.hex) || [];
  const availableSizes = selectedProduct?.sizes || [];

  const handleSave = async () => {
    if (!selectedProduct || !selectedColor || !selectedSize || quantity <= 0) {
      return alert("يرجى تعبئة جميع الحقول المطلوبة.");
    }

    setSaving(true);
    try {
      // Deep copy product data
      const productData: Product = JSON.parse(JSON.stringify(selectedProduct));

      // Find or create the variant
      let variantIndex = productData.variants.findIndex(v => v.hex === selectedColor);
      if (variantIndex === -1) {
        // Create new variant
        productData.variants.push({
          hex: selectedColor,
          images: [],
          sizes_stock: { [selectedSize]: quantity },
        });
        variantIndex = productData.variants.length - 1;
      } else {
        // Add to existing stock
        const currentQty = productData.variants[variantIndex].sizes_stock[selectedSize] || 0;
        productData.variants[variantIndex].sizes_stock[selectedSize] = currentQty + quantity;
      }

      // Recalculate total stock
      let totalStock = 0;
      productData.variants.forEach(v => {
        Object.values(v.sizes_stock).forEach(s => {
          totalStock += Number(s) || 0;
        });
      });

      // Update product
      const { error } = await supabase.from("products").update({
        variants: productData.variants,
        stock_count: totalStock,
        wholesale_price: wholesalePrice > 0 ? wholesalePrice : selectedProduct.wholesale_price,
        colors: productData.variants.map(v => v.hex),
      }).eq("id", selectedProduct.id);

      if (error) throw error;

      alert(`✅ تمت إضافة ${quantity} قطعة بنجاح!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("حدث خطأ: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-bg/80 backdrop-blur-md">
      <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-2xl text-brand-text/30 hover:text-brand-text hover:bg-brand-bg transition-all"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-black text-brand-text uppercase italic tracking-tighter mb-8 flex items-center gap-3">
          <Package size={28} className="text-brand-accent" />
          إضافة دفعة مخزون جديدة
        </h3>

        <div className="space-y-6 relative z-10">
          {/* Product Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">
              اختر المنتج *
            </label>
            <select
              value={selectedProduct?.id || ""}
              onChange={e => {
                const p = products.find(p => p.id === e.target.value) || null;
                setSelectedProduct(p);
                setSelectedColor("");
                setSelectedSize("");
                setWholesalePrice(p?.wholesale_price || 0);
              }}
              className="w-full bg-brand-bg border-2 border-brand-border rounded-2xl p-4 text-brand-text font-black outline-none focus:border-brand-accent transition-all"
            >
              <option value="">اختر المنتج...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">
                  اللون *
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map(hex => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setSelectedColor(hex)}
                      className={`w-10 h-10 rounded-full border-4 transition-all hover:scale-110 ${
                        selectedColor === hex
                          ? "border-brand-accent scale-110 shadow-lg"
                          : "border-brand-border"
                      }`}
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                  {/* Custom color input for new color */}
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      onChange={e => setSelectedColor(e.target.value)}
                      className="w-10 h-10 rounded-full cursor-pointer border-2 border-dashed border-brand-border p-0.5 bg-transparent"
                      title="لون جديد"
                    />
                    <span className="text-[9px] font-black text-brand-text/30 uppercase tracking-widest">لون جديد</span>
                  </div>
                </div>
                {selectedColor && (
                  <p className="text-[10px] font-black text-brand-accent" dir="ltr">{selectedColor}</p>
                )}
              </div>

              {/* Size Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">
                  المقاس *
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest border-2 transition-all hover:scale-105 ${
                        selectedSize === size
                          ? "bg-brand-accent text-brand-bg border-brand-accent"
                          : "bg-brand-bg text-brand-text border-brand-border hover:border-brand-accent/40"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">
                  الكمية المضافة *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity || ""}
                  onChange={e => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-brand-bg border-2 border-brand-border rounded-2xl p-4 text-brand-text font-black text-2xl text-center outline-none focus:border-brand-accent transition-all"
                />
              </div>

              {/* Wholesale Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em]">
                  سعر الجملة للقطعة (ج.م) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={wholesalePrice || ""}
                  onChange={e => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full bg-brand-bg border-2 border-brand-border rounded-2xl p-4 text-brand-text font-black text-xl outline-none focus:border-brand-accent transition-all"
                />
                <p className="text-[9px] font-black text-brand-text/20 uppercase tracking-widest">
                  سيُحدّث سعر الجملة لهذا المنتج في قاعدة البيانات
                </p>
              </div>

              {/* Preview Capital */}
              {quantity > 0 && wholesalePrice > 0 && (
                <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-2xl p-4 flex items-center gap-4">
                  <DollarSign size={20} className="text-brand-accent shrink-0" />
                  <div>
                    <p className="text-[9px] font-black text-brand-accent/60 uppercase tracking-widest">
                      رأس المال المضاف
                    </p>
                    <p className="font-black text-brand-accent text-xl">
                      {(quantity * wholesalePrice).toLocaleString()} ج.م
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action */}
          <button
            onClick={handleSave}
            disabled={saving || !selectedProduct || !selectedColor || !selectedSize || quantity <= 0}
            className="w-full btn-melt py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
          >
            {saving ? (
              <><RefreshCw size={18} className="animate-spin" /> جاري الحفظ...</>
            ) : (
              <><Plus size={18} /> إضافة الدفعة للمستودع</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Warehouse Dashboard ────────────────────────────────────────────────
export default function WarehouseDashboard() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [editedProducts, setEditedProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: cData, error: cErr } = await supabase
        .from("categories").select("id, name");
      if (cErr) throw cErr;
      if (cData) setCategories(cData);

      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("id, name, price, wholesale_price, category_id, variants, stock_count, sizes");
      if (pErr) throw pErr;
      if (pData) {
        setProducts(pData);
        const initialEdits: Record<string, Product> = {};
        pData.forEach(p => {
          initialEdits[p.id] = JSON.parse(JSON.stringify(p));
        });
        setEditedProducts(initialEdits);
      }
    } catch (err: any) {
      console.error("Warehouse fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = (productId: string, variantHex: string, size: string, newStock: string) => {
    const value = parseInt(newStock) || 0;
    setEditedProducts(prev => {
      const p = { ...prev[productId] };
      const vIndex = p.variants.findIndex(v => v.hex === variantHex);
      if (vIndex !== -1) {
        const newVariants = [...p.variants];
        newVariants[vIndex] = {
          ...newVariants[vIndex],
          sizes_stock: { ...newVariants[vIndex].sizes_stock, [size]: value }
        };
        p.variants = newVariants;
        let total = 0;
        p.variants.forEach(v => Object.values(v.sizes_stock).forEach(s => { total += Number(s) || 0; }));
        p.stock_count = total;
      }
      return { ...prev, [productId]: p };
    });
  };

  const handlePriceChange = (productId: string, newPrice: string) => {
    const value = parseFloat(newPrice) || 0;
    setEditedProducts(prev => ({ ...prev, [productId]: { ...prev[productId], price: value } }));
  };

  const handleWholesalePriceChange = (productId: string, newPrice: string) => {
    const value = parseFloat(newPrice) || 0;
    setEditedProducts(prev => ({ ...prev, [productId]: { ...prev[productId], wholesale_price: value } }));
  };

  const handleDeleteColor = async (productId: string, variantHex: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا اللون؟ سيتم حذفه فوراً من قاعدة البيانات.")) return;
    try {
      const p = JSON.parse(JSON.stringify(editedProducts[productId])) as Product;
      p.variants = p.variants.filter(v => v.hex !== variantHex);
      let total = 0;
      p.variants.forEach(v => Object.values(v.sizes_stock).forEach(s => { total += Number(s) || 0; }));
      p.stock_count = total;
      setEditedProducts(prev => ({ ...prev, [productId]: p }));
      const { error } = await supabase.from("products").update({
        variants: p.variants,
        stock_count: p.stock_count,
        colors: p.variants.map(v => v.hex),
      }).eq("id", productId);
      if (error) throw error;
    } catch (err: any) {
      alert("حدث خطأ: " + (err?.message || "خطأ غير معروف"));
      fetchData();
    }
  };

  const saveProduct = async (productId: string) => {
    setSavingProductId(productId);
    try {
      const p = editedProducts[productId];
      const { error } = await supabase.from("products").update({
        price: p.price,
        wholesale_price: p.wholesale_price,
        variants: p.variants,
        stock_count: p.stock_count,
      }).eq("id", productId);
      if (error) throw error;
    } catch (err: any) {
      alert("حدث خطأ أثناء الحفظ: " + (err?.message || "خطأ غير معروف"));
    } finally {
      setSavingProductId(null);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const reportDate = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    let rows = '';
    let totalUnitsCount = 0;
    let totalCapitalValue = 0;
    let totalRetailValue2 = 0;

    categories.forEach(category => {
      const catProducts = products.filter(p => p.category_id === category.id);
      if (catProducts.length === 0) return;

      rows += `<tr><td colspan="7" style="background:#f0f6fc;font-weight:900;font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:10px 14px;color:#888;">${category.name}</td></tr>`;

      catProducts.forEach(product => {
        const currentEdit = editedProducts[product.id];
        if (!currentEdit?.variants?.length) return;
        currentEdit.variants.forEach(variant => {
          Object.keys(variant.sizes_stock || {}).forEach(size => {
            const qty = Number(variant.sizes_stock[size]) || 0;
            const wholesale = currentEdit.wholesale_price || 0;
            const retail = currentEdit.price || 0;
            totalUnitsCount += qty;
            totalCapitalValue += qty * wholesale;
            totalRetailValue2 += qty * retail;
            rows += `
              <tr>
                <td>${currentEdit.name}</td>
                <td><div style="width:18px;height:18px;border-radius:50%;background:${variant.hex};display:inline-block;vertical-align:middle;margin-left:6px;border:1px solid #ccc;"></div></td>
                <td>${size}</td>
                <td style="font-weight:900;font-size:16px;">${qty}</td>
                <td>${wholesale.toLocaleString()} ج.م</td>
                <td>${retail.toLocaleString()} ج.م</td>
                <td style="color:#1a7f3c;font-weight:900;">${(qty * wholesale).toLocaleString()} ج.م</td>
              </tr>
            `;
          });
        });
      });
    });

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير مخزون مقام - ${reportDate}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; background:#fff; color:#1C1C1C; direction:rtl; }
    .header { background:#1C1C1C; color:#fff; padding:40px; text-align:center; }
    .header h1 { font-size:32px; font-weight:900; letter-spacing:6px; text-transform:uppercase; }
    .header .accent { color:#BCD4E6; }
    .header p { font-size:12px; opacity:0.4; margin-top:8px; letter-spacing:2px; }
    .metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:24px 40px; background:#f5f5f5; }
    .metric { background:#fff; padding:20px; border-radius:12px; text-align:center; border:1px solid #e0e0e0; }
    .metric .label { font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:2px; opacity:0.4; margin-bottom:8px; }
    .metric .value { font-size:24px; font-weight:900; }
    .metric.highlight { background:#1C1C1C; color:#fff; }
    .metric.highlight .value { color:#BCD4E6; }
    .table-section { padding:24px 40px; }
    .table-section h2 { font-size:14px; font-weight:900; letter-spacing:3px; text-transform:uppercase; margin-bottom:12px; padding-bottom:10px; border-bottom:2px solid #f0f0f0; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    thead tr { background:#1C1C1C; color:#fff; }
    thead th { padding:10px 12px; font-weight:800; letter-spacing:1px; text-align:right; font-size:10px; text-transform:uppercase; }
    tbody tr:nth-child(even) { background:#f9f9f9; }
    tbody td { padding:9px 12px; border-bottom:1px solid #eee; }
    .footer { padding:24px 40px; text-align:center; border-top:2px solid #f0f0f0; margin-top:20px; }
    .footer p { font-size:10px; opacity:0.3; letter-spacing:3px; text-transform:uppercase; }
    @media print {
      body { -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .header { background:#1C1C1C !important; -webkit-print-color-adjust:exact; }
      thead tr { background:#1C1C1C !important; -webkit-print-color-adjust:exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>MAQAM <span class="accent">مقام</span></h1>
    <p>تقرير المخزون التفصيلي &bull; ${reportDate}</p>
  </div>
  <div class="metrics">
    <div class="metric highlight">
      <div class="label">رأس المال المحتجز</div>
      <div class="value">${totalCapitalValue.toLocaleString()} ج.م</div>
    </div>
    <div class="metric">
      <div class="label">إجمالي الوحدات</div>
      <div class="value">${totalUnitsCount.toLocaleString()} وحدة</div>
    </div>
    <div class="metric">
      <div class="label">القيمة البيعية</div>
      <div class="value">${totalRetailValue2.toLocaleString()} ج.م</div>
    </div>
  </div>
  <div class="table-section">
    <h2>سجل المخزون التفصيلي</h2>
    <table>
      <thead>
        <tr>
          <th>اسم المنتج</th>
          <th>اللون</th>
          <th>المقاس</th>
          <th>الكمية</th>
          <th>سعر الجملة</th>
          <th>سعر البيع</th>
          <th>رأس مال الصنف</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
  <div class="footer">
    <p>&copy; ${new Date().getFullYear()} MAQAM &bull; تقرير سري &bull; للاستخدام الداخلي فقط</p>
  </div>
  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="animate-spin text-brand-accent" size={48} />
      </div>
    );
  }

  // ── Financial Calculations ──────────────────────────────────────────────
  const totalCapital = Object.values(editedProducts).reduce((sum, p) => {
    return sum + (p.stock_count * (p.wholesale_price || 0));
  }, 0);

  const totalUnits = Object.values(editedProducts).reduce((sum, p) => sum + p.stock_count, 0);

  const totalRetailValue = Object.values(editedProducts).reduce((sum, p) => {
    return sum + (p.stock_count * (p.price || 0));
  }, 0);

  return (
    <>
      {showAddStock && (
        <AddStockModal
          products={products}
          onClose={() => setShowAddStock(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="space-y-10 pb-20">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-brand-text uppercase italic tracking-tighter flex items-center gap-3">
              <PackageSearch className="text-brand-accent" size={40} /> المستودع والمخزون
            </h2>
            <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest mt-2">
              Inventory Ledger • {totalUnits.toLocaleString()} وحدة مخزنة
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handlePrint}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl whitespace-nowrap bg-brand-card border border-brand-border text-brand-text hover:border-brand-accent hover:text-brand-accent"
            >
              <Printer size={20} /> طباعة تقرير
            </button>
            <button
              onClick={() => setShowAddStock(true)}
              className="btn-melt flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl whitespace-nowrap"
            >
              <Plus size={20} /> إضافة دفعة مخزون
            </button>
          </div>
        </div>

        {/* ── Capital Metrics ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Capital Locked */}
          <div className="md:col-span-2 bg-brand-text p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-brand-border/10">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
            <DollarSign size={80} className="absolute -bottom-4 -left-4 opacity-5 text-brand-bg rotate-12" />
            <p className="text-[10px] font-black text-brand-bg/50 uppercase tracking-[0.5em] mb-3 relative z-10">
              إجمالي رأس المال المحتجز في المستودع
            </p>
            <p className="text-5xl font-black text-brand-bg leading-none relative z-10" dir="ltr">
              {totalCapital.toLocaleString()}
              <span className="text-xl opacity-40 font-black ml-3 not-italic uppercase"> ج.م</span>
            </p>
            <p className="text-[9px] font-black text-brand-bg/30 uppercase tracking-widest mt-3 relative z-10">
              الحساب: مجموع (الكمية × سعر الجملة) لكل المنتجات
            </p>
          </div>

          {/* Retail Value */}
          <div className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/5 rounded-full blur-3xl -mr-12 -mt-12" />
            <p className="text-[10px] font-black text-brand-text/40 uppercase tracking-[0.4em] mb-3">القيمة البيعية الإجمالية</p>
            <p className="text-3xl font-black text-brand-text leading-none" dir="ltr">
              {totalRetailValue.toLocaleString()}
              <span className="text-sm opacity-30 ml-2">ج.م</span>
            </p>
            <div className="mt-4 pt-4 border-t border-brand-border">
              <p className="text-[10px] font-black text-brand-text/30 uppercase tracking-widest">هامش الربح المتوقع</p>
              <p className="text-2xl font-black text-green-500 mt-1">
                {(totalRetailValue - totalCapital).toLocaleString()}
                <span className="text-xs opacity-60 ml-1">ج.م</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Inventory Table ─────────────────────────────────────────────── */}
        <div className="bg-brand-card p-10 rounded-[2.5rem] border border-brand-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 bg-brand-accent/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none" />

          <h3 className="text-xl font-black text-brand-text mb-8 uppercase italic tracking-tighter flex items-center gap-3">
            <Package size={24} className="text-brand-accent" /> سجل المخزون التفصيلي
          </h3>

          {products.length === 0 ? (
            <div className="text-center py-16 text-brand-text/20 font-black uppercase tracking-widest text-xs">
              لا توجد منتجات مسجلة في المستودع
            </div>
          ) : (
            <div className="space-y-10">
              {categories.map(category => {
                const catProducts = products.filter(p => p.category_id === category.id);
                if (catProducts.length === 0) return null;

                const rows: FlattenedRow[] = [];
                catProducts.forEach(product => {
                  const currentEdit = editedProducts[product.id];
                  if (!currentEdit?.variants) return;
                  currentEdit.variants.forEach(variant => {
                    Object.keys(variant.sizes_stock || {}).forEach(size => {
                      rows.push({
                        productId: product.id,
                        productName: currentEdit.name,
                        price: currentEdit.price,
                        wholesalePrice: currentEdit.wholesale_price || 0,
                        variantHex: variant.hex,
                        size,
                        quantity: variant.sizes_stock[size],
                      });
                    });
                  });
                });

                if (rows.length === 0) return null;

                return (
                  <div key={category.id}>
                    <h4 className="text-sm font-black text-brand-accent mb-4 uppercase tracking-widest bg-brand-accent/10 inline-block px-4 py-2 rounded-lg">
                      {category.name}
                    </h4>
                    <div className="overflow-x-auto rounded-2xl border-2 border-brand-border">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="bg-brand-bg/50 border-b-2 border-brand-border">
                            {["المنتج", "اللون", "المقاس", "الكمية", "سعر الجملة", "سعر البيع", "الإجراء"].map(h => (
                              <th key={h} className="p-4 text-[10px] font-black text-brand-text/40 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((row, idx) => {
                            const isFirst = rows.findIndex(r => r.productId === row.productId) === idx;
                            const rowSpanCount = rows.filter(r => r.productId === row.productId).length;
                            return (
                              <tr
                                key={`${row.productId}-${row.variantHex}-${row.size}`}
                                className="border-b border-brand-border/40 hover:bg-brand-bg/30 transition-colors"
                              >
                                <td className="p-4 font-bold text-sm text-brand-text whitespace-nowrap">{row.productName}</td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-6 h-6 rounded-full border-2 border-brand-border shadow-sm"
                                      style={{ backgroundColor: row.variantHex }}
                                      title={row.variantHex}
                                    />
                                    {/* Delete color button - only show once per variant group */}
                                    {rows.findIndex(r => r.productId === row.productId && r.variantHex === row.variantHex) === idx && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteColor(row.productId, row.variantHex)}
                                        className="text-brand-text/20 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                                        title="حذف اللون"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 font-black text-sm uppercase text-brand-text/70">{row.size}</td>
                                <td className="p-4">
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.quantity}
                                    onChange={e => handleStockChange(row.productId, row.variantHex, row.size, e.target.value)}
                                    className="w-20 bg-brand-bg border-2 border-brand-border rounded-xl p-2 text-center text-sm font-black text-brand-text focus:border-brand-accent outline-none transition-all"
                                  />
                                </td>
                                {isFirst ? (
                                  <>
                                    <td className="p-4" rowSpan={rowSpanCount}>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editedProducts[row.productId]?.wholesale_price || 0}
                                        onChange={e => handleWholesalePriceChange(row.productId, e.target.value)}
                                        className="w-24 bg-brand-bg border-2 border-brand-border rounded-xl p-2 text-center text-sm font-black text-brand-text focus:border-brand-accent outline-none transition-all"
                                      />
                                    </td>
                                    <td className="p-4" rowSpan={rowSpanCount}>
                                      <input
                                        type="number"
                                        min="0"
                                        value={editedProducts[row.productId]?.price || 0}
                                        onChange={e => handlePriceChange(row.productId, e.target.value)}
                                        className="w-24 bg-brand-bg border-2 border-brand-border rounded-xl p-2 text-center text-sm font-black text-brand-text focus:border-brand-accent outline-none transition-all"
                                      />
                                    </td>
                                    <td className="p-4 text-center" rowSpan={rowSpanCount}>
                                      <button
                                        onClick={() => saveProduct(row.productId)}
                                        disabled={savingProductId === row.productId}
                                        className="bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-brand-bg px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-40 hover:scale-105 active:scale-95 shadow-sm"
                                      >
                                        {savingProductId === row.productId
                                          ? <RefreshCw size={14} className="animate-spin" />
                                          : <Save size={14} />}
                                        حفظ
                                      </button>
                                    </td>
                                  </>
                                ) : null}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
