/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from "axios";
import { useEffect, useState } from "react";
import { baseProductURL, baseAvailabilityURL } from "../constants";
import { ProductData, StockInfo } from "../types";

interface ProductResponseProps {
    productLoading: boolean
    stockLoading: boolean
    productData: ProductData | undefined
    stockData: Map<string, StockInfo> | undefined
    error: boolean
}

export const useFetchData = (): ProductResponseProps => {
    const [error, setError] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>(undefined);
    const [stockData, setStockData] = useState<Map<string, StockInfo>>();
    const [productLoading, setProductLoading] = useState(true);
    const [stockLoading, setStockLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const { data: products } = await axios.get<ProductData>(baseProductURL);
                setProductData(products);
                setProductLoading(false);
            } catch (error) {
                setError(true);
                setProductLoading(false);
                console.log(error);
            }
        };

        const fetchStockData = async () => {
            try {
                const { data: availabilityData } = await axios.get<StockInfo[]>(baseAvailabilityURL);

                // Creates a map of availability data for faster searching
                const stockMap = new Map(availabilityData.map(stock => [stock.id.toLowerCase(), stock]));
                setStockData(stockMap);
                setStockLoading(false);
            } catch (error) {
                setError(true);
                setStockLoading(false);
                console.log(error);
            }
        };

        void fetchProductData();
        void fetchStockData();
    }, []);

    return { productLoading, stockLoading, productData, stockData, error };
};