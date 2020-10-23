import React, { Component } from 'react';
import './App.css';

// Format Number Function
const formatNumber = (number) => new Intl.NumberFormat("en", { minimumFractionDigits: 2 }).format(number);

class App extends Component {

    state = {
        products: null,
        filter: ''
    }

    inputFilterHandler = (event) => {
        this.setState({ filter: event.target.value });
    }

    getAggregatedProducts(products, filter) {
        const totalProducts = {};

        products.forEach((item) => {
            if (filter && new RegExp(filter, 'i').test(item.name) === false) {
                return;
            }

            if (!totalProducts[item.id]) {
                totalProducts[item.id] = { ...item }
            } else {
                totalProducts[item.id].sold += item.sold;
            }
        });

        const totalProductsArray = Object.values(totalProducts);

        totalProductsArray.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));

        return totalProductsArray;
    }

    // Fetch Branch Data Function
    fetchBranchData = (branchName) => {
        return fetch(`api/${branchName}.json`).then(response => response.json());
    }

    componentDidMount() {
        Promise.all([
            this.fetchBranchData('branch1'),
            this.fetchBranchData('branch2'),
            this.fetchBranchData('branch3')
        ]).then(data => {
            this.setState({ products: [...data[0].products, ...data[1].products, ...data[2].products] });
        }).catch(err => console.log('Fetch Error Message: ', err));
    }

    render() {
        if (!this.state.products) {
            return 'Loading...';
        }
        const aggregatedProducts = this.getAggregatedProducts(this.state.products, this.state.filter);
        const total = aggregatedProducts.reduce((total, item) => total + (item.sold * item.unitPrice), 0);
        const table = aggregatedProducts.map(list => {
            return (
                <tr key={list.name}>
                    <td>{list.name}</td>
                    <td>{formatNumber(list.sold * list.unitPrice)}</td>
                </tr>
            )
        });

        return (
            <main className="product-list">
                <label>Search Products</label>
                <input type="text" onChange={this.inputFilterHandler} />
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {table}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total</td>
                            <td>{formatNumber(total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </main>
        );
    }
}

export default App;
