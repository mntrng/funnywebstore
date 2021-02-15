/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-regexp-exec */
import React from 'react';
import { Product } from '../../types';
import { Label, List, SemanticCOLORS } from "semantic-ui-react";

interface IndividualProductProps {
    product: Product
    style: React.CSSProperties
    stockInfo: string
}

const IndividualProduct: React.FC<IndividualProductProps> = ({ product, style, stockInfo }) => {
    const regex = /(?<=<INSTOCKVALUE>)(.*)(?=<\/INSTOCKVALUE>)/g;
    const stockColor = (stockInfo: string): SemanticCOLORS => {
        if (stockInfo === 'OUTOFSTOCK') {
            return 'red';
        } else if (stockInfo === 'LESSTHAN10') {
            return 'orange';
        } else {
            return 'green';
        }
    };

    return (
        <List selection celled size='large'>
            <List.Item key={product.id} style={style}>
                <List.Content>
                    <Label>{ product.name }</Label> <Label color={stockColor(stockInfo.match(regex)![0])}>{ stockInfo.match(regex)![0] }</Label>
                    <article>Price: { product.price }€ | Manufacturer: { product.manufacturer } <br/>
                    Available Color: { product.color.map(color => (<Label key={color} className={color}/>)) }
                    </article>
                </List.Content>
            </List.Item>
        </List>
    );
};

export default IndividualProduct;