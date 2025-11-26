import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeProducts as initialProducts } from '../data/storeProducts';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('storeProducts');
        if (savedProducts) {
            const parsedSaved = JSON.parse(savedProducts);
            // Merge logic: Add any products from initialProducts that are not in parsedSaved
            const savedIds = new Set(parsedSaved.map(p => p.id));
            const newProducts = initialProducts.filter(p => !savedIds.has(p.id));
            return [...parsedSaved, ...newProducts];
        }
        return initialProducts;
    });

    useEffect(() => {
        localStorage.setItem('storeProducts', JSON.stringify(products));
    }, [products]);

    const addProduct = (product) => {
        setProducts(prev => {
            const newId = Math.max(...prev.map(p => p.id), 0) + 1;
            return [...prev, { ...product, id: newId }];
        });
    };

    const deleteProduct = (productId) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const updateProductPrice = (productId, newPrice) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, price: Number(newPrice) } : p
        ));
    };

    return (
        <StoreContext.Provider value={{
            products,
            addProduct,
            deleteProduct,
            updateProductPrice
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
