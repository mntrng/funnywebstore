export interface Product {
    id: string,
    type: string,
    name: string,
    color: string[],
    price: number,
    manufacturer: string
}

export interface StockInfo {
    id: string,
    DATAPAYLOAD: string
}

export interface ProductData {
    gloves: Product[]
    facemasks: Product[]
    beanies: Product[]
}