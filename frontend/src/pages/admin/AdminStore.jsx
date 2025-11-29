import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';

import { categories as storeCategories } from '../../data/storeProducts';

const AdminStore = () => {
    const { products, addProduct, deleteProduct, updateProductPrice } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'seeds',
        price: '',
        image: '',
        description: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [editPrice, setEditPrice] = useState('');

    // Filter categories to only show Seeds and Equipment
    const categories = storeCategories.filter(c => ['seeds', 'equipment'].includes(c.id));

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return;

        addProduct({
            ...newProduct,
            price: Number(newProduct.price),
            // Use a placeholder if no image provided
            image: newProduct.image || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400'
        });
        setIsAdding(false);
        setNewProduct({ name: '', category: 'seeds', price: '', image: '', description: '' });
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        setEditPrice(product.price);
    };

    const saveEdit = (id) => {
        updateProductPrice(id, editPrice);
        setEditingId(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700"
                    >
                        <Plus size={20} /> Add Product
                    </button>
                </div>

                {isAdding && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={newProduct.category}
                                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={newProduct.image}
                                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full p-2 border rounded-lg"
                                    rows="3"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Product</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Category</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Price</th>
                                <th className="px-6 py-3 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {products
                                .filter(p => ['seeds', 'equipment'].includes(p.category))
                                .map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs capitalize">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === product.id ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        value={editPrice}
                                                        onChange={e => setEditPrice(e.target.value)}
                                                        className="w-20 p-1 border rounded"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="font-medium text-gray-900">₹{product.price}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {editingId === product.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEdit(product.id)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            title="Save"
                                                        >
                                                            <Save size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                                                            title="Cancel"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(product)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Edit Price"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteProduct(product.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStore;
