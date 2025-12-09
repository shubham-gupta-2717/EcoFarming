import React, { createContext, useContext, useState, useEffect } from 'react';
import { storeProducts as initialProducts } from '../data/storeProducts';
import { db } from '../config/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    writeBatch
} from 'firebase/firestore';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(true);

    // Sync with Firestore
    useEffect(() => {
        const productsRef = collection(db, 'store_products');

        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            if (snapshot.empty) {
                // If DB is empty, we can choose to seed it, or just show initialProducts locally.
                // However, to ensure everyone sees the same thing, we should probably seed it once.
                // For now, let's just keep using initialProducts but NOT overwrite them repeatedly.
                // Better approach: If empty, we wait for an explicit seed action or just show default.
                // Let's seed automatically if empty to preserve existing behavior for the user.
                seedProducts(initialProducts);
            } else {
                const firebaseProducts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(firebaseProducts);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error syncing products:", error);
            // Fallback to local initial products if error (e.g. offline)
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to seed initial data
    const seedProducts = async (data) => {
        try {
            // Check if we are really empty again to avoid race conditions
            // Ideally this should be a script, but for this task we do it here.
            // We'll trust the snapshot.empty for now.
            // Using batch to write all at once
            const batch = writeBatch(db);
            const productsRef = collection(db, 'store_products');

            data.forEach(product => {
                // We let Firestore generate IDs to avoid numeric ID clashes
                const newDocRef = doc(productsRef);
                // Remove the numeric ID from the object we save, use Firestore's ID
                const { id, ...productData } = product;
                batch.set(newDocRef, productData);
            });

            await batch.commit();
            console.log("Seeded initial products to Firestore");
        } catch (error) {
            console.error("Error seeding products:", error);
        }
    };

    const addProduct = async (product) => {
        try {
            // Remove numeric ID if present, let Firestore handle it
            const { id, ...productData } = product;
            await addDoc(collection(db, 'store_products'), productData);
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const deleteProduct = async (productId) => {
        try {
            await deleteDoc(doc(db, 'store_products', productId));
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    };

    const updateProductPrice = async (productId, newPrice) => {
        try {
            const productRef = doc(db, 'store_products', productId);
            await updateDoc(productRef, {
                price: Number(newPrice)
            });
        } catch (error) {
            console.error("Error updating price:", error);
            throw error;
        }
    };

    return (
        <StoreContext.Provider value={{
            products,
            loading,
            addProduct,
            deleteProduct,
            updateProductPrice
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => useContext(StoreContext);
