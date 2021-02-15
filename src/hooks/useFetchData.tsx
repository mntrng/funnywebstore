/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { productList, baseProductURL, baseAvailabilityURL } from "../constants";
import { Product, ProductData, StockInfo } from "../types";

interface ProductResponseProps {
    loading: boolean
    productData: ProductData | undefined
    stockData: Map<string, StockInfo> | undefined
    error: boolean
}

export const useFetchData = (): ProductResponseProps => {
    const [error, setError] = useState(false);
    const [productData, setProductData] = useState<ProductData | undefined>(undefined);
    const [stockData, setStockData] = useState<Map<string, StockInfo>>();
    const [loading, setLoading] = useState(true);
    const productPromises: Promise<AxiosResponse>[] = [];
    let   stockPromises: Promise<AxiosResponse>[] = [];
    const dataArray: Product[][] = [];
    const stockArray: StockInfo[][] = [];
    let   brands = new Set<string>();
    // const config = {
    //     headers: { 'x-force-error-mode': 'all'}
    // };

    useEffect(() => {
        const fetchData = async () => {
            
            for (let i = 0; i < productList.length; i++) {
                productPromises.push(axios.get<Product[]>(`${baseProductURL}/${productList[i]}`));
            }

            try {
                const response = await axios.all(productPromises);
                Object.values(response).forEach(obj => {
                    dataArray.push(obj.data);
                });
                setProductData({
                    gloves: response[0].data,
                    faceMasks: response[1].data,
                    beanies: response[2].data
                });
                
                if (dataArray.length > 0) {
                    brands = await getBrands(dataArray);
                }
                
                // Refetches stock data for requests that return faulty results
                while (brands.size > 0) {
                    await prepareStockData(brands);
                }
                
                const mergedStockArray = stockArray.flat(1);
                // Creates a map of availability data for faster searching
                const stockMap = new Map(mergedStockArray.map(stock => [stock.id.toLowerCase(), stock]));
                setStockData(stockMap);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
                console.log(error);
            }
        };

        void fetchData();
    }, []);

    // Extracts brand names from data fetched from the product API because the API sends different brand names each time
    const getBrands = (data: Product[][]): Promise<Set<string>> => {
        data.forEach(element => {
            for (let i = 0; i < element.length; i++) {
                brands.add(element[i].manufacturer);
            }
        });

        return new Promise(resolve => {
            resolve(brands);
        });
    };
    
    const checkResponse = (response: StockInfo[] | string): boolean => {
        if (typeof response === 'string') {
            return false;
        }
        return true;
    };

    const prepareStockData = async (brands: Set<string>): Promise<void> => {
        stockPromises = [];
        brands.forEach(brand => {
            stockPromises.push(axios.get<StockInfo[]>(`${baseAvailabilityURL}/${brand}`));
        });

        const response_ = await axios.all(stockPromises);
        response_.forEach(res => {
            if (checkResponse(res.data.response) && res.config.url) {
                stockArray.push(res.data.response);
                brands.delete(res.config.url.substring(91));
            }
        });
    };

    return { loading, productData, stockData, error };
};