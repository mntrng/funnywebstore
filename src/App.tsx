
import { Container, Segment, Menu, Message, Icon } from "semantic-ui-react";
import React, { useState } from 'react';
import './App.css';
import ProductListPage from './components/ProductListPage';
import { useFetchData } from './hooks/useFetchData';

const App: React.FC = () => {

  const [page, setPage] = useState<string>('home');
  const { productLoading, stockLoading, productData, stockData, error } = useFetchData();

  return (
        <Container className="App">
          <Segment inverted style={{ marginBottom: 25 }}>
            <Menu inverted secondary>
              <Menu.Item
                name='home'
                active={page === 'home'}
                onClick={() => {setPage('home');}}
              />
              <Menu.Item
                name='gloves'
                active={page === 'gloves'}
                onClick={() => {setPage('gloves');}}
              />
              <Menu.Item
                name='face masks'
                active={page === 'facemasks'}
                onClick={() => {setPage('facemasks');}}
              />
              <Menu.Item
                name='beanies'
                active={page === 'beanies'}
                onClick={() => {setPage('beanies');}}
              />
            </Menu>
          </Segment>

          {productLoading && stockLoading && <Message icon>
                        <Icon name='circle notched' loading />
                          <Message.Content>
                            <Message.Header>Just one second</Message.Header>
                              Fetching the content from another universe for youuuu <Icon name='paw'/>
                          </Message.Content>
                      </Message>}

          {page === 'gloves' && stockData && <ProductListPage productData = { productData?.gloves } 
                                                        productLoading = { productLoading } 
                                                        stockLoading = { stockLoading } 
                                                        stockData = { stockData }/>}
          {page === 'facemasks' && stockData && <ProductListPage productData = { productData?.facemasks } 
                                                        productLoading = { productLoading } 
                                                        stockLoading = { stockLoading } 
                                                        stockData = { stockData }/>}
          {page === 'beanies' && stockData && <ProductListPage productData = { productData?.beanies } 
                                                        productLoading = { productLoading } 
                                                        stockLoading = { stockLoading } 
                                                        stockData = { stockData }/>}

          {error && <Message negative>
                      Oops! There is an error. We are working on this...
                    </Message>}
      </Container>
  );
};

export default App;