import supabase from "../utils/supabase"
import { useEffect, useState } from "react"
import ProductCard from "../components/ProductCard";

export default function Products() {
    const [products, setProducts] = useState([]);
    useEffect(() => {
        async function getProducts() {
            const { data, error } = await supabase.from("products").select('*')
            if (error) {
                console.error(error)
            }
            console.log(data)
            setProducts(data)
        }
        getProducts()
    }, [])
    return (
        <div>
            <h1 className="text-xl flex justify-center">Продукти</h1>
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}