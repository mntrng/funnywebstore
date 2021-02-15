import React from 'react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Product, StockInfo } from '../../types';
import IndividualProduct from '../IndividualProduct';

interface ProductDataProps {
    productData: Product[] | undefined
    loading: boolean
    stockData: Map<string, StockInfo>
}

const ProductListPage: React.FC<ProductDataProps> = ({ productData, loading, stockData }) => {

    if (productData && !loading) {
        const Row = (props: ListChildComponentProps) => {
            const { index, style } = props;
            const stockInfo = stockData.get(productData[index].id);
            return (
                <div>
                    {stockInfo && <IndividualProduct product={ productData[index] } style={ style } stockInfo = { stockInfo?.DATAPAYLOAD }/>}
                </div>
            );
        };
    
        return (
            <div>
                <FixedSizeList
                    height={800}
                    width={'auto'}
                    itemSize={70}
                    itemCount={productData.length}
                    overscanCount={10}
                >
                    {Row}
                </FixedSizeList>
            </div>
        );
    } else {
        return null;
    }
};

export default ProductListPage;